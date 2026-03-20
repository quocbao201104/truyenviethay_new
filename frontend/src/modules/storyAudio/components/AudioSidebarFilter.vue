<template>
  <div class="sidebar-inner">
    <div class="filter-block">
      <div class="block-header">
        <i class="fas fa-scroll"></i>
        <h3>Phân loại</h3>
      </div>
      <div v-if="loadingGenres" class="filter-loading">
        <i class="fas fa-yin-yang fa-spin"></i>
      </div>
      <div v-else class="genre-grid">
        <label
          v-for="genre in genres"
          :key="genre.id_theloai"
          class="genre-chip"
          :class="{ active: selectedGenres.includes(genre.id_theloai) }"
        >
          <input
            v-model="selectedGenres"
            type="checkbox"
            :value="genre.id_theloai"
            hidden
            @change="emitUpdate"
          />
          <span class="chip-text">{{ genre.ten_theloai }}</span>
        </label>
      </div>
    </div>

    <div class="filter-block">
      <div class="block-header">
        <i class="fas fa-hourglass-half"></i>
        <h3>Tình trạng</h3>
      </div>
      <div class="status-options">
        <label
          v-for="opt in STATUS_OPTIONS"
          :key="opt.value"
          class="status-pill"
        >
          <input v-model="localStatus" type="radio" :value="opt.value" hidden @change="emitUpdate" />
          <span class="pill-btn" :class="{ active: localStatus === opt.value }">
            {{ opt.label }}
          </span>
        </label>
      </div>
    </div>

    <div class="filter-block">
      <div class="block-header">
        <i class="fas fa-sort-amount-down"></i>
        <h3>Sắp xếp</h3>
      </div>
      <div class="custom-select-wrapper">
        <select v-model="localSort" class="xianxia-select" @change="emitUpdate">
          <option value="thoi_gian_cap_nhat">Mới cập nhật</option>
          <option value="luot_xem">Xem nhiều nhất</option>
          <option value="luot_thich">Được yêu thích</option>
          <option value="avg_rating">Đánh giá cao</option>
          <option value="ten_truyen">Tên A-Z</option>
        </select>
      </div>
    </div>

    <button class="clear-btn" @click="handleClear">
      <i class="fas fa-trash-restore"></i>
      Xóa bộ lọc
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import axios from "@/utils/axios";

export interface AudioFilters {
  sort_by: string;
  trang_thai: string;
  genre_ids: number[];
}

const props = defineProps<{
  filters: AudioFilters;
}>();

const emit = defineEmits<{
  (e: "update", filters: AudioFilters): void;
  (e: "clear"): void;
}>();

const localSort = ref(props.filters.sort_by);
const localStatus = ref(props.filters.trang_thai);
const selectedGenres = ref<number[]>([...props.filters.genre_ids]);

const genres = ref<{ id_theloai: number; ten_theloai: string }[]>([]);
const loadingGenres = ref(false);

const STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Đang ra", value: "dang_ra" },
  { label: "Hoàn thành", value: "hoan_thanh" },
];

const fetchGenres = async () => {
  loadingGenres.value = true;
  try {
    const response = await axios.get("/api/theloai");
    genres.value = response.data.data || [];
  } catch {
    genres.value = [];
  } finally {
    loadingGenres.value = false;
  }
};

watch(
  () => props.filters,
  (val) => {
    localSort.value = val.sort_by;
    localStatus.value = val.trang_thai;
    selectedGenres.value = [...val.genre_ids];
  },
  { deep: true },
);

const emitUpdate = () => {
  emit("update", {
    sort_by: localSort.value,
    trang_thai: localStatus.value,
    genre_ids: [...selectedGenres.value],
  });
};

const handleClear = () => {
  emit("clear");
};

onMounted(() => {
  fetchGenres();
});
</script>

<style scoped>
.sidebar-inner {
  padding: 4px 0 8px;
}

.filter-block {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.07);
}

.filter-block:last-of-type {
  border-bottom: none;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.block-header i {
  color: #74dbf3;
  font-size: 1rem;
}

.block-header h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.filter-loading {
  padding: 16px;
  color: var(--app-text-subtle, #64748b);
  text-align: center;
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.genre-chip {
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  background: rgba(12, 18, 29, 0.4);
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}

.genre-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(91, 196, 232, 0.25);
  background: rgba(91, 196, 232, 0.05);
}

.genre-chip.active {
  border-color: rgba(91, 196, 232, 0.35);
  background: rgba(91, 196, 232, 0.12);
}

.chip-text {
  display: block;
  overflow: hidden;
  color: var(--app-text-muted, #94a3b8);
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.genre-chip.active .chip-text {
  color: #a9ebff;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pill-btn {
  display: block;
  padding: 12px 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  background: rgba(12, 18, 29, 0.4);
  color: var(--app-text-muted, #94a3b8);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.pill-btn:hover {
  background: rgba(91, 196, 232, 0.06);
}

.pill-btn.active {
  border-color: rgba(91, 196, 232, 0.2);
  border-left: 3px solid #48cfa5;
  background: rgba(91, 196, 232, 0.12);
  color: #a9ebff;
}

.custom-select-wrapper {
  position: relative;
}

.custom-select-wrapper::after {
  content: "\f107";
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: #74dbf3;
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  pointer-events: none;
}

.xianxia-select {
  width: 100%;
  appearance: none;
  padding: 12px 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background: rgba(12, 18, 29, 0.55);
  color: #e2e8f0;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.xianxia-select:focus {
  border-color: rgba(91, 196, 232, 0.35);
  box-shadow: 0 0 0 3px rgba(91, 196, 232, 0.08);
}

.xianxia-select option {
  background: #151e2d;
  color: #e2e8f0;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 40px);
  margin: 12px 20px 4px;
  padding: 14px;
  border: 1px dashed rgba(223, 120, 135, 0.24);
  border-radius: 12px;
  background: rgba(223, 120, 135, 0.06);
  color: #e59ba8;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.clear-btn:hover {
  transform: translateY(-1px);
  border-style: solid;
  background: rgba(223, 120, 135, 0.12);
  color: #ffe4e8;
}
</style>
