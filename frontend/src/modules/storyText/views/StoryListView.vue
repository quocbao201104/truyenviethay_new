<template>
  <div class="story-list-container">
    <h1 class="page-title">📚 Danh sách truyện</h1>

    <div class="story-grid">
      <StoryCard v-for="story in stories" :key="story.id" :story="story" />
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        ← Trước
      </button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Sau →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAllStories } from "@/modules/storyText/storyText.api";
import StoryCard from "@/modules/storyText/components/StoryCard.vue";

const stories = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);

const fetchStories = async (page = 1) => {
  try {
    const res = await getAllStories({ page });
    stories.value = res.data;
    totalPages.value = res.pagination.total_pages;
    currentPage.value = res.pagination.current_page;
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
.story-list-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  color: #4caf50;
  margin-bottom: 20px;
}

.story-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 10px;
}

.pagination button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.pagination button:disabled {
  background-color: #888;
  cursor: not-allowed;
}
</style>
