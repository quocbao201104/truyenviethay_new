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
    :style="{ '--duration': duration + 's' }"
    @animationend="onEnd"
  >
    <span class="ticker-content">
      <span class="ticker-sender">{{ currentMessage.fullName || currentMessage.username }}</span>
      <span class="ticker-sep">：</span>
      <span class="ticker-text">{{ currentMessage.content }}</span>
      <span class="ticker-spacer">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </span>

    <span class="ticker-content">
      <span class="ticker-sender">{{ currentMessage.fullName || currentMessage.username }}</span>
      <span class="ticker-sep">：</span>
      <span class="ticker-text">{{ currentMessage.content }}</span>
      <span class="ticker-spacer">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    </span>
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
const duration = ref(12);

let hideTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => chatStore.megaphoneQueue.length, () => {
  const queue = chatStore.megaphoneQueue;
  if (!queue.length) return;

  const latest = queue[queue.length - 1];
  showMessage(latest);
});

async function showMessage(msg: any) {
  currentMessage.value = msg;

  await nextTick();
  calcDuration();

  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    currentMessage.value = null;
  }, duration.value * 1000 + 1000);
}

function calcDuration() {
  if (!trackRef.value) return;

  const wrapper = trackRef.value.querySelector('.ticker-scroll-wrapper') as HTMLElement;
  if (!wrapper) return;

  const containerWidth = trackRef.value.offsetWidth;
  const textWidth = wrapper.scrollWidth;

const speed = 160;
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
/* Container chính: Thêm hiệu ứng phát sáng (Glow) */
.megaphone-ticker {
  width: 100%;
  height: 42px; /* Tăng nhẹ chiều cao để rộng rãi hơn */
  background: linear-gradient(90deg, rgba(40, 25, 5, 0.95) 0%, rgba(20, 15, 5, 0.98) 50%, rgba(40, 25, 5, 0.95) 100%);
  border-top: 1px solid rgba(245, 158, 11, 0.5);
  border-bottom: 1px solid rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3), inset 0 0 10px rgba(245, 158, 11, 0.1);
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 900;
  position: relative;
  backdrop-filter: blur(8px);
}

/* Luồng sáng lướt qua (Shimmer) tạo cảm giác cao cấp */
.shimmer-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  transform: skewX(-20deg);
  animation: shimmer 3s infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* Khối icon: Làm nổi bật hơn */
.ticker-icon {
  flex-shrink: 0;
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fbbf24, #d97706, #b45309);
  color: #fff;
  font-size: 1.1rem;
  z-index: 2;
  box-shadow: 2px 0 10px rgba(217, 119, 6, 0.5);
  position: relative;
}

/* Gradient mờ dần từ icon ra text */
.ticker-icon::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(90deg, rgba(217, 119, 6, 0.4), transparent);
  pointer-events: none;
}

/* Hiệu ứng rung và nháy cho icon chiếc loa */
.megaphone-anim {
  animation: megaphone-pulse 1.5s infinite;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
}

@keyframes megaphone-pulse {
  0% { transform: scale(1) rotate(0deg); }
  15% { transform: scale(1.15) rotate(-15deg); }
  30% { transform: scale(1.15) rotate(10deg); }
  45% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.ticker-track {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 2;
}

/* Wrapper dài vô tận chứa 2 bản sao */
.ticker-scroll-wrapper {
  display: flex;
  align-items: center;
  width: max-content;
  padding-left: 100vw; /* Khởi đầu từ bên phải màn hình */
 animation: seamless-scroll var(--duration) linear forwards;
}

/* Nội dung của 1 bản copy */
.ticker-content {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.ticker-spacer {
  display: inline-block;
  width: 25vw; /* Tạo độ hở vừa phải giữa vòng 1 và vòng 2 */
}

/* Tên người gửi: Nổi bật rực rỡ bằng Gradient Text và Bóng đổ */
.ticker-sender {
  font-weight: 900;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  background: linear-gradient(to right, #fde047, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0px 0px 8px rgba(245, 158, 11, 0.6);
  text-transform: uppercase;
}

.ticker-sep {
  color: rgba(251, 191, 36, 0.8);
  margin: 0 6px;
  font-weight: bold;
}

/* Nội dung tin nhắn: Sáng và rõ ràng hơn */
.ticker-text {
  color: #fffbeb;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

@keyframes seamless-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100%));
  }
}

/* Enter/Leave transition: Mượt mà và có độ nảy nhẹ */
.ticker-slide-enter-active {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out;
}
.ticker-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-in;
}

.ticker-slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.ticker-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>