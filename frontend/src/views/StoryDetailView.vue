<template>
  <div class="story-detail-page-cosmic">
    
    <div class="portal-nebula-glow"></div>
    <div class="portal-particles"></div>

    <main v-if="loading" class="detail-container">
      <section class="story-hero-loading cosmic-glass">
        <div class="skeleton-aura">
          <SkeletonLoader width="240px" height="340px" borderRadius="16px" />
          <div class="skeleton-info">
            <SkeletonLoader width="60%" height="48px" style="margin-bottom: 20px" />
            <SkeletonLoader width="40%" height="24px" style="margin-bottom: 30px" />
            <div class="flex gap-4">
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </section>
    </main>

    <main v-else-if="error" class="error-container-xianxia">
      <div class="error-box cosmic-glass">
        <i class="fas fa-ghost text-5xl mb-4 opacity-30 text-cyan-400"></i>
        <p class="error-msg">Thiên cơ nhiễu loạn: {{ error }}</p>
        <router-link to="/truyen-chu" class="back-link-aura"></router-link>
      </div>
    </main>

    <main v-else-if="story && story.slug === route.params.slug" class="detail-container animate-fadeIn">
      
      <div class="back-home-wrapper">
        <router-link to="/truyen-chu" class="btn-back-home">
          <i class="fas fa-arrow-left"></i>
        </router-link>
      </div>

      <section class="story-hero-section cosmic-glass">
        <div class="hero-content">
          
          <div class="cover-wrapper">
            <div class="cover-blur-bg" :style="{ backgroundImage: `url(${getImageUrl(story.anh_bia)})` }"></div>
            <img 
              :src="getImageUrl(story.anh_bia)" 
              :alt="story.ten_truyen" 
              class="story-cover-main"
              @error="handleImageError"
            >
            <div :class="['status-sigil-detail', statusClass]">
              <i v-if="statusClass === 'status-completed'" class="fas fa-circle-check"></i>
              <i v-else class="fas fa-atom animate-spin-slow"></i>
              <span class="sigil-text">{{ formatStatus(story.trang_thai) }}</span>
            </div>
          </div>

          <div class="info-content">
            <h1 class="story-title-main">{{ story.ten_truyen }}</h1>
            
            <div class="meta-row">
              <span class="author-link">
                <i class="fas fa-feather-pointed text-cyan-400"></i> {{ story.tac_gia || 'Ẩn Danh' }}
              </span>
              
              <div class="genre-tags" v-if="story.genres && story.genres.length">
                <i class="fas fa-book-open text-slate-500"></i>
                <router-link 
                  v-for="(genre, index) in story.genres" 
                  :key="genre.id_theloai"
                  :to="`/the-loai?categories=${genre.id_theloai}`"
                  class="genre-tag"
                >
                  {{ genre.ten_theloai }}<span v-if="Number(index) < story.genres.length - 1" class="text-slate-600">, </span>
                </router-link>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <span class="value">{{ story.so_luong_chuong || 0 }}</span>
                <span class="label">CHƯƠNG</span>
              </div>
              <div class="stat-box">
                <span class="value">{{ formatNumber(story.luot_xem || 0) }}</span>
                <span class="label">LƯỢT XEM</span>
              </div>
              <div class="stat-box rating-stat">
                <div class="rating-val">
                  <i class="fas fa-star text-amber-400 text-sm"></i>
                  <span class="value">{{ ratingStats.avg_rating > 0 ? Number(ratingStats.avg_rating).toFixed(1) : '5.0' }}</span>
                </div>
                <span class="label">{{ ratingStats.total_ratings || 0 }} ĐÁNH GIÁ</span>
              </div>
            </div>

            <div class="actions-row">
              <router-link 
                v-if="story && readTarget" 
                :to="{ 
                  path: `/truyen-chu/${story.slug}/${readTarget.slug}`, 
                  query: { storyId: story.id, chapterId: readTarget.id } 
                }" 
                class="btn-primary"
              > {{ hasHistory ? 'TIẾP TỤC LĨNH HỘI' : 'LĨNH HỘI NGAY' }}
              </router-link>
              
              <div class="secondary-actions">
                <button @click="toggleFollow" class="btn-action-spirit" :class="{ 'followed': isFollowed }">
                  <i class="fas" :class="isFollowed ? 'fa-heart-circle-check' : 'fa-heart-circle-plus'"></i>
                  <span>{{ isFollowed ? 'Đang Khắc Ấn' : 'Khắc Ấn' }}</span>
                </button>

                <button @click="handleToggleLike" class="btn-action-spirit" :class="{ 'liked': isLiked }">
                  <i class="fas" :class="isLiked ? 'fa-thumbs-up' : 'fa-thumbs-up'"></i>
                  <span>{{ isLiked ? 'Tâm Đắc' : 'Tán Thưởng' }}</span>
                </button>

                <button 
                  v-if="story.user_id" 
                  @click="chatStore.joinAuthorRoom(story.user_id, story.tac_gia || 'Động Phủ')" 
                  class="btn-action-spirit group-btn"
                >
                  <i class="fas fa-users-viewfinder"></i>
                  <span>Tiên Động</span>
                </button>
              </div>
            </div>

            <div class="rating-input-box">
              <span class="label">Định phẩm linh thư:</span>
              <div class="star-group">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  @click="handleRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  :class="['fas fa-star', { 
                    'active': star <= (hoverRating || userRating),
                    'hover': star <= hoverRating
                  }]"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="tabs-nav-clean">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-item', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <i class="fas" :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <section class="tab-content-area animate-fadeIn">
        
        <div v-if="currentTab === 'intro'" class="content-panel cosmic-glass intro">
            <h3 class="panel-title"><i class="fas fa-feather text-cyan-400"></i> Tóm Tắt Bí Tịch</h3>
            <div class="description-text">{{ story.mo_ta }}</div>
        </div>

        <div v-if="currentTab === 'chapters'" class="content-panel cosmic-glass chapters">
             <div class="panel-header-row">
               <div class="panel-title-group">
                 <h3 class="panel-title"><i class="fas fa-list-ul text-cyan-400"></i> Danh Sách Chương</h3>
                 <span class="text-sm text-slate-400">{{ chapters.length }} chương</span>
               </div>
               <button @click="isReverse = !isReverse" class="btn-sort-spirit" :title="isReverse ? 'Cũ nhất trước' : 'Mới nhất trước'">
                 <i class="fas" :class="isReverse ? 'fa-sort-amount-up' : 'fa-sort-amount-down'"></i>
                 <span>{{ isReverse ? 'Mới nhất' : 'Cũ nhất' }}</span>
               </button>
             </div>
             
             <div v-if="chapterLoading" class="loading-state text-cyan-400 text-center py-10"><i class="fas fa-yin-yang fa-spin text-2xl mb-2 block"></i> Đang thỉnh chương...</div>
             <div v-else-if="chapters.length === 0" class="empty-state text-center py-10 text-slate-500">Bí tịch chưa được viết...</div>
             <div v-else>
               <div class="chapter-grid">
                 <router-link 
                   v-for="chap in paginatedChapters" 
                   :key="chap.id" 
                   :to="`/truyen-chu/${story?.slug}/${chap.slug}`"
                   class="chapter-item"
                 >
                   <span class="chap-name">{{ chap.ten_chuong || chap.tieu_de }}</span>
                   <span class="chap-time">{{ formatDate(chap.thoi_gian_dang) }}</span>
                 </router-link>
               </div>

               <div class="pagination-bar" v-if="totalPages > 1">
                   <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                   <span class="page-text">Tầng {{ currentPage }} / {{ totalPages }}</span>
                   <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn"><i class="fas fa-chevron-right"></i></button>
               </div>
             </div>
        </div>

        <div v-if="currentTab === 'comments'" class="content-panel cosmic-glass comments">
           <h3 class="panel-title"><i class="fas fa-comments text-cyan-400"></i> Khu Vực Luận Đạo</h3>
           <CommentList :story-id="story.id" :story-author-id="story.user_id" />
        </div>
      </section>

    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { useStoryStore } from '@/modules/storyText/story.store';
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store';
import { useFavoriteStore } from '@/modules/favorite/favorite.store'; 
import { useRatingStore } from '@/modules/rating/rating.store';
import { useHistoryStore } from '@/modules/history/history.store';
import { useChatStore } from '@/modules/chat/chat.store';
import CommentList from '@/modules/comment/CommentList.vue';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';
import { getImageUrl } from "@/config/constants";

