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
          <div v-if="!isMine(msg)" class="spirit-array-center chat-mini" :class="msg.equipped_frame?.css_class">
            <div class="magic-circle-spin" v-if="msg.equipped_frame"></div>
            <div class="magic-circle-reverse" v-if="msg.equipped_frame"></div>
            <div class="avatar-wrapper">
              <img class="avatar item-img" :src="getAvatarUrl(msg.avatar)" alt="avatar" />
              <img
                v-if="msg.equipped_frame?.image_url"
                class="hero-frame"
                :src="getImageUrl(msg.equipped_frame.image_url)"
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
import { getAvatarUrl, getImageUrl } from "@/config/constants";
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
/* ===== COLORS & VARIABLES ===== */
.chat-shell {
  --chan-bg: #0b0f19; /* Nền tối sâu hơn */
  --chan-header: #131b2c;
  --chan-accent: #38bdf8; /* Xanh ngọc bích Thanh Vân */
  --chan-bubble-mine: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  --chan-bubble-others: #1e293b;
  --chan-text-main: #f8fafc;
  --chan-text-muted: #94a3b8;
  --chan-border: rgba(255, 255, 255, 0.08);
}

/* ===== FLOATING BUBBLE (FAB) ===== */
.chat-bubble-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  cursor: pointer;
  z-index: 1999;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-bubble-fab.hidden {
  transform: scale(0) rotate(-45deg);
  opacity: 0;
  pointer-events: none;
}

.chat-bubble-fab:hover {
  transform: scale(1.1) translateY(-5px);
}

.bubble-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.5);
  color: white;
  font-size: 24px;
  position: relative;
  border: 2px solid rgba(255,255,255,0.1);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 12px;
  border: 2px solid #0b0f19;
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.5);
  animation: bounce 1s infinite alternate;
}

/* ===== CHAT SHELL (GLASSMORPHISM) ===== */
.chat-shell {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  background: rgba(11, 15, 25, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--chan-border);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  overflow: hidden;
  animation: slideIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* ===== HEADER ===== */
.chat-header {
  background: rgba(19, 27, 44, 0.9);
  padding: 12px 16px;
  border-bottom: 1px solid var(--chan-border);
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
  padding-bottom: 4px;
}

.author-tab-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding-right: 8px;
  transition: 0.3s;
  border: 1px solid transparent;
}

.tab {
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.05);
  color: var(--chan-text-muted);
  border: none;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--chan-text-main);
}

.tab.active {
  background: var(--chan-accent);
  color: #0f172a; /* Chữ đậm trên nền sáng */
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
}

.author-tab-wrap .tab {
  background: transparent !important;
  padding-right: 6px;
  box-shadow: none;
}

.author-tab-wrap:has(.tab.active) {
  background: var(--chan-accent);
  border-color: rgba(255,255,255,0.2);
}

.author-tab-wrap:has(.tab.active) .tab {
  color: #0f172a;
}

.close-tab-btn {
  background: transparent;
  border: none;
  color: var(--chan-text-muted);
  cursor: pointer;
  font-size: 11px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.author-tab-wrap:has(.tab.active) .close-tab-btn {
  color: #0f172a;
  opacity: 0.7;
}

.close-tab-btn:hover {
  background: rgba(239, 68, 68, 0.8);
  color: white !important;
  opacity: 1 !important;
}

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.header-btn {
  width: 30px;
  height: 30px;
  border-radius: 10px;
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
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.header-btn.close:hover {
  background: #ef4444;
  color: white;
}

/* ===== BODY & MESSAGES ===== */
.chat-body {
  height: 480px;
  display: flex;
  flex-direction: column;
}

.presence-bar {
  padding: 6px 16px;
  background: rgba(56, 189, 248, 0.05);
  font-size: 11px;
  color: #38bdf8;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  font-weight: 600;
}

.message-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px; /* Tăng khoảng cách tin nhắn */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255,255,255,0.2);
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 90%;
  animation: fadeIn 0.3s ease;
}

.message-row.mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

/* Avatar Tụ Linh Trận (Scaled for Sidebar/Unified Chat) */
.spirit-array-center.chat-mini {
  position: relative; 
  width: 42px; 
  height: 42px; 
  flex-shrink: 0;
  display: flex; 
  align-items: center; 
  justify-content: center;
  overflow: visible;
  --aura-primary: 56, 189, 248;
}

