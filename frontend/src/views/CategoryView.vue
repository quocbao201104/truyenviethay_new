<template>
  <div class="category-view-container">
    <AppHeader />
    <main class="main-content">
      <div class="container">
        <div class="section-header-block">
          <h2 class="section-title">Danh sách thể loại</h2>
          <div class="section-divider"></div>
        </div>

        <div class="categories-wrapper">
          <div v-if="categoryStore.isCategoriesLoading" class="loading-message">
            Đang tải các thể loại...
          </div>

          <div v-if="categoryStore.error" class="error-message">
            Lỗi: {{ categoryStore.error }}
          </div>

          <div v-else class="category-grid">
            <CategoryCard
              v-for="category in categoryStore.getCategoryList"
              :key="category.id_theloai"
              :category="category"
            />
            <p v-if="categoryStore.getCategoryList.length === 0 && !categoryStore.isCategoriesLoading" class="no-categories-message">
              Không có thể loại nào được tìm thấy. Vui lòng thử lại sau.
            </p>
          </div>
        </div>

        <div class="main-content-divider"></div>

        <section class="story-cards-section">
          <h3 class="section-subtitle">Truyện nổi bật</h3>
          <div class="placeholder-story-grid">
            <div v-for="n in 8" :key="n" class="placeholder-story-card">
              <div class="placeholder-thumb"></div>
              <div class="placeholder-text"></div>
              <div class="placeholder-text short"></div>
            </div>
          </div>
        </section>

      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import CategoryCard from '@/components/common/CategoryCard.vue';
import { useCategoryStore } from '@/modules/category/category.store';

const categoryStore = useCategoryStore();

onMounted(() => {
  categoryStore.fetchAllCategories();
});
</script>

<style scoped>
.category-view-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29; 
  color: #ffffff;
  font-family: "Roboto", sans-serif;
}

.main-content {
  flex-grow: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}


/* --- Tiêu đề và gạch ngang phân cách trong Header Section --- */
.section-header-block {
  margin-bottom: 30px; 
}

.section-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #ffffff; 
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 10px; 
  display: inline-block; 
  padding-bottom: 5px;
}

.section-divider {
  height: 4px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent); 
  margin: 0 auto;
  border-radius: 2px;
}

/* --- Khối chứa các Category Card --- */
.categories-wrapper {
  border-radius: 15px; 
  margin-bottom: 50px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
  gap: 20px;
  justify-content: center;
}

.loading-message, .error-message, .no-categories-message {
  text-align: center;
  color: #cccccc;
  font-size: 1.1rem;
  padding: 20px;
  background-color: #2a2d3a;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #383b4a;
}

.error-message {
  color: #f44336;
  border-color: #f44336;
}

.no-categories-message {
  color: #ffc107;
  border-color: #ffc107;
}

/* --- Gạch ngang phân cách chính giữa các phần --- */
.main-content-divider {
  width: 95%; 
  height: 6px; 
  background: linear-gradient(90deg, transparent 5%, #4caf50 50%, transparent 95%); 
  margin: 50px auto; 
  border-radius: 3px;
  opacity: 0.8;
}

/* --- Placeholder cho khu vực truyện --- */
.story-cards-section {
  padding: 20px 0;
}

.section-subtitle {
  font-size: 2.2rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
  position: relative;
  display: inline-block; 
  padding-bottom: 5px;
}

.section-subtitle::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 80px;
  height: 3px;
  background-color: #66bb6a;
  border-radius: 2px;
}


.placeholder-story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.placeholder-story-card {
  background-color: #2a2d3a;
  border-radius: 8px;
  padding: 15px;
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #383b4a;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.placeholder-thumb {
  width: 80%;
  height: 120px;
  background-color: #3e4256;
  border-radius: 5px;
}

.placeholder-text {
  width: 90%;
  height: 15px;
  background-color: #3e4256;
  border-radius: 3px;
}

.placeholder-text.short {
  width: 60%;
  height: 15px;
}


/* Responsive adjustments */
@media (max-width: 1024px) {
  .section-title {
    font-size: 2.5rem;
  }
  .section-subtitle {
    font-size: 1.8rem;
  }
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
    letter-spacing: 1px;
  }
  .section-subtitle {
    font-size: 1.5rem;
  }
  .section-description {
    font-size: 1rem;
    margin-bottom: 30px;
  }
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  .main-content-divider {
    width: 90%;
    margin: 40px auto;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 10px;
  }
  .section-title {
    font-size: 1.8rem;
    letter-spacing: 0.5px;
  }
  .section-subtitle {
    font-size: 1.3rem;
  }
  .section-header-block {
    margin-bottom: 20px;
  }
  .categories-wrapper {
    padding: 20px;
  }
  .category-grid {
    grid-template-columns: 1fr; 
    gap: 15px;
  }
  .main-content-divider {
    width: 95%;
    margin: 30px auto;
  }
}
</style>