const route = useRoute();
const storyStore = useStoryStore();
const chapterStore = useChapterStore();
const favoriteStore = useFavoriteStore();
const ratingStore = useRatingStore();
const historyStore = useHistoryStore();
const chatStore = useChatStore();

const hoverRating = ref(0);
const userRating = computed(() => ratingStore.userRating);
const ratingStats = computed(() => ratingStore.stats);

const currentTab = ref('intro');
const tabs = [
  { id: 'intro', label: 'BẢN THẢO', icon: 'fa-book-open' },
  { id: 'chapters', label: 'BÍ TỊCH', icon: 'fa-list-ol' },
  { id: 'comments', label: 'LUẬN ĐẠO', icon: 'fa-comments' },
];

const story = computed(() => storyStore.currentStory);
const loading = computed(() => storyStore.loading);
const error = computed(() => storyStore.error);
const isLiked = computed(() => storyStore.isLiked);

const chapters = computed(() => chapterStore.chapterList);
const chapterLoading = computed(() => chapterStore.loading);

// Phân trang & Sắp xếp
const isReverse = ref(true);
const sortedChapters = computed(() => isReverse.value ? [...chapters.value].reverse() : [...chapters.value]);

const currentPage = ref(1);
const itemsPerPage = 30;
const paginatedChapters = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return sortedChapters.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(sortedChapters.value.length / itemsPerPage));
const changePage = (page: number) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page; };

