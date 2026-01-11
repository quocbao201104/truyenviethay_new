<template>
  <div class="chapter-item">
    <router-link 
      :to="`/chuong/${chapter.slug}`" 
      class="chapter-link flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors border-b border-gray-100"
    >
      <span class="font-medium text-gray-700">Chương {{ chapter.so_chuong }}: {{ chapter.ten_chuong }}</span>
      <span class="text-xs text-gray-400" v-if="(chapter as any).created_at">
          {{ formatDate((chapter as any).created_at) }}
      </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import type { Chapter } from '../chapter/chapter.service';

defineProps<{
  chapter: Chapter
}>();

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
};
</script>

<style scoped>
.chapter-link:hover {
    color: #4ade80; /* Tailwind brand color approximation */
}
</style>
