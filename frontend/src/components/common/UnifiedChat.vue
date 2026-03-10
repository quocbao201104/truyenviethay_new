<template>
  <div
    v-if="chatStore.isOpen"
    class="chat-shell"
    :class="{ minimized: chatStore.isMinimized }"
  >
    <div class="chat-header">
      <div v-show="!chatStore.isMinimized" class="tabs-container">
        <div class="tabs scrollbar-hide">
          <button
            :class="['tab', { active: chatStore.activeTabId === 'world' }]"
            @click="chatStore.switchTab('world')"
          >
            <i class="fas fa-globe-americas mr-1"></i> World
            <span v-if="chatStore.unreadWorld > 0" class="badge-dot"></span>
          </button>

          <div
            v-for="room in chatStore.authorRoomsList"
            :key="room.authorId"
            class="author-tab-wrap"
          >
            <button
              :class="[
                'tab',
                { active: chatStore.activeTabId === room.authorId },
              ]"
              @click="chatStore.switchTab(room.authorId)"
            >
              <i class="fas fa-at text-[10px] opacity-50"></i> {{ room.name }}
              <span v-if="room.unreadCount > 0" class="badge">{{
                room.unreadCount
              }}</span>
            </button>
            <button
              class="close-room"
              @click.stop="chatStore.leaveRoom(room.authorId)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div
        v-show="chatStore.isMinimized"
        class="mini-info"
        @click="chatStore.setMinimized(false)"
      >
        <span class="online-dot"></span>
        {{ currentOnlineCount }} <span class="opacity-60 ml-1">Online</span>
      </div>

      <div class="actions">
        <button
          class="action-btn"
          @click="chatStore.setMinimized(!chatStore.isMinimized)"
        >
          <i
            :class="
              chatStore.isMinimized ? 'fas fa-chevron-up' : 'fas fa-minus'
            "
          ></i>
        </button>
        <button class="action-btn close-btn" @click="chatStore.isOpen = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div v-show="!chatStore.isMinimized" class="chat-body">
      <div class="presence-bar">
        <i class="fas fa-users mr-2 opacity-50"></i>
        <span
          >{{ currentOnlineCount }} <small>người trực tuyến</small></span
        >
      </div>

      <div class="message-list scrollbar-custom" ref="messageList">
        <div
          v-for="(msg, index) in currentMessages"
          :key="index"
          class="message-row"
          :class="{ mine: isMine(msg), 'megaphone-row': msg.isMegaphone }"
        >
          <div class="avatar-shell" :class="msg.equipped_frame?.css_class || ''" v-if="!isMine(msg)">
            <div class="avatar-container">
              <img class="avatar item-img" :src="getAvatarUrl(msg.avatar)" alt="avatar" />
              <img
                v-if="msg.equipped_frame?.image_url"
                class="avatar-frame-overlay equipped-frame"
                :src="msg.equipped_frame.image_url"
                :alt="msg.equipped_frame.name"
              />
            </div>
          </div>

          <div class="bubble-wrap">
            <div class="name" v-if="!isMine(msg)">
              {{ msg.fullName || msg.username }}
            </div>
            <div class="bubble-content" :class="msg.equipped_frame?.css_class || ''">
              <div class="bubble" :class="[{ megaphone: msg.isMegaphone }, msg.equipped_frame?.css_class || '']">
                {{ msg.content }}
              </div>
              <span class="msg-time-tip">{{
                msg.timestamp ? formatTime(msg.timestamp) : ""
              }}</span>
            </div>
          </div>
        </div>

        <div v-if="currentMessages.length === 0" class="empty-state">
          <i class="fas fa-comments opacity-10 text-5xl mb-2"></i>
          <p>Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>

      <div class="input-area" :class="{ disabled: !authStore.isLoggedIn }">
        <div class="input-wrapper">
          <input
            v-model="newMessage"
            @keyup.enter="handleSendMessage"
            :placeholder="
              authStore.isLoggedIn ? 'Nhập nội dung...' : 'Đăng nhập để chat'
            "
            maxlength="500"
            :disabled="!authStore.isLoggedIn || cooldown > 0"
          />
          <button
            class="send-btn"
            @click="handleSendMessage"
            :disabled="
              !authStore.isLoggedIn || cooldown > 0 || !newMessage.trim()
            "
          >
            <i
              v-if="cooldown > 0"
              class="fas fa-circle-notch fa-spin text-xs"
            ></i>
            <span v-else-if="cooldown === 0"
              ><i class="fas fa-paper-plane"></i
            ></span>
            <span v-if="cooldown > 0" class="cd-number">{{ cooldown }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useChatStore, type Message } from "@/modules/chat/chat.store";
import { getAvatarUrl } from "@/config/constants";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "@/utils/axios";

const authStore = useAuthStore();
const chatStore = useChatStore();

const newMessage = ref("");
const cooldown = ref(0);
const messageList = ref<HTMLElement | null>(null);
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
let cooldownInterval: any = null;

const currentMessages = computed(() => {
  if (chatStore.activeTabId === "world") return chatStore.worldMessages;
  return chatStore.joinedAuthorRooms.get(chatStore.activeTabId)?.messages || [];
});

const currentOnlineCount = computed(() => {
  if (chatStore.activeTabId === "world") return chatStore.onlineCountWorld;
  return (
    chatStore.joinedAuthorRooms.get(chatStore.activeTabId)?.onlineCount || 0
  );
});

const isMine = (msg: Message) =>
  Number(msg.userId) === Number(authStore.user?.id);

