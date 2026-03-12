cd<template>
  <!-- Chat Bubble Floating (FAB) -->
  <div 
    v-if="authStore.isLoggedIn"
    class="chat-bubble-fab"
    :class="{ hidden: chatStore.isOpen }"
    @click="chatStore.isOpen = true"
  >
    <div class="bubble-inner">
      <i class="fas fa-comments"></i>
      <span v-if="totalUnread > 0" class="unread-badge">{{ totalUnread }}</span>
    </div>
  </div>

  <div
    v-if="chatStore.isOpen"
    class="chat-shell"
    :class="{ minimized: chatStore.isMinimized }"
  >
    <div class="chat-header">
      <div class="header-main">
        <div class="tabs-container">
          <div class="tabs scrollbar-hide">
            <button
              :class="['tab', { active: chatStore.activeTabId === 'world' }]"
              @click="chatStore.switchTab('world')"
            >
              <i class="fas fa-globe-americas mr-1"></i> Thế giới
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
                class="close-tab-btn"
                @click.stop="chatStore.leaveRoom(room.authorId)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button
            class="header-btn"
            title="Thu nhỏ"
            @click="chatStore.isOpen = false"
          >
            <i class="fas fa-minus"></i>
          </button>
          <button 
            class="header-btn close" 
            title="Đóng"
            @click="chatStore.isOpen = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="chat-body">
      <div class="presence-bar">
        <i class="fas fa-users mr-2 opacity-50"></i>
        <span>{{ currentOnlineCount }} <small>đang trực tuyến</small></span>
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
              <span v-if="msg.level" class="[msg.level.type]">
              </span>
              {{ msg.fullName || msg.username }}
              <UserBadge v-if="msg.badge" :badge="msg.badge" size="xs" />
            </div>
            
            <div class="bubble-content" :class="[msg.equipped_frame?.css_class || '', msg.equipped_chat_color?.css_class || '']">
              <div class="bubble-wrapper">
                <img
                  v-if="msg.equipped_chat_color?.image_url"
                  :src="msg.equipped_chat_color.image_url"
                  alt="chat frame"
                  class="chat-bg-frame"
                />
                <div class="bubble" :class="[{ megaphone: msg.isMegaphone }, { 'has-frame': msg.equipped_chat_color?.image_url }, msg.equipped_frame?.css_class || '', msg.equipped_chat_color?.css_class || '']">
                  {{ msg.content }}
                </div>
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
        <!-- the old megaphone bar has been removed -->
        <div class="input-wrapper">
          <button
            v-if="chatStore.activeTabId === 'world'"
            class="megaphone-toggle-btn"
            :class="{ active: isMegaphoneActive }"
            @click="toggleMegaphone"
            title="Bật/tắt Loa Truyền Âm"
          >
            <i class="fas fa-bullhorn"></i>
            <span v-if="megaphoneCooldown > 0" class="cd-overlay">{{ megaphoneCooldown }}s</span>
          </button>
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
import UserBadge from "@/modules/gamification/components/UserBadge.vue";
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
const hasMegaphoneItem = ref(false);

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

const totalUnread = computed(() => {
  let count = chatStore.unreadWorld;
  chatStore.authorRoomsList.forEach((room) => {
    count += room.unreadCount;
  });
  return count;
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

const isMegaphoneActive = ref(false);

// Auto-activate megaphone when triggered from Inventory (item ID 3 "Dùng ngay")
watch(
  () => chatStore.pendingMegaphoneActivation,
  (pending) => {
    if (pending && hasMegaphoneItem.value) {
      isMegaphoneActive.value = true;
      chatStore.pendingMegaphoneActivation = false;
    } else if (pending && !hasMegaphoneItem.value) {
      // Re-check access then activate
      refreshMegaphoneAccess().then(() => {
        if (hasMegaphoneItem.value) isMegaphoneActive.value = true;
        chatStore.pendingMegaphoneActivation = false;
      });
    }
  },
);

const toggleMegaphone = () => {
  if (!hasMegaphoneItem.value) {
    alert("Bạn cần mua 'Loa Truyền Âm' trong Cửa Hàng để sử dụng chức năng này!");
    return;
  }
  isMegaphoneActive.value = !isMegaphoneActive.value;
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || cooldown.value > 0 || !authStore.isLoggedIn) return;

  try {
    const text = newMessage.value;

    if (chatStore.activeTabId === "world") {
      if (isMegaphoneActive.value) {
        if (megaphoneCooldown.value > 0) return;
        await axios.post("/api/chat/world/megaphone", { message: text });
        
        // Start Megaphone cooldown
        megaphoneCooldown.value = 60;
        if (megaphoneInterval) clearInterval(megaphoneInterval);
        megaphoneInterval = setInterval(() => {
          megaphoneCooldown.value--;
          if (megaphoneCooldown.value <= 0) clearInterval(megaphoneInterval);
        }, 1000);
      } else {
        await axios.post("/api/chat/world", { message: text });
      }
    } else {
      await axios.post(`/api/chat/author/${chatStore.activeTabId}`, { message: text });
    }

    newMessage.value = "";
    startCooldown();
    nextTick(() => scrollToEnd());
  } catch (err: any) {
    alert(err.response?.data?.message || "Send failed");
  }
};

const megaphoneCooldown = ref(0);
let megaphoneInterval: any = null;

const startCooldown = () => {
  cooldown.value = 3;
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) clearInterval(cooldownInterval);
  }, 1000);
};

