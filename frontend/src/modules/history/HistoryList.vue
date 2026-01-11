<template>
  <div class="history-list container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">Lịch Sử Đọc</h2>

    <div v-if="loading" class="text-center py-8">Đang tải...</div>
    <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
    
    <div v-else-if="history.length === 0" class="text-center text-gray-500 py-10">
      Bạn chưa đọc truyện nào.
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in history" :key="item.id" class="flex gap-4 p-4 border rounded-lg hover:shadow-md transition bg-white">
        <!-- Assuming item.truyen exists, handle structure if backend is flat -->
        <router-link :to="`/truyen/${item.truyen?.slug}`" class="flex-shrink-0 w-20 h-28">
            <img 
              :src="item.truyen?.anh_bia ? (item.truyen.anh_bia.startsWith('http') ? item.truyen.anh_bia : `http://localhost:3000/uploads_img/${item.truyen.anh_bia}`) : '/placeholder.jpg'" 
              alt="Cover"
              class="w-full h-full object-cover rounded"
            />
        </router-link>
        <div class="flex-grow">
            <h3 class="font-bold text-lg text-gray-800">
                <router-link :to="`/truyen/${item.truyen?.slug}`">{{ item.truyen?.ten_truyen }}</router-link>
            </h3>
            <p class="text-gray-600 mt-1">
                Đọc tiếp: 
                <router-link 
                    v-if="item.chapter"
                    :to="`/truyen/${item.truyen?.slug}/${item.chapter?.slug}`" 
                    class="text-blue-600 font-medium hover:underline"
                >
                    {{ item.chapter.ten_chuong }} (Chương {{ item.chapter.so_chuong }})
                </router-link>
                <span v-else class="text-gray-400">Không có dữ liệu chương</span>
            </p>
            <p class="text-sm text-gray-400 mt-2">{{ new Date(item.thoi_gian_doc).toLocaleString('vi-VN') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useHistoryStore } from "./history.store";

const store = useHistoryStore();
const history = computed(() => store.history);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(() => {
  store.fetchHistory();
});
</script>
