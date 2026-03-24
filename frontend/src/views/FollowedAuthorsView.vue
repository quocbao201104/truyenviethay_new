<template>
  <div class="followed-authors-page">
    <main class="main-content">
      <div class="section-header">
        <h2 class="section-title">Tác Giả Đang Theo Dõi</h2>
        <p class="section-subtitle">Dõi theo hành trình bút lực của các đạo hữu</p>
        <div class="header-divider"></div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="skeleton-row" v-for="n in 6" :key="n"></div>
      </div>

      <div v-else-if="error" class="state-box error">
        <i class="fas fa-triangle-exclamation"></i>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="authors.length === 0" class="state-box empty">
        <i class="fas fa-user-slash"></i>
        <h3>Chưa theo dõi tác giả nào</h3>
        <p>Hãy khám phá bảng xếp hạng tác giả để tìm đạo hữu phù hợp.</p>
        <router-link to="/xep-hang" class="btn-seek">Đến Bảng Xếp Hạng</router-link>
      </div>

      <div v-else class="author-list">
        <router-link
          v-for="author in authors"
          :key="author.id"
          :to="`/tac-gia/${author.id}`"
          class="author-card"
        >
          <img :src="getAvatarUrl(author.avatar || author.user_avatar)" :alt="author.pen_name" />
          <div class="author-info">
            <h3>{{ author.pen_name }}</h3>
            <p class="meta">@{{ author.username || "ẩn danh" }}</p>
            <div class="stats">
              <span><i class="fas fa-book"></i> {{ formatNumber(author.total_stories) }} truyện</span>
              <span><i class="fas fa-users"></i> {{ formatNumber(author.follower_count) }} theo dõi</span>
              <span><i class="fas fa-eye"></i> {{ formatNumber(author.total_views) }} lượt xem</span>
            </div>
          </div>
          <i class="fas fa-angle-right arrow"></i>
        </router-link>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="changePage(page - 1)">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-text">Trang {{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="changePage(page + 1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getMyFollowedAuthorsApi } from "@/modules/user/user.api";
import { getAvatarUrl } from "@/config/constants";

const authors = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const page = ref(1);
const totalPages = ref(1);

const fetchAuthors = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await getMyFollowedAuthorsApi({ page: page.value, limit: 12 });
    authors.value = res.data || [];
    totalPages.value = res.pagination?.total_pages || 1;
  } catch (err: any) {
    error.value = err.message || "Không thể tải danh sách tác giả theo dõi";
  } finally {
    loading.value = false;
  }
};

const changePage = (next: number) => {
  if (next < 1 || next > totalPages.value) return;
  page.value = next;
  fetchAuthors();
};

const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

onMounted(() => {
  fetchAuthors();
});
</script>

<style scoped>
.followed-authors-page {
  min-height: 100vh;
  background: #0b0f19;
  color: #e2e8f0;
  font-family: "Be Vietnam Pro", sans-serif;
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 35px;
}

.section-title {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: linear-gradient(to right, #38bdf8, #ffffff, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 8px;
}

.header-divider {
  width: 200px;
  height: 2px;
  margin: 16px auto 0;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
}

.author-list {
  display: grid;
  gap: 16px;
}

.author-card {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: 16px;
  align-items: center;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 16px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.author-card:hover {
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.author-card img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(56, 189, 248, 0.5);
}

.author-info h3 {
  margin: 0 0 6px;
  font-size: 1.2rem;
  font-weight: 800;
}

.author-info .meta {
  margin: 0 0 10px;
  color: #94a3b8;
  font-size: 0.8rem;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.stats i {
  color: #38bdf8;
  margin-right: 6px;
}

.arrow {
  color: #38bdf8;
}

.loading-state .skeleton-row {
  height: 90px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  margin-bottom: 16px;
}

.state-box {
  text-align: center;
  padding: 60px 20px;
  background: #121826;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.state-box i {
  font-size: 3rem;
  margin-bottom: 16px;
  color: #38bdf8;
}

.btn-seek {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 24px;
  background: #38bdf8;
  color: #04111f;
  border-radius: 999px;
  font-weight: 800;
  text-decoration: none;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-text {
  color: #94a3b8;
  font-weight: 700;
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

@media (max-width: 768px) {
  .author-card {
    grid-template-columns: 60px 1fr;
  }
  .arrow {
    display: none;
  }
}
</style>
