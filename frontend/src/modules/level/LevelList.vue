<template>
  <div class="level-list p-4 bg-white rounded shadow text-center">
    <h3 class="text-xl font-bold mb-4">Hệ Thống Cấp Bậc</h3>
    
    <div v-if="loading">Đang tải...</div>
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <div v-else class="flex flex-col gap-3">
        <div v-for="level in levels" :key="level.id" class="p-3 border rounded-lg flex justify-between items-center" :style="{ borderColor: level.mau_sac || '#ddd' }">
            <span class="font-bold" :style="{ color: level.mau_sac || '#000' }">{{ level.ten_cap_bac }}</span>
            <span class="text-sm text-gray-500">Yêu cầu: {{ level.diem_yeu_cau }} điểm</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useLevelStore } from "./level.store";

const store = useLevelStore();
const levels = computed(() => store.levels);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

onMounted(() => {
    store.fetchLevels();
});
</script>