const firstChapterSlug = computed(() => {
    if (chapters.value.length > 0 && story.value && chapters.value[0].truyen_id === story.value.id) {
        return chapters.value[0].slug;
    }
    return null;
});

const firstChapterId = computed(() => {
    if (chapters.value.length > 0 && story.value && chapters.value[0].truyen_id === story.value.id) {
        return chapters.value[0].id;
    }
    return null;
});

const storyHistory = computed(() => {
    if (!story.value) return null;
    return historyStore.history.find(h => h.truyen_id === story.value?.id) || null;
});

const hasHistory = computed(() => !!storyHistory.value);

const readTarget = computed(() => {
    if (hasHistory.value && storyHistory.value) {
        const lastRead = storyHistory.value.last_read_chuong_id
            ? chapters.value.find(c => c.id === storyHistory.value?.last_read_chuong_id)
            : storyHistory.value.chuong_slug
                ? chapters.value.find(c => c.slug === storyHistory.value?.chuong_slug)
                : null;
        if (lastRead) return { slug: lastRead.slug, id: lastRead.id };
    }
    if (chapters.value.length > 0) {
        return { slug: chapters.value[0].slug, id: chapters.value[0].id };
    }
    return null;
});

const isFollowed = computed(() => {
    if (!story.value) return false;
    const inFavorites = favoriteStore.favorites.some(f => f.id === story.value?.id);
    if (inFavorites) return true;
    return !!story.value.is_followed;
});

const toggleFollow = async () => {
    if (!story.value) return;
    await favoriteStore.toggleFollow(story.value.id);
    await favoriteStore.fetchFavorites();
};

const handleToggleLike = async () => {
    if (story.value) await storyStore.toggleLike(story.value.id);
};

