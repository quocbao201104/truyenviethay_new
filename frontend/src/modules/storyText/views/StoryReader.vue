<template>
  <div class="story-reader container mx-auto p-4 max-w-4xl">
    <div v-if="loading" class="text-center py-20 text-xl text-gray-500">
      Đang tải nội dung chương...
    </div>

    <div v-else-if="error" class="text-center py-20 text-red-500">
      <h3 class="text-2xl font-bold mb-2">Lỗi!</h3>
      <p>{{ error }}</p>
      <router-link to="/" class="text-blue-500 hover:underline mt-4 inline-block">Về trang chủ</router-link>
    </div>

    <div v-else-if="chapter" class="bg-white p-6 md:p-10 shadow-lg rounded-lg min-h-screen">
      <!-- Settings Toolbar (New Feature) -->
      <div class="mb-4 flex justify-end gap-2 border-b pb-2">
         <button @click="decreaseFontSize" class="px-2 py-1 bg-gray-200 rounded text-sm">A-</button>
         <button @click="increaseFontSize" class="px-2 py-1 bg-gray-200 rounded text-sm">A+</button>
         <select v-model="fontFamily" class="p-1 border rounded text-sm">
            <option value="font-serif">Serif</option>
            <option value="font-sans">Sans</option>
            <option value="font-mono">Mono</option>
         </select>
      </div>

      <!-- Breadcrumb / Header -->
      <div class="mb-6 border-b pb-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ chapter.truyen?.ten_truyen }}</h1>
        <h2 class="text-xl text-gray-600">Chương {{ chapter.so_chuong }}: {{ chapter.ten_chuong }}</h2>
      </div>

      <!-- Navigation Top -->
      <div class="flex justify-between items-center mb-8">
        <button 
            @click="prevChapter" 
            :disabled="!hasPrev"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
            &larr; Trước
        </button>
        
        <select 
            :value="chapter.slug" 
            @change="handleSelectChapter($event)" 
            class="p-2 border rounded mx-2 max-w-[200px]"
        >
            <option v-for="c in chapterList" :key="c.id" :value="c.slug">
                Chương {{ c.so_chuong }}
            </option>
        </select>

        <button 
            @click="nextChapter" 
            :disabled="!hasNext"
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
            Sau &rarr;
        </button>
      </div>

      <!-- Content -->
      <div 
        class="chapter-content text-lg leading-relaxed text-gray-800"
        :class="fontFamily"
        :style="{ fontSize: fontSize + 'px' }"
        v-html="chapter.noi_dung"
      ></div>

      <!-- Navigation Bottom -->
      <div class="flex justify-between items-center mt-12 pt-6 border-t">
        <button 
            @click="prevChapter" 
            :disabled="!hasPrev"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
        >
            Chương Trước
        </button>
        <button 
            @click="nextChapter" 
            :disabled="!hasNext"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400"
        >
            Chương Sau
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
// Updated Import to use 'story.store'
import { useChapterStore } from "../chapter/chapter.store";

const route = useRoute();
const router = useRouter();
const store = useChapterStore();

const chapter = computed(() => store.currentChapter);
const chapterList = computed(() => store.chapterList);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

// Settings State
const fontSize = ref(18);
const fontFamily = ref("font-serif");

const increaseFontSize = () => { if (fontSize.value < 36) fontSize.value += 2; };
const decreaseFontSize = () => { if (fontSize.value > 12) fontSize.value -= 2; };

// Compute Next/Prev
const currentKv = computed(() => {
    if (!chapter.value || chapterList.value.length === 0) return { index: -1 };
    return {
        index: chapterList.value.findIndex(c => c.id === chapter.value?.id)
    }
});

const hasPrev = computed(() => currentKv.value.index > 0);
const hasNext = computed(() => currentKv.value.index >= 0 && currentKv.value.index < chapterList.value.length - 1);

const loadData = () => {
  const slug = route.params.slug as string;
  if (slug) {
    store.fetchChapter(slug);
    window.scrollTo(0, 0);
  }
};

onMounted(() => {
  loadData();
});

watch(() => route.params.slug, () => {
    loadData();
});

const prevChapter = () => {
    if (hasPrev.value) {
        const prev = chapterList.value[currentKv.value.index - 1];
        router.push(`/chuong/${prev.slug}`); 
    }
};

const nextChapter = () => {
    if (hasNext.value) {
        const next = chapterList.value[currentKv.value.index + 1];
        router.push(`/chuong/${next.slug}`);
    }
};

const handleSelectChapter = (event: Event) => {
    const slug = (event.target as HTMLSelectElement).value;
    router.push(`/chuong/${slug}`);
};

</script>

<style scoped>
.chapter-content :deep(p) {
    margin-bottom: 1.5em;
}
</style>
