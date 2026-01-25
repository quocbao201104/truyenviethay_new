<template>
  <transition name="modal-fade" @after-leave="handleAfterLeave">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'; 

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'Modal Title',
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

// Đóng modal khi nhấn Esc
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Ngăn cuộn body khi modal mở
  } else {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = ''; // Cho phép body cuộn lại
  }
});

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal();
  }
};

const handleAfterLeave = () => {
  // Đảm bảo body cuộn lại sau khi transition kết thúc hoàn toàn
  if (!props.isOpen) {
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #2b2f3e; /* Darker background for modal */
  border: 1px solid #22c55e; /* Green border */
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 700px;
  padding: 1.5rem;
  position: relative;
  color: #ffffff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(34, 197, 94, 0.3);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.8rem;
  color: #22c55e;
  font-weight: 700;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ef4444; /* Red on hover */
}

.modal-body {
  max-height: 70vh; /* Giới hạn chiều cao và thêm cuộn */
  overflow-y: auto;
  padding-right: 0.5rem; /* Để tránh nội dung chạm thanh cuộn */
}

/* Scrollbar style */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #3a3e50; /* Darker track */
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background-color: #22c55e; /* Green thumb */
  border-radius: 10px;
  border: 2px solid #3a3e50; /* Padding around thumb */
}

/* Animations for modal content */
.modal-fade-enter-active .modal-content {
  animation: zoomIn 0.3s ease-out;
}

.modal-fade-leave-active .modal-content {
  animation: zoomOut 0.3s ease-in forwards; /* Apply zoomOut on leave */
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes zoomOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9); /* Scale down slightly */
    opacity: 0; /* Fade out */
  }
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1rem;
    border-radius: 0.75rem;
  }
  .modal-title {
    font-size: 1.5rem;
  }
  .close-button {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 0.75rem;
  }
  .modal-title {
    font-size: 1.3rem;
  }
  .close-button {
    font-size: 1.5rem;
  }
}
</style>