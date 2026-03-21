<template>
  <div class="sidebar-inner">
    <div class="sidebar-intro">
      <span class="sidebar-kicker">Tùy chọn truyện</span>
      <p class="sidebar-subtitle">
        Lọc nhanh kho audio theo thể loại, tình trạng, và cách sắp xếp để tìm đúng mood nghe.
      </p>
    </div>

    <div class="filter-block">
      <div class="block-header">
        <i class="fas fa-scroll"></i>
        <div>
          <h3>Phân loại</h3>
          <p>Chọn một hoặc nhiều thể loại đang nghe.</p>
        </div>
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
        <div>
          <h3>Tình trạng</h3>
          <p>Lọc theo nhịp cập nhật của truyện.</p>
        </div>
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
        <div>
          <h3>Sắp xếp</h3>
          <p>Chọn cách ưu tiên danh sách audio.</p>
        </div>
      </div>
      <div class="custom-select-wrapper">
        <select v-model="localSort" class="audio-select" @change="emitUpdate">
          <option value="thoi_gian_cap_nhat">Mới cập nhật</option>
          <option value="luot_xem">Nghe nhiều nhất</option>
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
  padding: 10px 0 14px;
}

.sidebar-intro {
  margin: 0 20px 20px;
  padding: 16px 16px 14px;
  border: 1px solid rgba(216, 179, 106, 0.12);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(20, 32, 49, 0.96), rgba(12, 19, 29, 0.82));
}

.sidebar-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: #d8b36a;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sidebar-subtitle {
  margin: 0;
  color: #8ea2b5;
  font-size: 0.84rem;
  line-height: 1.65;
}

.filter-block {
  padding: 20px 20px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.07);
}

.filter-block:last-of-type {
  border-bottom: none;
}

.block-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.block-header i {
  margin-top: 2px;
  color: #7adccc;
  font-size: 0.98rem;
}

.block-header h3 {
  margin: 0 0 4px;
  color: #eef5fb;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.block-header p {
  margin: 0;
  color: #73869b;
  font-size: 0.78rem;
  line-height: 1.5;
}

.filter-loading {
  padding: 16px;
  color: #73869b;
  text-align: center;
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.genre-chip {
  padding: 11px 10px;
  border: 1px solid rgba(125, 220, 204, 0.1);
  border-radius: 14px;
  background: rgba(15, 22, 34, 0.44);
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.genre-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(125, 220, 204, 0.25);
  background: rgba(125, 220, 204, 0.07);
}

.genre-chip.active {
  border-color: rgba(216, 179, 106, 0.22);
  background: rgba(216, 179, 106, 0.08);
  box-shadow: inset 0 0 0 1px rgba(216, 179, 106, 0.18);
}

.chip-text {
  display: block;
  overflow: hidden;
  color: #9db0c2;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.genre-chip.active .chip-text {
  color: #f5dfb3;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.pill-btn {
  display: block;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 14px;
  background: rgba(15, 22, 34, 0.46);
  color: #98abbd;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 700;
  text-align: center;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.pill-btn:hover {
  border-color: rgba(125, 220, 204, 0.18);
  background: rgba(125, 220, 204, 0.05);
}

.pill-btn.active {
  border-color: rgba(216, 179, 106, 0.18);
  background: linear-gradient(135deg, rgba(216, 179, 106, 0.14), rgba(125, 220, 204, 0.09));
  color: #fff4d8;
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
  color: #d8b36a;
  font-family: "Font Awesome 6 Free";
  font-weight: 900;
  pointer-events: none;
}

.audio-select {
  width: 100%;
  appearance: none;
  padding: 13px 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  background: rgba(15, 22, 34, 0.6);
  color: #eef5fb;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.audio-select:focus {
  border-color: rgba(125, 220, 204, 0.28);
  box-shadow: 0 0 0 3px rgba(125, 220, 204, 0.08);
}

.audio-select option {
  background: #121b29;
  color: #eef5fb;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 40px);
  margin: 14px 20px 6px;
  padding: 14px;
  border: 1px dashed rgba(216, 179, 106, 0.22);
  border-radius: 14px;
  background: rgba(216, 179, 106, 0.05);
  color: #f1dcae;
  cursor: pointer;
  font-size: 0.81rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.clear-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(216, 179, 106, 0.32);
  background: rgba(216, 179, 106, 0.1);
}
</style>
