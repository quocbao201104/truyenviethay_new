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
.home-chat-board {
  background: linear-gradient(
    180deg,
    rgba(16, 23, 41, 0.8) 0%,
    rgba(11, 15, 25, 0.9) 100%
  );
  border-radius: 24px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  backdrop-filter: blur(12px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
}

/* Header */
.board-header {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
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
  width: 32px;
  height: 32px;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
}

.board-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.5px;
  margin: 0;
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.count {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

.unit {
  color: rgba(16, 185, 129, 0.6);
  font-weight: 400;
}

/* Message List */
.message-container {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Hiệu ứng mờ dần ở đỉnh để chat trông "vô tận" */
  mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 100%);
}

.chat-msg-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.2s ease;
}

/* Outer zone: fixed width to absorb frame bleed without pushing text */
.avatar-frame-zone {
  flex-shrink: 0;
  width: 52px;       /* 36 avatar + ~8px each side for frame */
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2px;
}

.avatar-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.msg-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%; 
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  background: #1e293b;
  z-index: 2;
  object-fit: cover;
  transform: scale(0.85); /* Slightly smaller to fit frame */
}

.avatar-frame-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.35);
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 3;
  pointer-events: none;
}

/* Add aura rings for avatar frames if needed */
.aura-ring {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.aura-ring.outer { inset: -5px; z-index: 1; }
.aura-ring.inner { inset: -2px; z-index: 3; border: 1px solid rgba(255,255,255,0.2); }


.msg-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 2px; /* Align with avatar better */
}

/* Message Info & Levels */
.msg-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* User Levels - Greenish/Blueish */
.level-user {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Author Levels - Gold/Flame */
.level-author {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 5px rgba(245, 158, 11, 0.2);
}

/* Specific Tiers (Optional override) */
.level-id-1 { color: #94a3b8; border-color: #475569; } /* Level 1: Phàm Nhân */

.msg-user {
  font-size: 0.82rem;
  font-weight: 700;
  color: #34d399; /* Tên người dùng màu nổi hơn */
}

.msg-time {
  font-size: 0.65rem;
  color: #64748b;
}

.msg-text-wrapper {
  position: relative;
  display: inline-block;
  align-self: flex-start;
  margin-top: 4px;
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

.msg-text {
  position: relative;
  z-index: 1;
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 2px 12px 12px 12px;
  display: inline-block;
}

.msg-text.has-frame {
  background: transparent; 
  padding: 10px 14px; /* Tăng padding để text không bị chữ đè lên viền */
}


/* Megaphone Style - Làm rực rỡ hơn */
.is-megaphone {
  background: linear-gradient(
    90deg,
    rgba(245, 158, 11, 0.1) 0%,
    transparent 100%
  );
  padding: 10px;
  border-radius: 12px;
  border-left: 3px solid #f59e0b;
}

.is-megaphone .msg-user {
  color: #f59e0b;
}
.is-megaphone .msg-text {
  background: transparent;
  color: #fbbf24;
  font-weight: 500;
  padding: 0;
}

/* Truyền Âm Phù (Tin nhắn thường) - Khung màu thanh tím lam */
.chat-msg-item:not(.is-megaphone) {
  background: linear-gradient(
    90deg,
    rgba(99, 102, 241, 0.08) 0%,
    transparent 100%
  );
  padding: 10px;
  border-radius: 12px;
  border-left: 3px solid #6366f1;
}

.chat-msg-item:not(.is-megaphone) .msg-user {
  color: #818cf8;
}

.crown-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 10px;
  color: #f59e0b;
  filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.5));
}

/* Footer & Button */
.board-footer {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
}

.join-chat-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.join-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  filter: brightness(1.1);
}

.join-chat-btn:active {
  transform: translateY(0);
}

/* Scrollbar */
.scrollbar-spirit::-webkit-scrollbar {
  width: 3px;
}
.scrollbar-spirit::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.3);
  border-radius: 10px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 0.85rem;
}

@keyframes pulse-spirit {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
.pulse-dot {
  animation: pulse-spirit 2s infinite;
}
</style>
