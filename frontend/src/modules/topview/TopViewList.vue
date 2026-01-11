<template>
  <div class="topview-list bg-white rounded-lg shadow p-4">
    <h3 class="text-xl font-bold mb-4 text-red-600 border-b pb-2">Top Lượt Xem</h3>
    
    <div v-if="loading">Đang tải...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <ul v-else class="space-y-3">
      <li v-for="(story, index) in topStories" :key="story.id" class="flex items-center gap-3">
        <span 
            class="flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs text-white"
            :class="{
                'bg-red-500': index === 0,
                'bg-orange-500': index === 1,
                'bg-yellow-500': index === 2,
                'bg-gray-400': index > 2
            }"
        >
            {{ index + 1 }}
        </span>
        <div class="flex-grow overflow-hidden">
            <router-link :to="`/truyen/${story.slug}`" class="block truncate font-medium hover:text-red-500" :title="story.ten_truyen">
                {{ story.ten_truyen }}
            </router-link>
            <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                <span class="truncate max-w-[60%]">{{ story.tac_gia }}</span>
                <span>{{ story.luot_xem.toLocaleString() }} xem</span>
            </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useTopViewStore } from "./topview.store";

const store = useTopViewStore();
const topStories = computed(() => store.topStories);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(() => {
    store.fetchTopView();
});
</script>
