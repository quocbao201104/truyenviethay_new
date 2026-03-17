<template>
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
                :class="['tab', { active: chatStore.activeTabId === room.authorId }]"
                @click="chatStore.switchTab(room.authorId)"
              >
                <i class="fas fa-at text-[10px] opacity-50"></i> {{ room.name }}
                <span v-if="room.unreadCount > 0" class="badge">{{ room.unreadCount }}</span>
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
            title="Thu nho"
            @click="chatStore.isOpen = false"
          >
            <i class="fas fa-minus"></i>
          </button>
          <button
            class="header-btn close"
            title="Dong"
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
          v-for="(item, index) in groupedMessages"
          :key="item.msg.id ?? item.msg.timestamp ?? index"
          class="message-row"
          :class="[
            { mine: item.mine, 'megaphone-row': item.msg.isMegaphone },
            item.showIdentity ? 'group-start' : 'group-continue',
          ]"
        >
          <div class="bubble-wrap">
            <div v-if="item.msg.isMegaphone" class="megaphone-card">
              <div class="megaphone-label">
                <i class="fas fa-bullhorn megaphone-icon" aria-hidden="true"></i>
                <span class="megaphone-title">Megaphone</span>
              </div>
              <div class="megaphone-body">
                {{ item.msg.content }}
              </div>
              <div class="megaphone-meta">
                <div class="megaphone-sender">
                  <i
                    v-if="getRoleIcon(item.msg)"
                    class="identity-icon"
                    :class="getRoleIcon(item.msg)"
                    aria-hidden="true"
                  ></i>
                  <span class="megaphone-name">{{ getDisplayName(item.msg) }}</span>
                </div>
                <span class="megaphone-time">
                  {{ item.msg.timestamp ? formatTime(item.msg.timestamp) : "" }}
                </span>
              </div>
            </div>

            <template v-else>
            <div v-if="!item.mine && item.showIdentity" class="identity-row">
              <div
                class="spirit-array-center chat-mini"
                :class="item.msg.equipped_frame?.css_class"
              >
                <div class="magic-circle-spin" v-if="item.msg.equipped_frame"></div>
                <div class="magic-circle-reverse" v-if="item.msg.equipped_frame"></div>
                <div class="avatar-wrapper">
                  <img class="avatar item-img" :src="getAvatarUrl(item.msg.avatar)" alt="avatar" />
                  <img
                    v-if="item.msg.equipped_frame?.image_url"
                    class="hero-frame"
                    :src="getImageUrl(item.msg.equipped_frame.image_url)"
                    :alt="item.msg.equipped_frame.name"
                  />
                </div>
              </div>

              <div class="identity-meta">
                <div class="name" :style="getIdentityStyle(item.msg)">
                  <i
                    v-if="getRoleIcon(item.msg)"
                    class="identity-icon"
                    :class="getRoleIcon(item.msg)"
                    aria-hidden="true"
                  ></i>
                  <span class="username-text">{{ item.msg.fullName || item.msg.username }}</span>
                  <UserBadge v-if="item.msg.badge" :badge="item.msg.badge" size="xs" />
                </div>
              </div>
            </div>

            <div
              class="bubble-content"
              :class="[
                {
                  'with-identity-offset': !item.mine,
                  'with-header': !item.mine && item.showIdentity,
                },
                item.msg.equipped_frame?.css_class || '',
                item.msg.equipped_chat_color?.css_class || '',
              ]"
            >
              <div class="bubble-wrapper">
                <img
                  v-if="item.msg.equipped_chat_color?.image_url"
                  :src="item.msg.equipped_chat_color.image_url"
                  alt="chat frame"
                  class="chat-bg-frame"
                />
                <div
                  class="bubble"
                  :class="[
                    { megaphone: item.msg.isMegaphone },
                    { 'has-frame': item.msg.equipped_chat_color?.image_url },
                    item.msg.equipped_frame?.css_class || '',
                    item.msg.equipped_chat_color?.css_class || ''
                  ]"
                >
                  {{ item.msg.content }}
                </div>
              </div>
              <span class="msg-time-tip">
                {{ item.msg.timestamp ? formatTime(item.msg.timestamp) : "" }}
              </span>
            </div>
            </template>
          </div>
        </div>

        <div v-if="groupedMessages.length === 0" class="empty-state">
          <i class="fas fa-comments opacity-10 text-5xl mb-2"></i>
          <p>Hay bat dau cuoc tro chuyen!</p>
        </div>
      </div>

      <div class="input-area" :class="{ disabled: !authStore.isLoggedIn }">
        <div class="input-wrapper">
          <button
            v-if="chatStore.activeTabId === 'world'"
            class="megaphone-toggle-btn"
            :class="{ active: isMegaphoneActive }"
            @click="toggleMegaphone"
            title="Bat tat Loa Truyen Am"
          >
            <i class="fas fa-bullhorn"></i>
            <span v-if="megaphoneCooldown > 0" class="cd-overlay">{{ megaphoneCooldown }}s</span>
          </button>
          <input
            v-model="newMessage"
            @keyup.enter="handleSendMessage"
            :placeholder="authStore.isLoggedIn ? 'Nhap noi dung...' : 'Dang nhap de chat'"
            maxlength="500"
            :disabled="!authStore.isLoggedIn || cooldown > 0"
          />
          <button
            class="send-btn"
            @click="handleSendMessage"
            :disabled="!authStore.isLoggedIn || cooldown > 0 || !newMessage.trim()"
          >
            <i
              v-if="cooldown > 0"
              class="fas fa-circle-notch fa-spin text-xs"
            ></i>
            <span v-else-if="cooldown === 0"><i class="fas fa-paper-plane"></i></span>
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
const hasMegaphoneItem = ref(false);
const isMegaphoneActive = ref(false);
const megaphoneCooldown = ref(0);

