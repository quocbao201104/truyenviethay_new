<template>
  <div class="story-basic-info-form">
    <div class="form-group">
      <label for="storyName" class="form-label"><i class="fas fa-pen-nib icon"></i> Tên truyện</label>
      <input 
        type="text" 
        id="storyName" 
        :value="modelValue.ten_truyen" 
        @input="updateField('ten_truyen', getInputValue($event))" 
        class="form-input" 
        required 
      >
      <span v-if="submitted && !modelValue.ten_truyen" class="error-message-inline">Tên truyện không được để trống.</span>
    </div>

    <div class="form-group">
      <label for="authorName" class="form-label"><i class="fas fa-user-edit icon"></i> Tác giả</label>
      <input 
        type="text" 
        id="authorName" 
        :value="modelValue.tac_gia" 
        @input="updateField('tac_gia', getInputValue($event))" 
        :placeholder="defaultAuthorName" 
        class="form-input" 
        required 
      >
      <span v-if="submitted && !modelValue.tac_gia" class="error-message-inline">Tên tác giả không được để trống.</span>
    </div>

    <div class="form-group">
      <label for="description" class="form-label"><i class="fas fa-align-left icon"></i> Mô tả</label>
      <textarea 
        id="description" 
        :value="modelValue.mo_ta" 
        @input="updateField('mo_ta', getInputValue($event))" 
        rows="8" 
        class="form-input" 
        placeholder="Nhập mô tả truyện"
        required
      ></textarea>
      <span v-if="submitted && !modelValue.mo_ta" class="error-message-inline">Mô tả không được để trống.</span>
    </div>

    <div class="form-group cover-image-group">
      <label class="form-label"><i class="fas fa-image icon"></i> Ảnh bìa</label>
      <div class="cover-image-preview-container">
        <img
          v-if="coverImagePreview" :src="coverImagePreview"
          alt="Ảnh bìa truyện"
          class="cover-image-preview"
          @error="handleImageError"
        />
        <div v-else class="no-image-placeholder"> <i class="fas fa-image"></i>
          <span>Chưa có ảnh bìa</span>
        </div>

        <input 
          type="file" 
          id="coverImage" 
          @change="handleFileUpload" 
          class="cover-image-input" 
          ref="coverImageInput"
          accept="image/jpeg,image/png,image/gif"
        >
        <button type="button" class="cover-image-btn" @click="coverImageInput?.click()">
          <i class="fas fa-upload"></i> Tải ảnh lên
        </button>
        <button v-if="coverImagePreview" type="button" 
                class="remove-image-btn" 
                @click="removeCoverImage">
          <i class="fas fa-times"></i> Xóa
        </button>
      </div>
      <span v-if="submitted && !modelValue.anh_bia" class="error-message-inline">Ảnh bìa là bắt buộc.</span>
      <span v-if="fileError" class="error-message-inline">{{ fileError }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface StoryBasicInfo {
  ten_truyen: string;
  tac_gia: string;
  mo_ta: string;
  anh_bia: File | null;
}

const props = defineProps<{
  modelValue: StoryBasicInfo;
  defaultAuthorName?: string;
  submitted: boolean; 
  initialCoverUrl?: string; // Prop mới cho ảnh cũ
}>();

const emit = defineEmits(['update:modelValue', 'validation-error', 'delete-initial-cover']);

const coverImageInput = ref<HTMLInputElement | null>(null);
const fileError = ref(''); // Add missing ref

// Logic preview ưu tiên: File mới -> Ảnh cũ -> Null
const coverImagePreview = ref<string | null>(null);

// Watch để cập nhật preview khi có file mới hoặc initialCoverUrl thay đổi
watch(() => [props.modelValue.anh_bia, props.initialCoverUrl], ([newFile, newUrl]) => {
  if (newFile instanceof File) {
    coverImagePreview.value = URL.createObjectURL(newFile);
  } else if (newUrl && typeof newUrl === 'string') {
    // Nếu không có file mới nhưng có url ảnh cũ
     coverImagePreview.value = newUrl;
  } else {
    coverImagePreview.value = null;
  }
}, { immediate: true });

const updateField = (field: keyof StoryBasicInfo, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
};

const getInputValue = (event: Event) => {
  return (event.target as HTMLInputElement).value;
};

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  fileError.value = ''; 
  
  if (!file) {
    updateField('anh_bia', null);
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSizeMB = 5;

  if (!allowedTypes.includes(file.type)) {
    fileError.value = 'Chỉ cho phép định dạng JPG, PNG, GIF.';
    updateField('anh_bia', null);
    emit('validation-error', { field: 'anh_bia', message: fileError.value });
    return;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    fileError.value = `Kích thước ảnh tối đa ${maxSizeMB}MB.`;
    updateField('anh_bia', null);
    emit('validation-error', { field: 'anh_bia', message: fileError.value });
    return;
  }

  updateField('anh_bia', file);
};

const handleImageError = (event: Event) => {
  // Loại bỏ việc gán ảnh mặc định khi lỗi
  // const target = event.target as HTMLImageElement;
  // target.src = defaultCoverUrl;
  // console.log("Lỗi tải ảnh bìa. Ảnh sẽ không hiển thị.");
};

const removeCoverImage = () => {
  updateField('anh_bia', null);
  if (coverImageInput.value) {
    coverImageInput.value.value = ''; 
  }
  emit('delete-initial-cover'); // Notify parent to handle initial cover deletion
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

.form-input {
  padding: 1rem; 
  border-radius: 1rem; 
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #22c55e; 
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 5px rgba(34, 197, 94, 0.2);
}

.form-input:focus {
  border-color: #4ade80; 
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
  outline: none;
}

.form-input.is-invalid {
  border-color: #ef4444; 
}

/* Updated styles for cover image */
.cover-image-group {
  position: relative; 
}

.cover-image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Căn chỉnh trái */
  gap: 1rem;
  position: relative; 
  width: 180px; 
  height: 180px; /* Đặt chiều cao cố định cho container */
  border: 3px dashed #4b5563; /* Viền nét đứt khi không có ảnh */
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.15); /* Nền nhẹ khi không có ảnh */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Đảm bảo ảnh không tràn ra ngoài */
}

