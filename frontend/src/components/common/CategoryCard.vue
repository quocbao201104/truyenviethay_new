<template>
  <router-link :to="`/the-loai/${category.id_theloai}`" class="category-card">
    <div class="card-image-wrapper">
      <img
        :src="category.thumbnail_url || '/img/category-placeholder.png'"
        :alt="category.ten_theloai"
        class="card-thumbnail"
        @error="handleImageError"
      />
      <div class="image-overlay"></div>
    </div>
    <div class="card-content">
      <h3 class="category-title">{{ category.ten_theloai }}</h3>
      <div class="category-stats">
        <span>Truyện</span>
        <span>{{ category.so_luong_truyen !== undefined ? category.so_luong_truyen : Math.floor(Math.random() * 2000) + 100 }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { Category } from '@/types/category';

const props = defineProps<{
  category: Category;
}>();

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/img/category-placeholder.png';
  target.onerror = null;
};
</script>

<style scoped>
.category-card {
  display: block;
  border-radius: 12px; 
  overflow: hidden;
  background: linear-gradient(to right, #1a1d29, #111414);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
  position: relative;
  height: 200px; 
  border: 1px solid rgba(76, 175, 80, 0.2); 
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.6); 
  border-color: #4caf50; 
}

.card-image-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  border-radius: 12px; 
}

.card-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px; 
  display: block;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%); 
  border-radius: 12px;
}

.card-content {
  position: absolute;
  inset: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #ffffff;
  z-index: 1;
}

.category-title {
  color: #a4f9a4;
  font-weight: 800; 
  font-size: 1.7rem; 
  margin-bottom: 8px; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8); 
}

.category-stats {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem; 
  font-weight: 600; 
  color: #e0e0e0;
  padding: 5px 10px;
  border-radius: 5px;
}
</style>