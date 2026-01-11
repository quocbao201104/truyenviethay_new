<template>
  <div class="story-detail-page">
    <AppHeader />

    <main v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải thông tin truyện...</p>
    </main>

    <main v-else-if="error" class="error-container">
      <p class="error-msg">{{ error }}</p>
      <router-link to="/" class="back-link">Quay lại trang chủ</router-link>
    </main>

    <main v-else-if="story" class="detail-container">
      <!-- Story Header/Hero Section -->
      <section class="story-info-section">
        <div class="cover-wrapper">
          <img 
            :src="getImageUrl(story.anh_bia)" 
            :alt="story.ten_truyen" 
            class="story-cover"
            @error="handleImageError"
          >
        </div>

        <div class="info-content">
          <h1 class="story-title">{{ story.ten_truyen }}</h1>
          
          <div class="meta-row">
            <span class="author"><i class="fas fa-user-pen"></i> {{ story.tac_gia }}</span>
            <span class="status-badge">{{ story.trang_thai }}</span>
          </div>

          <div class="stats-row">
            <div class="stat-item">
              <span class="value">{{ story.so_luong_chuong || 0 }}</span>
              <span class="label">Chương</span>
            </div>
            <div class="stat-item">
              <span class="value">{{ story.luot_xem || 0 }}</span>
              <span class="label">Lượt xem</span>
            </div>
            <!-- Add rating/likes if available -->
             <div class="stat-item">
              <span class="value">{{ story.luot_thich || 0 }}</span>
              <span class="label">Lượt Thích</span>
            </div>
          </div>

          <div class="genres-row">
             <span v-for="g in story.genres" :key="g.id_theloai" class="genre-tag">
               {{ g.ten_theloai }}
             </span>
          </div>

        <!-- Corrected Actions Row -->
        <div class="actions-row">
            <router-link v-if="firstChapterSlug" :to="`/chuong/${firstChapterSlug}`" class="btn-read">
                <i class="fas fa-book-open"></i> Đọc Ngay
            </router-link>
            
            <button @click="toggleFollow" class="btn-follow" :class="{ 'followed': isFollowed }">
                <i class="fas" :class="isFollowed ? 'fa-heart' : 'fa-heart-circle-plus'"></i>
                {{ isFollowed ? 'Đang Theo Dõi' : 'Theo Dõi' }}
            </button>
        </div>

        </div>
      </section>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <section class="tab-content">
        <!-- Introduction Tab -->
        <div v-if="currentTab === 'intro'" class="intro-panel">
            <h3 class="panel-title">Giới thiệu</h3>
            <p class="description-text">{{ story.mo_ta }}</p>
        </div>

        <!-- Chapters Tab -->
        <div v-if="currentTab === 'chapters'" class="chapters-panel">
             <h3 class="panel-title">Danh sách chương</h3>
             <!-- Use shared/local component or simple list -->
             <div v-if="chapterLoading" class="text-center py-4">Đang tải chương...</div>
             <div v-else-if="chapters.length === 0" class="text-center py-4 text-gray-400">Chưa có chương nào.</div>
             <div v-else class="chapter-grid">
               <router-link 
                 v-for="chap in chapters" 
                 :key="chap.id" 
                 :to="`/chuong/${chap.slug}`"
                 class="chapter-item"
               >
                 <span class="chap-num">Chương {{ chap.so_chuong }}</span>
                 <span class="chap-title">{{ chap.ten_chuong }}</span>
                 <span class="chap-date">{{ formatDate(chap.created_at || '') }}</span>
               </router-link>
             </div>
        </div>

        <!-- Comments Tab -->
        <div v-if="currentTab === 'comments'" class="comments-panel">
           <CommentList :story-id="story.id" />
        </div>
      </section>

    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStoryStore } from '@/modules/storyText/story.store';
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store';
import { useFavoriteStore } from '@/modules/favorite/favorite.store'; 
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import CommentList from '@/modules/comment/CommentList.vue';

const route = useRoute();
const storyStore = useStoryStore();
const chapterStore = useChapterStore();
const favoriteStore = useFavoriteStore();

const currentTab = ref('intro');
const tabs = [
  { id: 'intro', label: 'Giới Thiệu' },
  { id: 'chapters', label: 'Danh Sách Chương' },
  { id: 'comments', label: 'Bình Luận' },
];

const story = computed(() => storyStore.currentStory);
const loading = computed(() => storyStore.loading);
const error = computed(() => storyStore.error);