const handleRating = async (rating: number) => {
    if (story.value) await ratingStore.submitUserRating(story.value.id, rating);
};

const formatDate = (d?: string | null) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const handleImageError = (e: Event) => { (e.target as HTMLImageElement).src = '/img/default-cover.png'; };

const formatStatus = (status: string) => {
  if (!status) return 'Đang Ra';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn thành')) return 'Viên Mãn';
  return 'Đang Ra';
};

const statusClass = computed(() => {
  if (!story.value) return 'status-on-going';
  const s = story.value.trang_thai.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn thành')) return 'status-completed';
  return 'status-on-going';
});

let lastFetchSlug = '';
const fetchData = async () => {
    const slug = route.params.slug as string;
    if (!slug) return;
    
    lastFetchSlug = slug;
    storyStore.clearData();
    chapterStore.clearChapterList();
    
    await storyStore.fetchStoryBySlug(slug); 
    
    if (lastFetchSlug !== slug) return;

    if (story.value) {
        await Promise.all([
            chapterStore.fetchChapterList(story.value.id),
            favoriteStore.fetchFavorites(),
            storyStore.fetchLikeStatus(story.value.id),
            ratingStore.fetchRatings(story.value.id),
            historyStore.fetchHistory(1)
        ]);
        if (lastFetchSlug !== slug) return;
    }
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

onMounted(() => {
    if (route.query.tab) currentTab.value = route.query.tab as string;
    fetchData();
});

onUnmounted(() => {
    storyStore.clearData();
    chapterStore.clearChapterList();
});

onBeforeRouteUpdate((to) => {
    if (to.params.slug !== route.params.slug) {
        storyStore.clearData();
        chapterStore.clearChapterList();
    }
});

watch(() => route.params.slug, () => { if (route.name === 'StoryDetail') fetchData(); });
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

/* ===== CORE THEME ===== */
.story-detail-page-cosmic {
  min-height: 100vh;
  background-color: #020617; /* Midnight Blue */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
  position: relative;
  overflow: hidden;
}

.portal-nebula-glow {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 100vw; height: 50vh;
  background: radial-gradient(ellipse at top, rgba(34, 211, 238, 0.15) 0%, transparent 70%);
  z-index: 0; pointer-events: none;
}

.portal-particles {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
  background-size: 100px 100px; z-index: 0; pointer-events: none;
}

.detail-container {
  max-width: 1140px; margin: 0 auto; padding: 30px 20px; position: relative; z-index: 10;
}

/* Nút Trở Về */
.back-home-wrapper { margin-bottom: 20px; }
.btn-back-home {
  display: inline-flex; align-items: center; gap: 8px;
  color: #94a3b8; text-decoration: none; font-size: 0.95rem; font-weight: 600; transition: all 0.3s;
  padding: 8px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
}
.btn-back-home:hover {
  color: #22d3ee; background: rgba(34, 211, 238, 0.1); border-color: rgba(34, 211, 238, 0.3);
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
}

/* Kính Mờ Chung */
.cosmic-glass {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(34, 211, 238, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(34, 211, 238, 0.05);
}

/* ===== HERO SECTION ===== */
.story-hero-section {
  border-radius: 20px; padding: 35px 40px; margin-bottom: 40px;
}

.hero-content { display: flex; gap: 40px; align-items: flex-start; }

/* Ảnh Bìa Nền Mờ Khít */
.cover-wrapper {
  flex-shrink: 0; width: 220px; height: 310px; border-radius: 12px;
  overflow: hidden; position: relative;
  box-shadow: 0 0 25px rgba(34, 211, 238, 0.2), 0 15px 30px rgba(0,0,0,0.8);
  border: 1px solid rgba(34, 211, 238, 0.4);
}

.cover-blur-bg {
  position: absolute; inset: -20px; background-size: cover; background-position: center;
  filter: blur(15px) brightness(0.4); z-index: 0;
}

.story-cover-main {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; object-position: top center; z-index: 1;
}

/* Thẻ Trạng Thái */
.status-sigil-detail {
  position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 6px;
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
  display: flex; align-items: center; gap: 6px; backdrop-filter: blur(6px); z-index: 10;
}

.status-completed { background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; }
.status-on-going { background: rgba(34, 211, 238, 0.2); border: 1px solid rgba(34, 211, 238, 0.4); color: #22d3ee; }

.animate-spin-slow { animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Thông tin chính */
.info-content { flex: 1; }

.story-title-main {
  font-size: 2.2rem; font-weight: 900; margin: 0 0 12px 0; line-height: 1.3;
  background: linear-gradient(135deg, #fff 20%, #22d3ee 80%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(34, 211, 238, 0.4));
}

.meta-row { display: flex; flex-wrap: wrap; gap: 15px; align-items: center; margin-bottom: 25px; color: #94a3b8; font-size: 0.95rem; }
.author-link { font-weight: 600; color: #e2e8f0; }
.genre-tags { display: flex; gap: 8px; align-items: center; }
.genre-tag { color: #22d3ee; text-decoration: none; font-weight: 600; }
.genre-tag:hover { text-decoration: underline; text-shadow: 0 0 8px #22d3ee; }

/* 3 Ô THỐNG KÊ */
.stats-grid { display: flex; gap: 15px; margin-bottom: 30px; }
.stat-box {
  background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 15px 25px;
  text-align: center; display: flex; flex-direction: column; justify-content: center;
  min-width: 130px; border: 1px solid rgba(255,255,255,0.05); box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
}
.stat-box .value { font-size: 1.4rem; font-weight: 900; color: #f8fafc; line-height: 1; margin-bottom: 6px; }
.stat-box .label { font-size: 0.7rem; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
.rating-stat .rating-val { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; }
.rating-stat .rating-val .value { margin-bottom: 0; color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);}

/* NÚT BẤM */
.actions-row { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 25px; }

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #22d3ee); color: #020617;
  padding: 12px 28px; border-radius: 8px; font-weight: 900; font-size: 0.95rem; letter-spacing: 1px;
  display: inline-flex; align-items: center; text-decoration: none; transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(34, 211, 238, 0.4); border: 1px solid rgba(255,255,255,0.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(34, 211, 238, 0.6); }

.secondary-actions { display: flex; gap: 12px; }

.btn-action-spirit {
  background: rgba(2, 6, 23, 0.6); color: #94a3b8; padding: 12px 24px; border-radius: 8px;
  font-weight: 700; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 10px;
  border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s; cursor: pointer;
}
.btn-action-spirit i { font-size: 1.1rem; transition: 0.3s; }
.btn-action-spirit:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(34, 211, 238, 0.4); box-shadow: 0 0 15px rgba(34, 211, 238, 0.1); }

.btn-action-spirit.followed { color: #f43f5e; border-color: rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.1); }
.btn-action-spirit.followed i { filter: drop-shadow(0 0 5px rgba(244, 63, 94, 0.6)); }

.btn-action-spirit.liked { color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.1); }
.btn-action-spirit.liked i { filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.6)); }

.btn-action-spirit.group-btn:hover { color: #fbbf24; border-color: rgba(251, 191, 36, 0.4); }

/* RATING INPUT */
.rating-input-box { display: flex; align-items: center; gap: 15px; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1); }
.rating-input-box .label { font-size: 0.9rem; color: #94a3b8; font-weight: 600; }
.star-group { display: flex; gap: 6px; font-size: 1.2rem; color: #334155; }
.star-group i { cursor: pointer; transition: 0.2s; }
.star-group i.active, .star-group i.hover { color: #fbbf24; filter: drop-shadow(0 0 5px #fbbf24); }

/* ===== TABS NAVIGATION ===== */
.tabs-nav-clean { display: flex; gap: 30px; border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 30px; position: relative; z-index: 10;}
.tab-item { background: none; border: none; padding: 15px 0; font-size: 1rem; font-weight: 800; color: #64748b; cursor: pointer; position: relative; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;}
.tab-item:hover { color: #e2e8f0; }
.tab-item.active { color: #22d3ee; text-shadow: 0 0 10px rgba(34, 211, 238, 0.4); }
.tab-item.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background-color: #22d3ee; box-shadow: 0 -2px 10px #22d3ee; }

/* ===== TAB CONTENT ===== */
.content-panel { border-radius: 20px; padding: 30px 40px; margin-bottom: 20px; }
.panel-title { font-size: 1.3rem; font-weight: 800; color: #f8fafc; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.panel-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 15px; }
.panel-title-group { display: flex; align-items: center; gap: 15px; }
.panel-header-row .panel-title { margin-bottom: 0; }

.btn-sort-spirit { background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.2); color: #22d3ee; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
.btn-sort-spirit:hover { background: rgba(34, 211, 238, 0.2); border-color: #22d3ee; box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);}

.description-text { line-height: 1.8; color: #cbd5e1; white-space: pre-line; font-size: 1.05rem; }

/* Chapter Grid */
.chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
.chapter-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(0,0,0,0.3); border-radius: 8px; text-decoration: none; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
.chapter-item:hover { background: rgba(34, 211, 238, 0.1); border-color: rgba(34, 211, 238, 0.3); transform: translateX(5px); }
.chap-name { color: #cbd5e1; font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px; transition: 0.3s;}
.chapter-item:hover .chap-name { color: #22d3ee; }
.chap-time { font-size: 0.75rem; color: #64748b; flex-shrink: 0; }

/* Pagination */
.pagination-bar { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 40px; }
.page-btn { width: 36px; height: 36px; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; transition: 0.3s; cursor: pointer; }
.page-btn:hover:not(:disabled) { background: rgba(34, 211, 238, 0.2); border-color: #22d3ee; color: #22d3ee; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-text { font-weight: 700; color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; }

/* ===== TỐI ƯU MOBILE ===== */
@media (max-width: 768px) {
  .detail-container { padding: 15px 12px; }
  .story-hero-section { padding: 20px 15px; border-radius: 16px; }
  .hero-content { flex-direction: column; align-items: center; gap: 20px; }
  .cover-wrapper { width: 140px; height: 200px; border-radius: 8px; }
  .info-content { width: 100%; text-align: center; }
  .story-title-main { font-size: 1.6rem; margin-bottom: 8px; }
  .meta-row { justify-content: center; margin-bottom: 20px; font-size: 0.85rem; }
  .stats-grid { gap: 10px; }
  .stat-box { min-width: 0; flex: 1; padding: 10px 5px; border-radius: 8px; }
  .stat-box .value { font-size: 1.1rem; }
  .stat-box .label { font-size: 0.6rem; }
  .actions-row { width: 100%; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .btn-primary { width: 100%; justify-content: center; padding: 14px; order: 1; }
  .secondary-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; order: 2; }
  .btn-action-spirit { width: 100%; justify-content: center; padding: 12px 5px; }
  .btn-action-spirit span { display: none; } 
  .btn-action-spirit i { font-size: 1.3rem; }
  .rating-input-box { flex-direction: column; gap: 8px; padding-top: 15px; }
  .tabs-nav-clean { gap: 15px; overflow-x: auto; white-space: nowrap; padding-bottom: 2px; }
  .tab-item { font-size: 0.9rem; padding: 12px 10px; }
  .content-panel { padding: 20px 15px; border-radius: 16px; }
  .panel-title { font-size: 1.1rem; }
  .description-text { font-size: 0.95rem; }
  .chapter-grid { grid-template-columns: 1fr; } 
  .chapter-item { padding: 12px 15px; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
</style>