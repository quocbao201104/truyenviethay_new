<template>
  <div class="favorite-list container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">Truyện Đang Theo Dõi</h2>

    <div v-if="loading" class="text-center py-8">Đang tải...</div>
    <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
    
    <div v-else-if="favorites.length === 0" class="text-center text-gray-500 py-10">
      Bạn chưa theo dõi truyện nào.
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      <div v-for="story in favorites" :key="story.id" class="group relative">
        <router-link :to="`/truyen/${story.slug}`" class="block overflow-hidden rounded-lg shadow hover:shadow-lg transition">
          <img 
            :src="story.anh_bia ? (story.anh_bia.startsWith('http') ? story.anh_bia : `http://localhost:3000/uploads_img/${story.anh_bia}`) : '/placeholder.jpg'" 
            :alt="story.ten_truyen"
            class="w-full h-48 object-cover transform group-hover:scale-105 transition duration-300"
          />
          <div class="p-3 bg-white">
            <h3 class="font-semibold text-gray-800 truncate" :title="story.ten_truyen">{{ story.ten_truyen }}</h3>
            <p class="text-sm text-gray-500 truncate">{{ story.tac_gia }}</p>
          </div>
        </router-link>
        <button 
           @click.prevent="handleUnfollow(story.id)"
           class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-600"
           title="Bỏ theo dõi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useFavoriteStore } from "./favorite.store";

const store = useFavoriteStore();
const favorites = computed(() => store.favorites);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(() => {
  store.fetchFavorites();
});

const handleUnfollow = async (id: number) => {
  if (confirm("Bạn có chắc muốn bỏ theo dõi truyện này?")) {
      await store.toggleFollow(id);
      store.fetchFavorites(); // Refresh list
  }
};
</script>