const chapters = computed(() => chapterStore.chapterList);
const chapterLoading = computed(() => chapterStore.loading);

const firstChapterSlug = computed(() => {
    if (chapters.value.length > 0) {
        // Assuming chapters are sorted asc by default or logic needs to ensure it
        return chapters.value[0].slug;
    }
    return null;
});

// Follow Logic
const isFollowed = computed(() => {
    if (!story.value) return false;
    // Check if story ID exists in favorite list
    return favoriteStore.favorites.some(f => f.id === story.value.id);
});

const toggleFollow = async () => {
    if (!story.value) return;
    await favoriteStore.toggleFollow(story.value.id);
    if (!favoriteStore.favorites.length) {
         // Optionally refresh favorites if list might be stale
        await favoriteStore.fetchFavorites();
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const handleImageError = (e: Event) => {
    (e.target as HTMLImageElement).src = '/img/default-cover.png';
};

const getImageUrl = (path: string) => {
    if (!path) return '/img/default-cover.png';
    return path.startsWith("http")
        ? path
        : `http://localhost:3000/uploads_img/bia_truyen/${path}`;
};

const fetchData = async () => {
    const slug = route.params.slug as string;
    if (slug) {
        // 1. Fetch Story Detail (We need an API that supports slug or use existing getStoryBySlug)
        // Check story.service.ts for getStoryBySlug
        await storyStore.fetchStoryBySlug(slug); // Verify if this action exists!
        
        if (story.value) {
           await chapterStore.fetchChapterList(story.value.id);
           await favoriteStore.fetchFavorites(); // Sync follow state
        }
    }
};

onMounted(() => {
    fetchData();
});

watch(() => route.params.slug, () => {
    if (route.name === 'StoryDetail') {
        fetchData();
    }
});
</script>

<style scoped>
/* Basic Styles - Detailed styling can be enhanced */
.story-detail-page {
    min-height: 100vh;
    background-color: #1a1d29;
    color: #fff;
    font-family: 'Manrope', sans-serif;
}

.detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.story-info-section {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    background: rgba(255,255,255,0.05);
    padding: 2rem;
    border-radius: 12px;
}

.cover-wrapper {
    flex-shrink: 0;
    width: 200px;
}

.story-cover {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.info-content {
    flex-grow: 1;
}

.story-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #4ade80;
    margin-bottom: 1rem;
}

.meta-row {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 1.5rem;
    color: #ccc;
    font-size: 1.1rem;
}

.status-badge {
    padding: 2px 10px;
    background: #374151;
    border-radius: 4px;
    font-size: 0.9rem;
}

.stats-row {
  display: flex;
  gap: 3rem;
  margin-bottom: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 1rem 0;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-item .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
}

.stat-item .label {
    font-size: 0.9rem;
    color: #9ca3af;
}

.genres-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.genre-tag {
    padding: 4px 12px;
    border: 1px solid #4ade80;
    color: #4ade80;
    border-radius: 20px;
    font-size: 0.9rem;
}

.actions-row {
    display: flex;
    gap: 1rem;
}

.btn-read {
    padding: 10px 24px;
    background: #22c55e;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.2s;
}

.btn-read:hover {
    background: #16a34a;
    transform: translateY(-2px);
}

.btn-follow {
    padding: 10px 24px;
    background: transparent;
    border: 2px solid #ef4444;
    color: #ef4444;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-follow:hover {
    background: rgba(239, 68, 68, 0.1);
}

.btn-follow.followed {
    background: #ef4444;
    color: white;
}

/* Tabs */
.tabs-nav {
    display: flex;
    gap: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 2rem;
}

.tab-btn {
    padding: 1rem 0;
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
}

.tab-btn:hover {
    color: white;
}

.tab-btn.active {
    color: #4ade80;
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #4ade80;
}

.panel-title {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 1rem;
    border-left: 4px solid #4ade80;
    padding-left: 1rem;
}

.description-text {
    line-height: 1.8;
    color: #d1d5db;
    white-space: pre-line;
}

.chapter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.chapter-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    text-decoration: none;
    color: #d1d5db;
    transition: background 0.2s;
}

.chapter-item:hover {
    background: rgba(45, 212, 191, 0.1);
    color: #4ade80;
}

.chap-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 1rem;
}

.chap-date {
    font-size: 0.85rem;
    color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
    .story-info-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .meta-row, .stats-row, .genres-row, .actions-row {
        justify-content: center;
    }

    .story-title {
        font-size: 2rem;
    }
}
</style>
