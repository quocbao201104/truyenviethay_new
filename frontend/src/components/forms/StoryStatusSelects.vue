<template>
  <div class="story-status-selects">
    <div class="form-group">
      <label class="form-label"><i class="fas fa-check-circle icon"></i> Trạng thái truyện</label>
      <CustomSelect
        :modelValue="modelValue.trang_thai"
        @update:modelValue="updateField('trang_thai', $event)"
        :options="statusOptions"
        :is-invalid="submitted && !modelValue.trang_thai"
        placeholder="-- Chọn trạng thái --"
      />
      <span v-if="submitted && !modelValue.trang_thai" class="error-message-inline">Vui lòng chọn trạng thái.</span>
    </div>
    
    <div class="form-group">
      <label class="form-label"><i class="fas fa-edit icon"></i> Tình trạng</label>
      <CustomSelect
        :modelValue="modelValue.tinh_trang"
        @update:modelValue="updateField('tinh_trang', $event)"
        :options="tinhTrangOptions"
        :is-invalid="submitted && !modelValue.tinh_trang"
        placeholder="-- Chọn tình trạng --"
      />
      <span v-if="submitted && !modelValue.tinh_trang" class="error-message-inline">Vui lòng chọn tình trạng.</span>
    </div>

    <div class="form-group">
      <label class="form-label"><i class="fas fa-clipboard-list icon"></i> Trạng thái viết</label>
      <CustomSelect
        :modelValue="modelValue.trang_thai_viet"
        @update:modelValue="updateField('trang_thai_viet', $event)"
        :options="trangThaiVietOptions"
        :is-invalid="submitted && !modelValue.trang_thai_viet"
        placeholder="-- Chọn trạng thái viết --"
      />
      <span v-if="submitted && !modelValue.trang_thai_viet" class="error-message-inline">Vui lòng chọn trạng thái viết.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomSelect from '@/components/common/CustomSelect.vue';

interface SelectOption {
  value: string | number;
  label: string;
}

interface StoryStatusFields {
  trang_thai: string;
  tinh_trang: string;
  trang_thai_viet: string;
}

const props = defineProps<{
  modelValue: StoryStatusFields;
  submitted: boolean; 
}>();

const emit = defineEmits(['update:modelValue']);

const statusOptions: SelectOption[] = [
  { value: 'dang_ra', label: 'Đang ra' },
  { value: 'hoan_thanh', label: 'Hoàn thành' },
  { value: 'de_xuat', label: 'Đề xuất' },
];

const tinhTrangOptions: SelectOption[] = [
  { value: 'Đang viết', label: 'Đang viết' },
  { value: 'Chưa hoàn thành', label: 'Chưa hoàn thành' },
];

const trangThaiVietOptions: SelectOption[] = [
  { value: 'dang_tien_hanh', label: 'Bản nháp (Đang tiến hành)' },
  { value: 'hoan_thanh', label: 'Đã hoàn thành' },
];

const updateField = (field: keyof StoryStatusFields, value: string) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};
</script>

<style scoped>
/* CSS đồng bộ với SubmitStoryView.vue và mẫu của bạn */
.form-group {
  margin-bottom: 0.5rem; 
  display: flex;
  flex-direction: column;
  gap: 0.75rem; 
}

.form-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  position: relative;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label .icon {
  color: #22c55e; 
  font-size: 1.2em;
}

.error-message-inline {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-weight: 500;
  display: block;
}

/* CustomSelect's internal styles are handled by CustomSelect.vue, just ensure its global styles match */

@media (max-width: 768px) {
  .form-label {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .form-group { gap: 0.5rem; }
  .form-label { font-size: 0.95rem; gap: 0.3rem; }
  .form-label .icon { font-size: 1em; }
  .error-message-inline { font-size: 0.75rem; margin-top: 0.1rem; }
}
</style>