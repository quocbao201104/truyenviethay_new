<template>
  <div class="home-chat-board">
    <div class="board-header">
      <div class="header-left">
        <div class="icon-box">
          <i class="fas fa-comment-dots"></i>
        </div>
        <h3 class="board-title">World Chat</h3>
      </div>

      <div v-if="chatStore.onlineCountWorld > 0" class="online-indicator">
        <span class="pulse-dot"></span>
        <span class="count"
          >{{ chatStore.onlineCountWorld }}
          <span class="unit">online</span></span
        >
      </div>
    </div>

    <div class="message-container scrollbar-spirit" ref="msgList">
      <div
        v-for="(msg, index) in chatStore.worldMessages"
        :key="index"
        :class="['chat-msg-item', { 'is-megaphone': msg.isMegaphone }]"
      >
        <div class="avatar-frame-zone" :class="msg.equipped_frame?.css_class">
          <div class="avatar-wrapper">
            <span v-if="msg.equipped_frame" class="aura-ring outer"></span>
            <span v-if="msg.equipped_frame" class="aura-ring inner"></span>
            <img
              class="msg-avatar"
              :src="getAvatarUrl(msg.avatar)"
              alt="avatar"
              crossorigin="anonymous"
            />
            <img
              v-if="msg.equipped_frame?.image_url"
              :src="msg.equipped_frame.image_url"
              class="avatar-frame-overlay"
              alt="frame"
              crossorigin="anonymous"
            />
            <div v-if="msg.isMegaphone" class="crown-icon">
              <i class="fas fa-crown"></i>
            </div>
          </div>
        </div>

        <div class="msg-content">
          <div class="msg-info">
            <div v-if="msg.level" class="level-badge" :class="['level-' + msg.level.type, 'level-id-' + msg.level.id]">
              <i v-if="msg.level.type === 'author'" class="fas fa-feather-alt mr-1"></i>
              <i v-else class="fas fa-medal mr-1"></i>
            </div>
            <span class="msg-user">{{
              msg.fullName || msg.username || "Anonymous"
            }}</span>
            <UserBadge v-if="msg.badge" :badge="msg.badge" size="xs" />
            <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <div class="msg-text-wrapper" :class="msg.equipped_chat_color?.css_class">
            <img
              v-if="msg.equipped_chat_color?.image_url"
              :src="msg.equipped_chat_color.image_url"
              alt="chat frame"
              class="chat-bg-frame"
            />
            <div class="msg-text" :class="{ 'has-frame': msg.equipped_chat_color?.image_url || msg.equipped_chat_color?.css_class }">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="chatStore.worldMessages.length === 0" class="empty-state">
        <i class="fas fa-ghost mb-2 opacity-20 text-3xl"></i>
        <p>Chưa có tin nhắn nào...</p>
      </div>
    </div>

    <div class="board-footer">
      <button class="join-chat-btn" @click="chatStore.toggleChat()">
        <span>MỞ KHUNG CHAT</span>
        <i class="fas fa-external-link-alt ml-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { useChatStore } from "@/modules/chat/chat.store";
import { getAvatarUrl } from "@/config/constants";
import UserBadge from "@/modules/gamification/components/UserBadge.vue";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const chatStore = useChatStore();
const msgList = ref<HTMLElement | null>(null);

const formatTime = (timestamp: number) => {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  } catch (e) {
    return "vừa xong";
  }
};

const scrollToEnd = () => {
  if (msgList.value) {
    msgList.value.scrollTop = msgList.value.scrollHeight;
  }
};

watch(
  () => chatStore.worldMessages.length,
  () => {
    nextTick(() => scrollToEnd());
  },
);

onMounted(() => {
  chatStore.initListeners();
  nextTick(() => scrollToEnd());
});
</script>

<style scoped>
/* ===== CORE THEME - TRẬN PHÁP TRUYỀN ÂM ===== */
.home-chat-board {
  background: rgba(11, 15, 25, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.15);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
}

/* Hiệu ứng ánh sáng hắt từ góc */
.home-chat-board::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.05), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ===== HEADER ===== */
.board-header {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-box {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.board-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.05);
}

.count {
  font-size: 0.8rem;
  color: #34d399;
  font-weight: 700;
}

.unit {
  color: rgba(52, 211, 153, 0.7);
  font-weight: 500;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-spirit 2s infinite;
}

/* ===== MESSAGE LIST ===== */
.message-container {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px; /* Tăng khoảng cách các dòng chat cho thoáng */
  mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 100%);
}

