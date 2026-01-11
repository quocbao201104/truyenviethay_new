<template>
  <div class="story-list-page">
    <AppHeader />
    
    <main class="main-content">
      <div class="header-section">
        <h1 class="page-title">
          <i class="fas fa-fire-alt fire-icon"></i> Truyện Mới Cập Nhật
        </h1>
        <p class="subtitle">Khám phá những câu chuyện mới nhất được cập nhật hàng ngày.</p>
      </div>

      <!-- Add filters/sort here if needed later -->

      <div class="story-grid">
        <NewStoryCard v-for="story in stories" :key="story.id" :story="story" />
      </div>

      <div v-if="stories.length === 0" class="empty-state">
        <p>Đang tải danh sách truyện hoặc chưa có dữ liệu...</p>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="page-btn nav-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="page-btn nav-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getPublicStories } from "@/modules/storyText/story.service";
import NewStoryCard from "@/modules/storyText/components/NewStoryCard.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";

const stories = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);

const fetchStories = async (page = 1) => {
  try {
    const res = await getPublicStories({ page, limit: 18 }); // 18 divides well by 2, 3, 6
    stories.value = res.data;
    totalPages.value = res.pagination.total_pages;
    currentPage.value = res.pagination.current_page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error("Lỗi khi lấy truyện:", err);
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchStories(page);
  }
};

onMounted(() => {
  fetchStories();
});
</script>

<style scoped>
.story-list-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #111827; /* Darker background */
  font-family: 'Manrope', sans-serif;
  color: #fff;
}

.main-content {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #4ade80;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.fire-icon {
  color: #ef4444; /* Red color for fire */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.subtitle {
  color: #9ca3af;
  font-size: 1.1rem;
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
  justify-content: center;
}

/* Adjust grid for larger screens to use space better */
@media (min-width: 1024px) {
    .story-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1.2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4rem;
  gap: 1.5rem;
}

.page-btn {
  background-color: #1f2937;
  color: #fff;
  border: 1px solid #374151;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #4ade80;
  border-color: #4ade80;
  color: #111827;
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: 700;
  color: #9ca3af;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .story-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}
</style>