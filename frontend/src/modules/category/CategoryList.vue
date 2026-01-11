<template>
  <div class="category-list p-4 bg-white rounded shadow-sm">
    <h3 class="text-xl font-bold mb-4 border-b pb-2">Thể Loại</h3>
    
    <div v-if="loading" class="text-gray-500 text-center py-4">
      Đang tải...
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <router-link
        v-for="cat in categories"
        :key="cat.id_theloai"
        :to="`/the-loai/${cat.id_theloai}`"
        class="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-600 rounded-full text-sm transition-colors"
      >
        {{ cat.ten_theloai }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useCategoryStore } from "./category.store";

const store = useCategoryStore();
const categories = computed(() => store.categories);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories();
  }
});
</script>
