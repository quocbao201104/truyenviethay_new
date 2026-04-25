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
        :key="(msg.id ?? msg.timestamp ?? index)"
        v-memo="[msg]"
        :class="['chat-msg-item', { 'is-megaphone': msg.isMegaphone }]"
      >
        <div v-if="!msg.isMegaphone" class="spirit-array-center small" :class="msg.equipped_frame?.css_class">
          <div class="magic-circle-spin" v-if="msg.equipped_frame"></div>
          <div class="magic-circle-reverse" v-if="msg.equipped_frame"></div>
          <div class="avatar-wrapper">
            <img
              class="msg-avatar hero-avatar item-img"
              :src="getAvatarUrl(msg.avatar)"
              alt="avatar"
              crossorigin="anonymous"
            />
            <img
              v-if="msg.equipped_frame?.image_url"
              :src="getImageUrl(msg.equipped_frame.image_url)"
              class="hero-frame"
              alt="frame"
              crossorigin="anonymous"
            />
            <div v-if="msg.isMegaphone" class="crown-icon">
              <i class="fas fa-crown"></i>
            </div>
          </div>
        </div>

        <div v-if="msg.isMegaphone" class="megaphone-card">
          <div class="megaphone-label">
            <i class="fas fa-bullhorn megaphone-icon" aria-hidden="true"></i>
            <span class="megaphone-title">Megaphone</span>
          </div>
          <div class="megaphone-body">{{ msg.content }}</div>
          <div class="megaphone-meta">
            <div class="megaphone-sender">
              <i
                v-if="getRoleIcon(msg)"
                class="msg-role-icon"
                :class="getRoleIcon(msg)"
                aria-hidden="true"
              ></i>
              <span class="megaphone-name">{{ msg.fullName || msg.username || "Anonymous" }}</span>
            </div>
            <span class="megaphone-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>

        <div v-else class="msg-content">
          <div class="msg-info">
            <div class="msg-nameplate" :style="getIdentityStyle(msg)">
              <i
                v-if="getRoleIcon(msg)"
                class="msg-role-icon"
                :class="getRoleIcon(msg)"
                aria-hidden="true"
              ></i>
              <span class="msg-user">{{
                msg.fullName || msg.username || "Anonymous"
              }}</span>
              <UserBadge v-if="msg.badge" :badge="msg.badge" size="xs" />
            </div>
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

      <div ref="endAnchor" class="scroll-anchor"></div>

      <div v-if="chatStore.worldMessages.length === 0" class="empty-state">
        <i class="fas fa-ghost mb-2 opacity-20 text-3xl"></i>
        <p>Cần đăng nhập để xem tin nhắn...</p>
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
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useChatStore } from "@/modules/chat/chat.store";
import { getAvatarUrl, getImageUrl } from "@/config/constants";
import UserBadge from "@/modules/gamification/components/UserBadge.vue";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const chatStore = useChatStore();
const msgList = ref<HTMLElement | null>(null);
const endAnchor = ref<HTMLElement | null>(null);
let isAtBottom = true;
let scrollRaf = 0;
let anchorObserver: IntersectionObserver | null = null;

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

const getRoleAccent = (msg: any) => {
  const role = String(msg.role || "").toUpperCase();
  if (role === "ADMIN") return "#f0b7c2";
  if (role === "MOD" || role === "MODERATOR") return "#9ed6ec";
  if (msg.level?.type === "author") return "#e9cd84";
  return "#8fa8c2";
};

const getRoleIcon = (msg: any) => {
  const role = String(msg.role || "").toUpperCase();
  if (role === "ADMIN") return "fas fa-shield-halved role-admin-icon";
  if (role === "MOD" || role === "MODERATOR") return "fas fa-user-shield role-mod-icon";
  if (msg.level?.type === "author") return "fas fa-feather-pointed role-author-icon";
  return null;
};

const getIdentityStyle = (msg: any) => ({
  "--identity-accent": msg.badge?.color || getRoleAccent(msg),
});

const scrollToEnd = () => {
  if (!msgList.value || !isAtBottom) return;
  msgList.value.scrollTop = msgList.value.scrollHeight;
};

const scheduleScrollToEnd = () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    scrollToEnd();
  });
};

const setupAnchorObserver = () => {
  if (!msgList.value || !endAnchor.value) return;
  anchorObserver = new IntersectionObserver(
    ([entry]) => {
      isAtBottom = entry.isIntersecting;
    },
    { root: msgList.value, threshold: 0.9 },
  );
  anchorObserver.observe(endAnchor.value);
};

watch(
  () => chatStore.worldMessages.length,
  () => {
    scheduleScrollToEnd();
  },
  { flush: "post" },
);

onMounted(() => {
  chatStore.initListeners();
  setupAnchorObserver();
  scheduleScrollToEnd();
});

onBeforeUnmount(() => {
  if (anchorObserver) anchorObserver.disconnect();
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
});
</script>

<style scoped>
/* ===== CORE THEME - TRẬN PHÁP TRUYỀN ÂM ===== */
.home-chat-board {
  background: rgba(18, 26, 39, 0.88);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: var(--app-radius-md);
  border: 1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-shadow: var(--app-shadow-1);
  position: relative;
}

/* Hiệu ứng ánh sáng hắt từ góc */
.home-chat-board::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(circle at 50% 0%, rgba(91, 196, 232, 0.03), transparent 48%);
  pointer-events: none;
  z-index: 0;
}

.scroll-anchor {
  height: 1px;
  width: 100%;
}