let cooldownInterval: ReturnType<typeof setInterval> | null = null;
let megaphoneInterval: ReturnType<typeof setInterval> | null = null;

const formatTime = (timestamp: number) => {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  } catch {
    return "vua xong";
  }
};

const currentMessages = computed(() => {
  if (chatStore.activeTabId === "world") return chatStore.worldMessages;
  return chatStore.joinedAuthorRooms.get(chatStore.activeTabId)?.messages || [];
});

const currentOnlineCount = computed(() => {
  if (chatStore.activeTabId === "world") return chatStore.onlineCountWorld;
  return chatStore.joinedAuthorRooms.get(chatStore.activeTabId)?.onlineCount || 0;
});

const totalUnread = computed(() => {
  let count = chatStore.unreadWorld;
  chatStore.authorRoomsList.forEach((room) => {
    count += room.unreadCount;
  });
  return count;
});

const isMine = (msg: Message) => Number(msg.userId) === Number(authStore.user?.id);

const getDisplayName = (msg: Message) => msg.fullName || msg.username || "Anonymous";

const getRoleAccent = (msg: Message) => {
  const role = String(msg.role || "").toUpperCase();
  if (role === "ADMIN") return "#f0b7c2";
  if (role === "MOD" || role === "MODERATOR") return "#9ed6ec";
  if (msg.level?.type === "author") return "#e9cd84";
  return "#8fa8c2";
};

const getRoleIcon = (msg: Message) => {
  const role = String(msg.role || "").toUpperCase();
  if (role === "ADMIN") return "fas fa-shield-halved role-admin-icon";
  if (role === "MOD" || role === "MODERATOR") return "fas fa-user-shield role-mod-icon";
  if (msg.level?.type === "author") return "fas fa-feather-pointed role-author-icon";
  return null;
};

const getIdentityStyle = (msg: Message) => ({
  "--identity-accent": msg.badge?.color || getRoleAccent(msg),
});

const shouldGroupMessages = (prev?: Message | null, current?: Message | null) => {
  if (!prev || !current) return false;
  if (prev.isMegaphone || current.isMegaphone) return false;
  return Number(prev.userId) === Number(current.userId);
};

const groupedMessages = computed(() =>
  currentMessages.value.map((msg, index, list) => {
    const prev = index > 0 ? list[index - 1] : null;
    const next = index < list.length - 1 ? list[index + 1] : null;

    return {
      msg,
      mine: isMine(msg),
      showIdentity: !shouldGroupMessages(prev, msg),
      groupEnd: !shouldGroupMessages(msg, next),
    };
  }),
);

const scrollToEnd = () => {
  if (!messageList.value) return;
  messageList.value.scrollTo({
    top: messageList.value.scrollHeight,
    behavior: "smooth",
  });
};

watch(
  () => chatStore.pendingMegaphoneActivation,
  (pending) => {
    if (!pending) return;

    if (hasMegaphoneItem.value) {
      isMegaphoneActive.value = true;
      chatStore.pendingMegaphoneActivation = false;
      return;
    }

    refreshMegaphoneAccess().then(() => {
      if (hasMegaphoneItem.value) isMegaphoneActive.value = true;
      chatStore.pendingMegaphoneActivation = false;
    });
  },
);

const toggleMegaphone = () => {
  if (!hasMegaphoneItem.value) {
    alert("Ban can mua 'Loa Truyen Am' trong Cua Hang de su dung chuc nang nay!");
    return;
  }
  isMegaphoneActive.value = !isMegaphoneActive.value;
};

