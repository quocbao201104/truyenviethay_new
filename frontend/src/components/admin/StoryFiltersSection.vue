<template>
  <div class="story-filters-section">
    <div class="filter-group">
      <label for="statusFilter" class="filter-label"><i class="fas fa-filter icon"></i> Trạng thái duyệt:</label>
      <CustomSelect
        id="statusFilter"
        :options="statusOptions"
        v-model="internalFilters.trang_thai_kiem_duyet"
        placeholder="Tất cả trạng thái"
      />
    </div>

    <div class="filter-group">
      <label for="categoryFilter" class="filter-label"><i class="fas fa-tags icon"></i> Thể loại:</label>
      <CustomSelect
        id="categoryFilter"
        :options="formattedCategories"
        v-model="internalFilters.category_id"
        placeholder="Tất cả thể loại"
      />
    </div>

    <div class="filter-group search-group">
      <label for="keywordSearch" class="filter-label"><i class="fas fa-search icon"></i> Tìm kiếm:</label>
      <div class="search-input-wrapper">
        <input
          type="text"
          id="keywordSearch"
          v-model="internalFilters.keyword"
          placeholder="Tên truyện hoặc tác giả"
          class="filter-input"
          @keyup.enter="applyFilters"
        />
        <button
          v-if="internalFilters.keyword"
          @click="clearKeyword"
          class="clear-search-btn"
          title="Xóa tìm kiếm"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="filter-actions">
      <button @click="applyFilters" class="apply-btn">
        <i class="fas fa-check-circle"></i> Áp dụng
      </button>
      <button @click="clearAllFilters" class="clear-btn" title="Xóa tất cả bộ lọc">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, PropType, computed } from 'vue';
import CustomSelect from '@/components/common/CustomSelect.vue';

interface Filters {
  trang_thai_kiem_duyet: string;
  keyword: string;
  author_id: number | null;
  category_id: number | null;
}

interface Category {
  id_theloai: number;
  ten_theloai: string;
  slug: string;
}

const props = defineProps({
  initialFilters: {
    type: Object as PropType<Filters>,
    default: () => ({
      trang_thai_kiem_duyet: '',
      keyword: '',
      author_id: null,
      category_id: null,
    }),
  },
  categories: {
    type: Array as PropType<Category[]>,
    required: true,
  },
});

const emit = defineEmits(['applyFilters', 'clearFilters']);

const internalFilters = ref<Filters>({ ...props.initialFilters });

const statusOptions = ref([
  { value: '', label: 'Tất cả' },
  { value: 'cho_duyet', label: 'Chờ duyệt' },
  { value: 'da_duyet', label: 'Đã duyệt' },
  { value: 'tu_choi', label: 'Từ chối' },
]);

const formattedCategories = computed(() => {
  if (!Array.isArray(props.categories)) return [{ value: null, label: 'Tất cả' }];
  return [{ value: null, label: 'Tất cả' }, ...props.categories.map(cat => ({
    value: cat.id_theloai,
    label: cat.ten_theloai,
  }))];
});

watch(() => props.initialFilters, (newFilters) => {
  internalFilters.value = { ...newFilters };
}, { deep: true });

const applyFilters = () => {
  emit('applyFilters', internalFilters.value);
};

const clearKeyword = () => {
  internalFilters.value.keyword = '';
  applyFilters();
};

const clearAllFilters = () => {
  internalFilters.value = {
    trang_thai_kiem_duyet: '',
    keyword: '',
    author_id: null,
    category_id: null,
  };
  emit('clearFilters');
};
</script>

<style scoped>
.story-filters-section {
  background: linear-gradient(135deg, rgba(13, 22, 36, 0.9), rgba(16, 27, 42, 0.84));
  border: 1px solid rgba(120, 144, 168, 0.26);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 18px 36px rgba(3, 9, 20, 0.26);
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  color: #ffffff;
}

.filter-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #d7e6f3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.01em;
}

.filter-label .icon {
  color: #72e2cd;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.filter-input {
  padding: 0.78rem 1rem;
  border-radius: 0.68rem;
  background: rgba(8, 14, 22, 0.54);
  border: 1px solid rgba(120, 144, 168, 0.3);
  color: #f1f7ff;
  font-size: 0.92rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  width: 100%; 
  padding-right: 2.5rem; 
}

.filter-input:focus {
  border-color: rgba(114, 226, 205, 0.58);
  background: rgba(17, 28, 42, 0.78);
  box-shadow: 0 0 0 3px rgba(114, 226, 205, 0.12);
  outline: none;
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #8ea5b8;
  cursor: pointer;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.clear-search-btn:hover {
  color: #d5e8f8;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.apply-btn,
.clear-btn {
  padding: 0.72rem 1.3rem;
  border-radius: 0.8rem;
  border: none;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(3, 9, 20, 0.24);
}

.apply-btn {
  background: linear-gradient(135deg, #61dcc4, #8de7f5);
  color: #08131d;
  border: 1px solid rgba(143, 232, 247, 0.34);
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(6, 16, 26, 0.32);
}

.clear-btn {
  background: rgba(12, 20, 33, 0.72);
  border: 1px solid rgba(120, 144, 168, 0.3);
  color: #c8d8e8;
  width: 45px;
  height: 45px;
  justify-content: center;
}

.clear-btn:hover {
  background: rgba(120, 144, 168, 0.18);
  border-color: rgba(114, 226, 205, 0.45);
  color: #e6f2ff;
  transform: translateY(-1px);
}

:deep(.custom-select .select-selected) {
  border-radius: 0.68rem;
  border: 1px solid rgba(120, 144, 168, 0.3);
  background: rgba(8, 14, 22, 0.54);
  color: #f1f7ff;
  font-size: 0.92rem;
}

:deep(.custom-select .select-selected.open),
:deep(.custom-select .select-selected:hover) {
  border-color: rgba(114, 226, 205, 0.52);
  background: rgba(17, 28, 42, 0.78);
  box-shadow: 0 0 0 3px rgba(114, 226, 205, 0.12);
}

:deep(.custom-select .select-arrow) {
  color: #72e2cd;
}

:deep(.custom-select .select-items) {
  background: rgba(10, 17, 27, 0.96);
  border: 1px solid rgba(120, 144, 168, 0.32);
  box-shadow: 0 14px 26px rgba(3, 9, 20, 0.34);
}

:deep(.custom-select .select-item) {
  color: #d2dfec;
}

:deep(.custom-select .select-item:hover),
:deep(.custom-select .select-item.same-as-selected) {
  background: rgba(114, 226, 205, 0.16);
  color: #e8fffa;
}

@media (max-width: 768px) {
  .story-filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  .filter-group {
    min-width: unset;
    width: 100%;
  }
  .filter-actions {
    flex-direction: row; 
    justify-content: space-between; 
    gap: 0.75rem;
  }
  .apply-btn {
    flex-grow: 1; 
    justify-content: center;
  }
  .clear-btn {
    width: auto; 
    flex-shrink: 0; 
  }
}

@media (max-width: 480px) {
  .filter-actions {
    flex-direction: column; 
  }
  .apply-btn, .clear-btn {
    width: 100%;
  }
}
</style>