.spirit-array-center.frame-phoenix-fire { --aura-primary: 239, 68, 68; }
.spirit-array-center.frame-bang-tinh { --aura-primary: 56, 189, 248; }
.spirit-array-center.frame-thien-thanh { --aura-primary: 234, 179, 8; }
.spirit-array-center.frame-nine-tails-purple { --aura-primary: 168, 85, 247; }
.spirit-array-center.frame-chan-long { --aura-primary: 251, 191, 36; }

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; 
  inset: -2px; 
  border-radius: 50%;
  border: 1.5px dashed rgba(var(--aura-primary), 0.4);
  animation: spinArray 20s linear infinite; 
  pointer-events: none;
  z-index: 0;
  filter: drop-shadow(0 0 5px rgba(var(--aura-primary), 0.4));
}
.magic-circle-reverse {
  inset: -5px; 
  border: 1px dotted rgba(var(--aura-primary), 0.6);
  animation: spinArrayReverse 15s linear infinite;
}

.avatar-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  z-index: 1;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%; 
  border: 2px solid rgba(var(--aura-primary), 0.8);
  background: #000;
  z-index: 2;
  object-fit: cover;
  box-shadow: 0 0 8px rgba(var(--aura-primary), 0.2);
  transform: scale(0.8); /* Exact HeroPanel scale */
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

.bubble-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Tránh tràn layout */
}

.mine .bubble-wrap {
  align-items: flex-end;
}

.name {
  font-size: 11px;
  font-weight: 800;
  color: var(--chan-text-muted);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mine .name {
  justify-content: flex-end;
}

.bubble-wrapper {
  position: relative;
  display: inline-block;
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

/* BUBBLE DEFAULT */
.bubble {
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--chan-text-main);
  background: var(--chan-bubble-others);
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  word-wrap: break-word;
}

.message-row:not(.mine) .bubble {
  border-top-left-radius: 4px;
}

.mine .bubble {
  background: var(--chan-bubble-mine);
  border-top-right-radius: 4px;
  border-top-left-radius: 18px; /* Fix góc chat mine */
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* FIX: NẾU CÓ FRAME THÌ XÓA NỀN CỦA TIN NHẮN THƯỜNG */
.bubble.has-frame:not(.megaphone) {
  background: transparent !important;
  padding: 12px 18px;
  border: none;
  box-shadow: none;
}

/* FIX: MEGAPHONE (LOA TRUYỀN ÂM) - ƯU TIÊN HIỂN THỊ LUÔN ĐẸP */
.bubble.megaphone {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%) !important;
  color: #ffffff !important; /* Fix lỗi chữ đổi màu */
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4); /* Giúp chữ luôn rõ trên nền cam */
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(255,255,255,0.2) !important;
  border: 1px solid #fcd34d !important;
  border-radius: 18px !important;
}

/* Dành cho ai vừa dùng Loa vừa đeo Frame */
.bubble.megaphone.has-frame {
  padding: 14px 20px; /* Căn chỉnh lại cho cân đối với frame */
}

.msg-time-tip {
  font-size: 10px;
  color: rgba(255,255,255,0.3);
  margin-top: 6px;
  display: block;
}

.mine .msg-time-tip {
  text-align: right;
}

/* ===== INPUT AREA ===== */
.input-area {
  padding: 14px 16px;
  background: var(--chan-header);
  border-top: 1px solid var(--chan-border);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #060810;
  border-radius: 16px;
  padding: 6px;
  border: 1px solid var(--chan-border);
  transition: all 0.3s ease;
  gap: 8px;
}

.input-wrapper:focus-within {
  border-color: var(--chan-accent);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.megaphone-toggle-btn {
  background: transparent;
  color: #64748b;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.megaphone-toggle-btn:hover {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  transform: scale(1.1);
}

.megaphone-toggle-btn.active {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
  animation: pulse-loa 2s infinite;
}

.cd-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: white;
  backdrop-filter: blur(2px);
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 4px;
  outline: none;
  font-size: 14px;
}

.input-wrapper input::placeholder {
  color: #64748b;
}

.send-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.send-btn:disabled {
  background: #334155;
  color: #64748b;
  box-shadow: none;
  cursor: not-allowed;
}

/* ===== SCROLLBAR ===== */
.scrollbar-custom::-webkit-scrollbar { width: 5px; }
.scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

/* ===== ANIMATIONS ===== */
@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

@keyframes slideIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes bounce {
  to { transform: translateY(-3px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-loa {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

/* ===== GITHUB/TU TIEN FRAME EFFECTS ===== */
/* Frame effects logic handled by spirit-array-center classes */
</style>