const startCooldown = () => {
  cooldown.value = 3;
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0 && cooldownInterval) clearInterval(cooldownInterval);
  }, 1000);
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || cooldown.value > 0 || !authStore.isLoggedIn) return;

  try {
    const text = newMessage.value;

    if (chatStore.activeTabId === "world") {
      if (isMegaphoneActive.value) {
        if (megaphoneCooldown.value > 0) return;
        await axios.post("/api/chat/world/megaphone", { message: text });

        megaphoneCooldown.value = 60;
        if (megaphoneInterval) clearInterval(megaphoneInterval);
        megaphoneInterval = setInterval(() => {
          megaphoneCooldown.value--;
          if (megaphoneCooldown.value <= 0 && megaphoneInterval) clearInterval(megaphoneInterval);
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

const refreshMegaphoneAccess = async () => {
  if (!authStore.isLoggedIn) return;
  try {
    const res = await axios.get("/api/chat/megaphone-access");
    hasMegaphoneItem.value = !!res.data?.data?.hasAccess;
  } catch {
    hasMegaphoneItem.value = false;
  }
};

watch(
  () => [groupedMessages.value.length, chatStore.activeTabId, chatStore.isOpen],
  () => {
    if (chatStore.isOpen) nextTick(() => scrollToEnd());
  },
);

watch(
  () => chatStore.isOpen,
  async (open) => {
    if (open) await refreshMegaphoneAccess();
  },
);

onMounted(async () => {
  chatStore.initListeners();
  await refreshMegaphoneAccess();
});

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval);
  if (megaphoneInterval) clearInterval(megaphoneInterval);
});
</script>

<style scoped>
.chat-shell {
  --chan-bg: #111927;
  --chan-header: #172130;
  --chan-accent: #38bdf8;
  --chan-bubble-mine: linear-gradient(135deg, #3aaed6 0%, #4a79cc 100%);
  --chan-bubble-others: #202d40;
  --chan-text-main: #f8fafc;
  --chan-text-muted: #aab9cc;
  --chan-border: rgba(255, 255, 255, 0.08);
}

.chat-bubble-fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  cursor: pointer;
  z-index: 1999;
  transition: all 0.3s ease;
}

.chat-bubble-fab.hidden {
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}

.chat-bubble-fab:hover {
  transform: translateY(-2px);
}

.bubble-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c99c6 0%, #3f74c3 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(2, 8, 18, 0.24);
  color: white;
  font-size: 24px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #d86374;
  color: white;
  font-size: 11px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 12px;
  border: 2px solid #0f1623;
}

.chat-shell {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 380px;
  max-width: calc(100vw - 40px);
  background: rgba(17, 25, 39, 0.96);
  border-radius: 20px;
  box-shadow: 0 18px 36px rgba(2, 8, 18, 0.28), 0 0 0 1px var(--chan-border);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  overflow: hidden;
  animation: slideIn 0.25s ease;
}

.chat-header {
  background: rgba(23, 33, 48, 0.96);
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
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.09);
  color: var(--chan-text-main);
}

.tab.active {
  background: rgba(91, 196, 232, 0.2);
  color: #e6f7fd;
  box-shadow: none;
}

.author-tab-wrap .tab {
  background: transparent !important;
  padding-right: 6px;
}

.author-tab-wrap:has(.tab.active) {
  background: rgba(91, 196, 232, 0.14);
  border-color: rgba(91, 196, 232, 0.18);
}

.author-tab-wrap:has(.tab.active) .tab,
.author-tab-wrap:has(.tab.active) .close-tab-btn {
  color: #e6f7fd;
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
  transition: background-color 0.2s ease, color 0.2s ease;
}

.close-tab-btn:hover {
  background: rgba(223, 120, 135, 0.2);
  color: #fff !important;
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
  transition: background-color 0.2s ease, color 0.2s ease;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.header-btn.close:hover {
  background: rgba(223, 120, 135, 0.22);
}

.chat-body {
  height: 480px;
  display: flex;
  flex-direction: column;
}

.presence-bar {
  padding: 7px 16px;
  background: rgba(91, 196, 232, 0.05);
  font-size: 11px;
  color: #9fddf2;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(91, 196, 232, 0.08);
  font-weight: 600;
}

.message-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.22);
}

.message-row {
  display: flex;
  max-width: 92%;
  margin-top: 12px;
  animation: fadeIn 0.2s ease;
}

.message-row:first-child {
  margin-top: 0;
}

.message-row.group-start {
  margin-top: 18px;
}

.message-row.group-continue {
  margin-top: 6px;
}

.message-row.mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-row.megaphone-row {
  max-width: 100%;
}