.chat-msg-item {
  display: flex;
  align-items: flex-start;
  gap: 16px; /* Tăng gap để chữ xa avatar hơn một chút */
  transition: transform 0.3s ease;
  animation: fadeInMsg 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.chat-msg-item:hover {
  transform: translateX(4px);
}

/* Avatar Zone - Tăng kích thước bao ngoài để Frame rộng đường bay lượn */
.avatar-frame-zone {
  flex-shrink: 0;
  width: 60px; /* Tăng từ 48px -> 60px để chứa Khung Cửu Vĩ / Phượng Hoàng */
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.avatar-wrapper {
  position: relative;
  width: 44px; /* Tăng nhẹ đường kính avatar 40px -> 44px */
  height: 44px;
  border-radius: 50%;
}

.msg-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%; 
  border: 2px solid rgba(56, 189, 248, 0.3);
  background: #1e293b;
  z-index: 2;
  object-fit: cover;
}

.avatar-frame-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.5); /* Scale to để che phủ tốt hơn */
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 3;
  pointer-events: none;
}

.crown-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 14px;
  color: #fbbf24;
  z-index: 4;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.9));
  transform: rotate(15deg);
}

/* Message Content */
.msg-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-top: 2px; /* Hạ thấp nội dung xuống xíu cho cân với avatar */
}

.msg-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-user { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
.level-author { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }

.msg-user {
  font-size: 0.9rem; /* Tên to hơn chút */
  font-weight: 800;
  color: #e2e8f0;
}

.msg-time {
  font-size: 0.7rem;
  color: #94a3b8; /* Tăng độ sáng (Màu cũ tối quá khó đọc) */
  margin-left: auto;
  font-style: italic; /* Nghiêng nhẹ tạo sự tách biệt */
}

.msg-text-wrapper {
  position: relative;
  display: inline-block;
  align-self: flex-start;
  margin-top: 4px; /* Tách nội dung xa tên user ra 1 chút */
}

.chat-bg-frame {
  position: absolute;
  top: -20px; 
  left: -20px;
  width: calc(100% + 40px);
  height: calc(100% + 40px);
  z-index: 0;
  pointer-events: none;
  object-fit: fill; 
}

/* ===== CHAT BUBBLES ===== */

/* 1. Tin nhắn thường (Truyền Âm Phù - Blue Glow) */
.chat-msg-item:not(.is-megaphone) {
  background: rgba(15, 23, 42, 0.4); /* Nền cực nhẹ để đỡ bị rối */
  padding: 14px;
  border-radius: 16px;
  border-left: 3px solid #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.1); /* Thêm viền mờ */
}

.chat-msg-item:not(.is-megaphone) .msg-user {
  color: #38bdf8;
}

.msg-text {
  position: relative;
  z-index: 1;
  font-size: 0.85rem;
  color: #f8fafc;
  line-height: 1.5;
  /* BỎ nền xám xịt, dùng nền trong suốt để làm nổi viền tổng thể */
  background: transparent; 
  padding: 4px 0; /* Padding nhỏ lại vì viền tổng đã gánh rồi */
  display: inline-block;
  word-wrap: break-word;
}

/* Xóa nền nếu người dùng mặc Khung Chat (Frame) */
.msg-text.has-frame:not(.is-megaphone .msg-text) {
  padding: 12px 16px; /* Căn chỉnh lại cho vừa vặn với khung */
}

/* 2. Tin nhắn Megaphone (Loa Truyền Âm - Fire/Gold Glow) */
.is-megaphone {
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.4) 100%);
  padding: 14px;
  border-radius: 16px;
  border-left: 3px solid #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2); /* Thêm viền lửa */
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
}

.is-megaphone .msg-user {
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

/* BỎ MÀU NỀN CAM ĐẶC KỊT, CHỈ DÙNG CHỮ MÀU VÀNG KIM */
.is-megaphone .msg-text {
  background: transparent !important;
  color: #fcd34d !important; /* Chữ màu vàng kim */
  font-weight: 700;
  padding: 4px 0 !important;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;
  border: none !important; /* Xóa viền vuông vức khó chịu */
  box-shadow: none !important;
}

/* Ẩn ảnh frame nền nếu đang dùng Megaphone */
.is-megaphone .chat-bg-frame {
  display: none !important;
}

/* ===== FOOTER & BUTTON ===== */
.board-footer {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.join-chat-btn {
  width: 100%;
  height: 48px;
  /* Đổi màu Xanh Công Nghiệp -> Gradient Xanh Ngọc Huyền Ảo Tiên Hiệp */
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 14px;
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 6px 15px rgba(14, 165, 233, 0.3), inset 0 2px 0 rgba(255,255,255,0.1);
}

.join-chat-btn:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.5), inset 0 2px 0 rgba(255,255,255,0.2);
}

.join-chat-btn:active {
  transform: translateY(0);
}

/* ===== SCROLLBAR & ANIMATIONS ===== */
.scrollbar-spirit::-webkit-scrollbar { width: 4px; }
.scrollbar-spirit::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.3);
  border-radius: 10px;
}
.scrollbar-spirit::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 189, 248, 0.6);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.9rem;
}

@keyframes pulse-spirit {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>