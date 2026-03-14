<template>
  <transition name="ticker-slide">
    <div v-if="currentMessage" class="megaphone-ticker">
      <div class="shimmer-effect"></div>

      <div class="ticker-icon">
        <i class="fas fa-bullhorn megaphone-anim"></i>
      </div>

      <div class="ticker-track" ref="trackRef">
        <div
          class="ticker-scroll-wrapper"
          :style="{ animationDuration: duration + 's' }"
          @animationend="onEnd"
        >
          <span class="ticker-sender">{{ currentMessage.fullName || currentMessage.username }}</span>
          
          <i class="fas fa-bolt ticker-sep"></i>
          
          <span class="ticker-text">{{ currentMessage.content }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { useChatStore } from '@/modules/chat/chat.store';

const chatStore = useChatStore();

const currentMessage = ref<any>(null);
const trackRef = ref<HTMLElement | null>(null);
const duration = ref(10); // Thời gian mặc định

let hideTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => chatStore.megaphoneQueue.length, () => {
  const queue = chatStore.megaphoneQueue;
  if (!queue.length) return;

  const latest = queue[queue.length - 1];
  showMessage(latest);
});

async function showMessage(msg: any) {
  currentMessage.value = msg;

  // Đợi DOM render xong để lấy width
  await nextTick();
  calcDuration();

  // Backup timer: Phòng trường hợp @animationend bị xịt do người dùng chuyển tab
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    onEnd();
  }, (duration.value + 1) * 1000); // Cộng thêm 1s cho chắc chắn
}

function calcDuration() {
  if (!trackRef.value) return;

  const wrapper = trackRef.value.querySelector('.ticker-scroll-wrapper') as HTMLElement;
  if (!wrapper) return;

  const containerWidth = trackRef.value.offsetWidth;
  const textWidth = wrapper.scrollWidth;

  // Tốc độ chạy (pixel/giây) - Chỉnh số này để loa chạy nhanh hay chậm
  const speed = 150; 
  duration.value = (containerWidth + textWidth) / speed;
}

function onEnd() {
  currentMessage.value = null;
}

onUnmounted(() => {
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<style scoped>
/* ===== CONTAINER ===== */
.megaphone-ticker {
  width: 100%;
  height: 44px; /* Rộng rãi hơn chút */
  /* Background tông Đỏ/Cam đen quyền lực */
  background: linear-gradient(90deg, rgba(25, 5, 0, 0.95) 0%, rgba(40, 15, 0, 0.98) 50%, rgba(25, 5, 0, 0.95) 100%);
  border-bottom: 1px solid rgba(245, 158, 11, 0.6);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2), inset 0 0 15px rgba(245, 158, 11, 0.1);
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 900;
  position: relative;
  backdrop-filter: blur(8px);
}

/* ===== SHIMMER EFFECT ===== */
.shimmer-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent);
  transform: skewX(-25deg);
  animation: shimmer 3.5s infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* ===== ICON BOX ===== */
.ticker-icon {
  flex-shrink: 0;
  width: 55px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b, #ea580c, #9a3412);
  color: #fff;
  font-size: 1.15rem;
  z-index: 3;
  box-shadow: 4px 0 15px rgba(234, 88, 12, 0.6);
  position: relative;
}

/* Tia sáng hắt ra từ cục icon */
.ticker-icon::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 0;
  width: 30px;
  height: 100%;
  background: linear-gradient(90deg, rgba(234, 88, 12, 0.6), transparent);
  pointer-events: none;
}

.megaphone-anim {
  animation: megaphone-pulse 1.5s infinite;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
}

@keyframes megaphone-pulse {
  0% { transform: scale(1) rotate(0deg); }
  15% { transform: scale(1.15) rotate(-15deg); }
  30% { transform: scale(1.15) rotate(10deg); }
  45% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}

/* ===== TICKER TRACK & TEXT ===== */
.ticker-track {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 2;
}

.ticker-scroll-wrapper {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  /* Bí kíp: Bắt đầu từ mép phải của khung (100% chiều rộng khung) */
  padding-left: 100%; 
  animation-name: seamless-scroll;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}

.ticker-sender {
  font-weight: 900;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  background: linear-gradient(to right, #fde047, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0px 0px 10px rgba(245, 158, 11, 0.4); /* Glow ngoài mờ */
  text-transform: uppercase;
}

/* Dấu phân cách mới: Icon tia sét rực lửa */
.ticker-sep {
  color: #fbbf24;
  margin: 0 14px;
  font-size: 0.85rem;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.8));
}

.ticker-text {
  color: #fffbeb;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

/* Di chuyển hoàn toàn ra khỏi lề trái */
@keyframes seamless-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

/* ===== TRANSITIONS ===== */
.ticker-slide-enter-active {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out;
}
.ticker-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-in;
}

.ticker-slide-enter-from,
.ticker-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>