.cover-image-preview {
  width: 100%; 
  height: 100%; 
  object-fit: cover;
  border-radius: 1rem; 
  border: 3px solid #22c55e; /* Viền xanh lá khi có ảnh */
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer; 
}

.cover-image-preview:hover {
  transform: scale(1.05); 
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280; /* Màu xám cho placeholder */
  font-size: 0.9rem;
  text-align: center;
}

.no-image-placeholder .fas {
  font-size: 3rem; /* Icon lớn hơn */
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.cover-image-input {
  display: none;
}

.cover-image-btn {
  background: linear-gradient(90deg, #22c55e, #4ade80); 
  color: #1a1d29;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 0.5rem; 
}

.cover-image-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.4s ease;
}

.cover-image-btn:hover::before {
  left: 100%;
}

.cover-image-btn:hover {
  background: linear-gradient(90deg, #4ade80, #22c55e); 
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.6);
}

.remove-image-btn {
  position: absolute;
  top: 10px; 
  right: 10px;
  background-color: rgba(239, 68, 68, 0.9); 
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px; /* Lớn hơn một chút */
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1rem; /* Icon lớn hơn */
  transition: background-color 0.3s ease, transform 0.3s ease;
  z-index: 10; 
}

.remove-image-btn:hover {
  background-color: #dc2626; 
  transform: scale(1.1);
}

.error-message-inline {
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 0.5rem; 
  font-weight: 500;
  display: block;
}

@media (max-width: 768px) {
  .form-input { font-size: 0.9rem; }
  .cover-image-preview, .cover-image-preview-container { width: 150px; height: 150px; }
  .cover-image-btn { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
  .remove-image-btn { width: 30px; height: 30px; font-size: 0.9rem; top: 8px; right: 8px; }
}

@media (max-width: 480px) {
  .form-group { gap: 0.5rem; }
  .form-label { font-size: 0.95rem; }
  .form-input { padding: 0.6rem 0.8rem; font-size: 0.85rem; border-radius: 0.75rem; }
  .cover-image-preview, .cover-image-preview-container { width: 120px; height: 120px; }
  .cover-image-btn { padding: 0.5rem 1rem; font-size: 0.8rem; border-radius: 0.75rem; }
  .remove-image-btn { top: 5px; right: 5px; width: 25px; height: 25px; font-size: 0.8rem; }
  .error-message-inline { font-size: 0.75rem; margin-top: 0.1rem; }
}
</style>