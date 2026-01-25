<template>
  <div class="story-category-selector">
    <label class="form-label"><i class="fas fa-tags icon"></i> Thể loại (có thể chọn nhiều)</label>
    <div class="genre-grid">
      <label 
        v-for="category in categories" 
        :key="category.id_theloai" 
        class="genre-label"
      >
        <input 
          type="checkbox" 
          :value="category.id_theloai" 
          v-model="selectedCategories" />
        <span class="genre-checkmark">{{ category.ten_theloai }}</span>
      </label>
    </div>
    <span v-if="submitted && modelValue.length === 0" class="error-message-inline">Vui lòng chọn ít nhất một thể loại.</span>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue'; // Import computed

interface Category {
  id_theloai: number;
  ten_theloai: string;
  slug: string;
}

const props = defineProps({
  categories: {
    type: Array as PropType<Category[]>,
    required: true,
  },
  modelValue: { // Prop nhận giá trị từ cha (mảng ID đã chọn)
    type: Array as PropType<number[]>,
    required: true,
  },
  submitted: { 
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

// Sử dụng computed property với getter và setter cho v-model
const selectedCategories = computed({
  get() {
    return props.modelValue;
  },
  set(newValue: number[]) {
    emit('update:modelValue', newValue);
  },
});
</script>

<style scoped>
/* === CSS MỚI CHO THỂ LOẠI (từ mẫu của bạn) === */
.form-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  position: relative;
  transition: color 0.3s ease;
  display: flex; /* Để icon và text trên cùng một dòng */
  align-items: center;
  gap: 0.5rem;
}

.form-label .icon {
  color: #22c55e; /* Màu xanh lá cho icon */
  font-size: 1.2em;
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #22c55e; /* Màu xanh lá */
}

.genre-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.genre-label input[type="checkbox"] {
  display: none; /* Ẩn checkbox mặc định */
}

.genre-checkmark {
  padding: 0.5rem 1rem;
  border: 1px solid #4b5563;
  border-radius: 0.75rem;
  color: #d1d5db;
  font-weight: 500;
  text-align: center;
  width: 100%;
  transition: all 0.3s ease;
}

.genre-label input[type="checkbox"]:checked + .genre-checkmark {
  background-color: #22c55e; /* Màu xanh lá khi chọn */
  border-color: #4ade80; /* Màu xanh lá nhạt hơn khi chọn */
  color: #1a1d29;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); /* Shadow xanh lá */
}

.genre-label:hover .genre-checkmark {
  border-color: #22c55e; /* Màu xanh lá khi hover */
}

.error-message-inline {
  color: #ef4444; /* Đảm bảo màu đỏ cho lỗi */
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-weight: 500;
  display: block;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-label {
    font-size: 1rem;
  }
  .genre-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.8rem;
  }
  .genre-checkmark {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}
@media (max-width: 480px) {
  .form-label {
    font-size: 0.95rem;
  }
  .genre-grid {
    gap: 0.5rem;
    padding: 0.8rem;
  }
  .genre-checkmark {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    border-radius: 0.5rem;
  }
}
</style>