watch(
  () => [currentMessages.value.length, chatStore.activeTabId, chatStore.isOpen],
  () => {
    if (chatStore.isOpen) {
      nextTick(() => scrollToEnd());
    }
  },
);

const refreshMegaphoneAccess = async () => {
  if (!authStore.isLoggedIn) return;
  try {
    const res = await axios.get("/api/chat/megaphone-access");
    hasMegaphoneItem.value = !!res.data?.data?.hasAccess;
  } catch {
    hasMegaphoneItem.value = false;
  }
};

onMounted(async () => {
  chatStore.initListeners();
  await refreshMegaphoneAccess();
});

// Re-check every time the chat panel opens so that a recent purchase is reflected
watch(
  () => chatStore.isOpen,
  async (open) => {
    if (open) {
      await refreshMegaphoneAccess();
    }
  },
);

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval);
});
</script>

<style scoped>
/* COLORS & VARIABLES */
.chat-shell {
  --chan-bg: #0f172a;
  --chan-header: #1e293b;
  --chan-accent: #6366f1;
  --chan-bubble-mine: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  --chan-bubble-others: #334155;
  --chan-text-main: #f8fafc;
  --chan-text-muted: #94a3b8;
}

/* FLOATING BUBBLE (FAB) */
.chat-bubble-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  cursor: pointer;
  z-index: 1999;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-bubble-fab.hidden {
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}

.chat-bubble-fab:hover {
  transform: scale(1.1);
}

.bubble-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
  color: white;
  font-size: 24px;
  position: relative;
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #111827;
  animation: bounce 1s infinite alternate;
}

/* CHAT SHELL */
.chat-shell {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  background: var(--chan-bg);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* HEADER */
.chat-header {
  background: var(--chan-header);
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tabs-container {
  flex: 1;
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.author-tab-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding-right: 8px;
  transition: 0.2s;
}

.tab {
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.05);
  color: var(--chan-text-muted);
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
}

.tab.active {
  background: var(--chan-accent);
  color: white;
}

.author-tab-wrap .tab {
  background: transparent !important;
  padding-right: 6px;
}

.author-tab-wrap:has(.tab.active) {
  background: var(--chan-accent);
}

.close-tab-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: 0.2s;
}

