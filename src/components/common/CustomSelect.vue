<template>
  <div class="custom-select" ref="selectRef">
    <div
      class="select-selected"
      :class="{ open: isOpen, 'is-invalid': isInvalid }"
      @click="isOpen = !isOpen"
    >
      {{ selectedLabel }}
      <i class="fas fa-chevron-down select-arrow"></i>
    </div>
    <div class="select-items" v-show="isOpen">
      <div
        v-for="option in options"
        :key="option.value"
        @click="selectOption(option)"
        class="select-item"
        :class="{ 'same-as-selected': option.value === modelValue }"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface SelectOption {
  value: string | number;
  label: string;
}

const props = defineProps({
  options: {
    type: Array as () => SelectOption[],
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: false, // modelValue có thể không có khi khởi tạo (placeholder)
    default: '',
  },
  placeholder: {
    type: String,
    default: '-- Chọn --',
  },
  isInvalid: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : props.placeholder;
});

const selectOption = (option: SelectOption) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const closeOnOutsideClick = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  font-family: 'Manrope', sans-serif; /* Font đồng bộ */
  color: #ffffff;
}

.select-selected {
  padding: 0.75rem 1rem; /* Padding đồng bộ với form-input */
  border-radius: 0.5rem; /* Bo tròn đồng bộ với form-input */
  background: rgba(255, 255, 255, 0.05); /* Nền mờ */
  border: 1px solid rgba(76, 175, 80, 0.3); /* Viền xanh lá mờ */
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  font-size: 1rem; /* Font size đồng bộ */
}

.select-selected.open,
.select-selected:hover {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3); 
}

.select-selected.is-invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.select-arrow {
  transition: transform 0.3s ease;
  color: #4caf50;
}

.select-selected.open .select-arrow {
  transform: rotate(180deg);
}

.select-items {
  position: absolute;
  background-color: #2a2d3a; 
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 99;
  border-radius: 0.5rem;
  border: 1px solid #4caf50; 
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.select-item {
  padding: 0.75rem 1rem; 
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  color: #e5e7eb;
  font-size: 1rem;
}

.select-item:hover, .select-item.same-as-selected {
  background-color: #4caf50; 
  color: #1a1d29; 
}
</style>