const scrollToEnd = () => {
  if (messageList.value) {
    messageList.value.scrollTo({
      top: messageList.value.scrollHeight,
      behavior: "smooth",
    });
  }
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || cooldown.value > 0) return;

  try {
    const url =
      chatStore.activeTabId === "world"
        ? "/api/chat/world"
        : `/api/chat/author/${chatStore.activeTabId}`;

    await axios.post(url, { message: newMessage.value });
    newMessage.value = "";
    startCooldown();
  } catch (err: any) {
    alert(err.response?.data?.message || "Send failed");
  }
};

const startCooldown = () => {
  cooldown.value = 3;
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) clearInterval(cooldownInterval);
  }, 1000);
};

watch(
  () => [currentMessages.value.length, chatStore.activeTabId],
  () => {
    nextTick(() => scrollToEnd());
  },
);

onMounted(() => {
  chatStore.initListeners();
});

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval);
});
</script>

<style scoped>
/* Biáº¿n mÃ u sáº¯c */
:emphasis {
  --primary: #0ea5e9;
  --success: #22c55e;
  --bg-dark: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.95);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}

.chat-shell {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 380px;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2000;
  overflow: hidden;
}

.chat-shell.minimized {
  width: 200px;
  border-radius: 30px;
}

/* Header & Tabs */
.chat-header {
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tabs-container {
  flex: 1;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.tab {
  white-space: nowrap;
  background: transparent;
  color: var(--text-muted);
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  position: relative;
}

.tab.active {
  background: var(--primary);
  color: white;
}

.badge-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 8px #ef4444;
}

/* Chat Body */
.chat-body {
  height: 480px;
  display: flex;
  flex-direction: column;
}

.presence-bar {
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.2);
  font-size: 11px;
  color: #38bdf8;
  display: flex;
  align-items: center;
}

.message-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Bubble Styles */
.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 90%;
  animation: fadeIn 0.3s ease;
}

.message-row.mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-shell {
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  --avatar-frame-scale: 1.32;
}

.avatar-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.avatar-frame-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  transform: scale(var(--avatar-frame-scale));
  transform-origin: center;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.25));
}

.name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 4px;
  margin-left: 4px;
}

.bubble {
  background: #334155;
  color: #f1f5f9;
  padding: 10px 14px;
  border-radius: 16px;
  border-top-left-radius: 2px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  transition: 0.2s;
}

.mine .bubble {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 16px;
  border-top-right-radius: 2px;
  border-top-left-radius: 16px;
}

.bubble.megaphone {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #000;
  font-weight: 700;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

.bubble-content[class] .bubble:not(.megaphone) {
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.08), 0 8px 18px rgba(0, 0, 0, 0.18);
}

/* Input Area */
.input-area {
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
}

.input-wrapper {
  display: flex;
  background: #0f172a;
  border-radius: 14px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: 0.3s;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}

.input-area input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 12px;
  outline: none;
  font-size: 14px;
}

.send-btn {
  background: var(--success);
  color: #052e16;
  border: none;
  border-radius: 10px;
  width: 38px;
  height: 38px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.cd-number {
  font-size: 9px;
  font-weight: 800;
}

/* Custom Scrollbar */
.scrollbar-custom::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}


.avatar-shell.frame-phoenix-fire {
  --avatar-frame-scale: 1.72;
}

.avatar-shell.frame-bang-tinh {
  --avatar-frame-scale: 1.22;
}

.avatar-shell.frame-thien-thanh {
  --avatar-frame-scale: 1.24;
}

.avatar-shell.frame-phoenix-fire .avatar-frame-overlay,
.bubble.frame-phoenix-fire {
  filter: drop-shadow(0 0 10px rgba(251, 146, 60, 0.55));
}

.bubble.frame-phoenix-fire {
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.24), transparent 38%),
    linear-gradient(135deg, #4a1d12 0%, #7c2d12 46%, #431407 100%);
  border: 1px solid rgba(251, 146, 60, 0.45);
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.24), inset 0 0 20px rgba(255, 237, 213, 0.05);
  animation: phoenixFlare 2.8s ease-in-out infinite;
}

.avatar-shell.frame-phoenix-fire::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 14px;
  background: radial-gradient(circle, rgba(251, 113, 133, 0.22), transparent 70%);
  filter: blur(8px);
  opacity: 0.8;
  pointer-events: none;
  animation: phoenixHalo 2.8s ease-in-out infinite;
}

.avatar-shell.frame-bang-tinh .avatar-frame-overlay,
.bubble.frame-bang-tinh {
  filter: drop-shadow(0 0 10px rgba(125, 211, 252, 0.6));
}

.bubble.frame-bang-tinh {
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.28), transparent 36%),
    linear-gradient(135deg, #082f49 0%, #0f3d5e 45%, #172554 100%);
  border: 1px solid rgba(125, 211, 252, 0.35);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.2);
}

.avatar-shell.frame-thien-thanh .avatar-frame-overlay,
.bubble.frame-thien-thanh {
  filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.58));
}

.bubble.frame-thien-thanh {
  background:
    radial-gradient(circle at top left, rgba(216, 180, 254, 0.26), transparent 40%),
    linear-gradient(135deg, #312e81 0%, #4c1d95 52%, #1e1b4b 100%);
  border: 1px solid rgba(196, 181, 253, 0.35);
  box-shadow: 0 0 18px rgba(139, 92, 246, 0.22);
}

@keyframes phoenixFlare {
  0%, 100% {
    box-shadow: 0 0 18px rgba(249, 115, 22, 0.18), inset 0 0 18px rgba(255, 237, 213, 0.04);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 0 28px rgba(249, 115, 22, 0.35), inset 0 0 26px rgba(254, 215, 170, 0.08);
    transform: translateY(-1px);
  }
}

@keyframes phoenixHalo {
  0%, 100% { opacity: 0.45; transform: scale(0.96); }
  50% { opacity: 0.9; transform: scale(1.05); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