.close-tab-btn:hover {
  color: white;
  opacity: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.header-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: var(--chan-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.header-btn.close:hover {
  background: #ef4444;
}

/* BODY */
.chat-body {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.presence-bar {
  padding: 8px 16px;
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
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--chan-text-muted);
}

/* MESSAGES */
.message-row {
  display: flex;
  align-items: flex-start; /* Changed from flex-end to flex-start */
  gap: 10px;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}

.message-row.mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-shell {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  position: relative;
  margin-top: 2px;
  --avatar-frame-scale: 1.45;
}

.message-row:not(.mine) .avatar-shell {
  margin-right: 2px;
}

.mine .avatar-shell {
  margin-left: 2px;
}

.avatar-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  transform: scale(0.85);
}

.bubble-wrap {
  display: flex;
  flex-direction: column;
}

.mine .bubble-wrap {
  align-items: flex-end;
}

.name {
  font-size: 11px;
  font-weight: 800;
  color: var(--chan-text-muted);
  margin-bottom: 4px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.level-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  line-height: 1;
}

.level-badge.level-author {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.level-badge.level-user {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.bubble-wrapper {
  position: relative;
  display: inline-block;
  margin-top: 2px;
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

.bubble {
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--chan-text-main);
  background: var(--chan-bubble-others);
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.bubble.has-frame {
  background: transparent !important;
  padding: 12px 18px;
  border: none;
  box-shadow: none;
}

.bubble.megaphone {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #000;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mine .bubble {
  background: var(--chan-bubble-mine);
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-row:not(.mine) .bubble {
  border-bottom-left-radius: 4px;
}

.msg-time-tip {
  font-size: 10px;
  color: var(--chan-text-muted);
  margin-top: 4px;
  display: block;
}

/* INPUT */
.input-area {
  padding: 16px;
  background: var(--chan-header);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #0b0f19;
  border-radius: 14px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: 0.3s;
  gap: 6px;
}

.input-wrapper:focus-within {
  border-color: var(--chan-accent);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.megaphone-toggle-btn {
  background: transparent;
  color: #6b7280;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
  margin-left: 2px;
}

.megaphone-toggle-btn:hover {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.megaphone-toggle-btn.active {
  color: #f59e0b;
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
  animation: pulse-loa 2s infinite;
}

@keyframes pulse-loa {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.cd-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
  color: white;
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 12px;
  outline: none;
  font-size: 14px;
}

.send-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 10px;
  width: 38px;
  height: 38px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  background: #059669;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cd-number {
  font-size: 10px;
  font-weight: 800;
}

/* MOBILE RESPONSIVE */
@media (max-width: 640px) {
  .chat-shell {
    right: 0;
    bottom: 0;
    width: 100%;
    height: 75vh;
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    border: none;
  }

  .chat-body {
    height: calc(100% - 60px);
  }

  .chat-bubble-fab {
    right: 15px;
    bottom: 15px;
  }
}

/* ANIMATIONS */
@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounce {
  to { transform: translateY(-3px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* FRAME OVERLAYS */
.avatar-frame-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transform: scale(var(--avatar-frame-scale));
  transform-origin: center;
}

.avatar-shell.frame-phoenix-fire { --avatar-frame-scale: 1.72; }
.avatar-shell.frame-bang-tinh { --avatar-frame-scale: 1.22; }
.avatar-shell.frame-thien-thanh { --avatar-frame-scale: 1.24; }

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

/* Cửu Vĩ Hồ (ID 7) */
.avatar-shell.frame-nine-tails-purple { --avatar-frame-scale: 1.6; }
.avatar-shell.frame-nine-tails-purple .avatar-frame-overlay,
.bubble.frame-nine-tails-purple {
  filter: drop-shadow(0 0 10px rgba(192, 132, 252, 0.6));
}
.bubble.frame-nine-tails-purple {
  background: 
    radial-gradient(circle at top left, rgba(232, 121, 249, 0.2), transparent 40%),
    linear-gradient(135deg, #4c1d95 0%, #701a75 50%, #4c1d95 100%);
  border: 1px solid rgba(192, 132, 252, 0.4);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
}

/* Thất Sắc (ID 14) */
.avatar-shell.frame-that-sac { --avatar-frame-scale: 1.5; }
.bubble.frame-that-sac {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: rainbow-border 4s linear infinite;
}
@keyframes rainbow-border {
  0% { border-color: rgba(255, 182, 193, 0.6); box-shadow: 0 0 10px rgba(255, 182, 193, 0.3); }
  25% { border-color: rgba(255, 250, 205, 0.6); box-shadow: 0 0 10px rgba(255, 250, 205, 0.3); }
  50% { border-color: rgba(175, 238, 238, 0.6); box-shadow: 0 0 10px rgba(175, 238, 238, 0.3); }
  75% { border-color: rgba(232, 121, 249, 0.6); box-shadow: 0 0 10px rgba(232, 121, 249, 0.3); }
  100% { border-color: rgba(255, 182, 193, 0.6); box-shadow: 0 0 10px rgba(255, 182, 193, 0.3); }
}


/* SCROLLBAR */
.scrollbar-custom::-webkit-scrollbar { width: 4px; }
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.name.mine-badge {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2px;
}
</style>

