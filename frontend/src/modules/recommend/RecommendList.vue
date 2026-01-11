<template>
  <div class="recommend-list my-8">
    <h2 class="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-3">Truyện Mới Cập Nhật</h2>

    <div v-if="loading" class="text-center py-4">Đang tải...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="story in recommendedStories" :key="story.id" class="story-card group">
        <router-link :to="`/truyen/${story.slug}`" class="block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition relative">
          <div class="aspect-[2/3] overflow-hidden">
             <img 
            :src="story.anh_bia ? (story.anh_bia.startsWith('http') ? story.anh_bia : `http://localhost:3000/uploads_img/${story.anh_bia}`) : '/placeholder.jpg'" 
            :alt="story.ten_truyen"
            class="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          </div>
          <div class="p-2 bg-white h-24">
            <h3 class="font-semibold text-gray-800 text-sm line-clamp-2" :title="story.ten_truyen">{{ story.ten_truyen }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ story.tac_gia }}</p>
          </div>
          <div class="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
             Mới
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRecommendStore } from "./recommend.store";

const store = useRecommendStore();
const recommendedStories = computed(() => store.recommendedStories);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(() => {
    // Only fetch if empty to save calls, or force every time?
    if (store.recommendedStories.length === 0) {
        store.fetchRecommended();
    }
});
</script>