.spirit-array-center.chat-mini {
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: visible;
  --aura-primary: 56, 189, 248;
}

.spirit-array-center.frame-phoenix-fire { --aura-primary: 239, 68, 68; }
.spirit-array-center.frame-bang-tinh { --aura-primary: 56, 189, 248; }
.spirit-array-center.frame-thien-thanh { --aura-primary: 234, 179, 8; }
.spirit-array-center.frame-nine-tails-purple { --aura-primary: 168, 85, 247; }
.spirit-array-center.frame-chan-long { --aura-primary: 251, 191, 36; }

.magic-circle-spin,
.magic-circle-reverse {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1.5px dashed rgba(var(--aura-primary), 0.32);
  animation: spinArray 20s linear infinite;
  pointer-events: none;
  z-index: 0;
}

.magic-circle-reverse {
  inset: -5px;
  border: 1px dotted rgba(var(--aura-primary), 0.4);
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
  border: 2px solid rgba(var(--aura-primary), 0.72);
  background: #000;
  object-fit: cover;
  transform: scale(0.8);
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

.avatar-spacer {
  width: 42px;
  flex-shrink: 0;
}

.bubble-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.mine .bubble-wrap {
  align-items: flex-end;
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

.identity-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.identity-meta {
  min-width: 0;
  padding-top: 3px;
}

.name {
  font-size: 11px;
  font-weight: 800;
  color: #dce7f4;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.2;
  min-width: 0;
  width: fit-content;
  max-width: 100%;
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

.username-text {
  color: #eef4fb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.identity-icon {
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

.bubble-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.bubble-content.with-identity-offset {
  margin-left: 54px;
  width: calc(100% - 54px);
}

.bubble-content.with-header {
  margin-top: 0;
}

.mine .bubble-content {
  align-items: flex-end;
  width: auto;
}

.bubble-wrapper {
  position: relative;
  display: inline-block;
  max-width: 100%;
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
  line-height: 1.55;
  color: #d5e0ed;
  background: var(--chan-bubble-others);
  position: relative;
  z-index: 1;
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.05);
  word-wrap: break-word;
}

.message-row:not(.mine) .bubble {
  border-top-left-radius: 4px;
}

.mine .bubble {
  background: var(--chan-bubble-mine);
  color: #f7fbff;
  border-top-right-radius: 4px;
  border-top-left-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bubble.has-frame:not(.megaphone) {
  background: transparent !important;
  padding: 12px 18px;
  border: none;
  box-shadow: none;
}

.bubble.megaphone {
  background: linear-gradient(135deg, #c98a35 0%, #b56636 100%) !important;
  color: #ffffff !important;
  font-weight: 800;
  text-shadow: none;
  box-shadow: none !important;
  border: 1px solid rgba(239, 199, 130, 0.28) !important;
  border-radius: 18px !important;
}

.bubble.megaphone.has-frame {
  padding: 14px 20px;
}

.msg-time-tip {
  font-size: 9px;
  color: rgba(213, 224, 237, 0.44);
  margin-top: 4px;
  display: block;
  letter-spacing: 0.2px;
}

.mine .msg-time-tip {
  text-align: right;
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

.megaphone-sender .identity-icon {
  font-size: 9px;
  opacity: 0.84;
}

.megaphone-time {
  color: rgba(209, 218, 230, 0.48);
  font-size: 10px;
  white-space: nowrap;
}

.input-area {
  padding: 14px 16px;
  background: var(--chan-header);
  border-top: 1px solid var(--chan-border);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #0b1019;
  border-radius: 16px;
  padding: 6px;
  border: 1px solid var(--chan-border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  gap: 8px;
}

.input-wrapper:focus-within {
  border-color: rgba(91, 196, 232, 0.24);
  box-shadow: 0 0 0 3px rgba(91, 196, 232, 0.08);
}

.megaphone-toggle-btn {
  background: transparent;
  color: #70839a;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  position: relative;
}

.megaphone-toggle-btn:hover {
  color: #e6c47a;
  background: rgba(230, 196, 122, 0.08);
  transform: translateY(-1px);
}

.megaphone-toggle-btn.active {
  color: #e6c47a;
  background: rgba(230, 196, 122, 0.12);
  text-shadow: none;
  animation: none;
}

.cd-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: white;
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
  color: #6f8199;
}

.send-btn {
  background: linear-gradient(135deg, #3db38c 0%, #329a7a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, filter 0.2s ease;
  box-shadow: none;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.send-btn:disabled {
  background: #334155;
  color: #64748b;
  box-shadow: none;
  cursor: not-allowed;
}

.scrollbar-custom::-webkit-scrollbar { width: 5px; }
.scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
.scrollbar-custom::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
@keyframes slideIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
</style>