/* ===== HEADER ===== */
.board-header {
  position: relative;
  z-index: 1;
  padding: 16px 20px;
  background: linear-gradient(90deg, rgba(91, 196, 232, 0.08) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  background: rgba(91, 196, 232, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-accent);
  font-size: 1.1rem;
  box-shadow: none;
  border: 1px solid rgba(91, 196, 232, 0.18);
}

.board-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: none;
}

.online-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: none;
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
  animation: none;
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
  gap: 16px;
  mask-image: none;
  -webkit-mask-image: none;
}

.chat-msg-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: transform 0.2s ease;
  animation: fadeInMsg 0.25s ease-out;
}

.chat-msg-item:hover {
  transform: translateX(2px);
}

.chat-msg-item.is-megaphone {
  display: block;
}

/* Avatar Zone - Tăng kích thước bao ngoài để Frame rộng đường bay lượn */
/* Avatar Tụ Linh Trận (Scaled down for Chat) */
.spirit-array-center {
  position: relative; 
  width: 48px; 
  height: 48px; 
  flex-shrink: 0;
  display: flex; 
  align-items: center; 
  justify-content: center;
  overflow: visible;
  --aura-primary: 56, 189, 248; /* Default blue for chat */
}

.spirit-array-center.frame-phoenix-fire { --aura-primary: 239, 68, 68; }
.spirit-array-center.frame-bang-tinh { --aura-primary: 56, 189, 248; }
.spirit-array-center.frame-thien-thanh { --aura-primary: 234, 179, 8; }
.spirit-array-center.frame-nine-tails-purple { --aura-primary: 168, 85, 247; }
.spirit-array-center.frame-chan-long { --aura-primary: 251, 191, 36; }

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; 
  inset: -3px; 
  border-radius: 50%;
  border: 1.5px dashed rgba(var(--aura-primary), 0.4);
  pointer-events: none;
  z-index: 0;
  filter: none;
}
.magic-circle-reverse {
  inset: -6px; 
  border: 1px dotted rgba(var(--aura-primary), 0.6);
}

.avatar-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  z-index: 1;
}

.msg-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%; 
  border: 2px solid rgba(var(--aura-primary), 0.8);
  background: #000;
  z-index: 2;
  object-fit: cover;
  box-shadow: none;
  transform: scale(0.80); /* Match Ranking */
}

.hero-frame {
  position: absolute; 
  inset: 0; 
  width: 100%; 
  height: 100%; 
  object-fit: contain;
  transform: scale(1.45); 
  z-index: 3; 
  pointer-events: none; 
}

.crown-icon {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 11px;
  color: #fbbf24;
  z-index: 4;
  filter: none;
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

.megaphone-card {
  position: relative;
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(231, 189, 112, 0.12);
  background: linear-gradient(180deg, rgba(73, 53, 26, 0.12), rgba(24, 30, 42, 0.88));
}

.megaphone-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 999px;
  background: rgba(231, 189, 112, 0.52);
}

.megaphone-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: rgba(243, 209, 139, 0.82);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.megaphone-icon {
  font-size: 10px;
  color: #f0c97d;
}

.megaphone-title {
  color: rgba(244, 213, 149, 0.9);
}

.megaphone-name {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #d9e4ef;
}

.megaphone-body {
  color: #f5f7fb;
  font-size: 15px;
  line-height: 1.68;
  word-break: break-word;
}

.msg-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.msg-nameplate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: min(100%, 290px);
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--identity-accent, #8fa8c2) 34%, rgba(255, 255, 255, 0.06));
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--identity-accent, #8fa8c2) 16%, rgba(255, 255, 255, 0.04)),
      rgba(255, 255, 255, 0.02)
    );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.msg-role-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  opacity: 0.92;
  flex-shrink: 0;
}

.role-admin-icon {
  color: #f0b7c2;
}

.role-mod-icon {
  color: #c6e7f5;
}

.role-author-icon {
  color: #efd89d;
}

.msg-user {
  font-size: 0.9rem; /* Tên to hơn chút */
  font-weight: 800;
  color: #eef4fb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-time {
  font-size: 0.7rem;
  color: #94a3b8; /* Tăng độ sáng (Màu cũ tối quá khó đọc) */
  margin-left: auto;
  font-style: italic; /* Nghiêng nhẹ tạo sự tách biệt */
}

.megaphone-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  color: rgba(209, 218, 230, 0.6);
  flex-wrap: wrap;
}

.megaphone-sender {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.megaphone-sender .msg-role-icon {
  font-size: 9px;
  opacity: 0.84;
}

.megaphone-time {
  color: rgba(209, 218, 230, 0.48);
  font-size: 10px;
  white-space: nowrap;
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
  background: rgba(15, 23, 42, 0.42);
  padding: 14px;
  border-radius: 14px;
  border-left: 3px solid #38bdf8;
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.chat-msg-item:not(.is-megaphone) .msg-user {
  color: #eef4fb;
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
  background: transparent;
  padding: 0;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.is-megaphone .msg-user {
  color: #eef4fb;
  text-shadow: none;
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
  background: rgba(0, 0, 0, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.join-chat-btn {
  width: 100%;
  height: 48px;
  background: rgba(91, 196, 232, 0.14);
  border: 1px solid rgba(91, 196, 232, 0.2);
  border-radius: 14px;
  color: #eaf4fd;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
  box-shadow: none;
}

.join-chat-btn:hover {
  transform: translateY(-1px);
  background: rgba(91, 196, 232, 0.2);
  box-shadow: none;
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

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
