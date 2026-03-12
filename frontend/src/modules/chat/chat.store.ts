// frontend/src/modules/chat/chat.store.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSocket } from "@/composables/useSocket";
import axios from "@/utils/axios";
import type { AvatarFrame } from "@/types/shop";
import type { Badge } from "@/types/badge";

export interface Message {
  userId: number;
  username?: string;
  fullName?: string;
  avatar?: string;
  content: string;
  timestamp: number;
  isMegaphone?: boolean;
  author_id?: string;
  equipped_frame?: AvatarFrame | null;
  equipped_chat_color?: any | null;
  level?: {
    id: number;
    name?: string | null;
    type?: string | null;
  } | null;
  badge?: Badge | null;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "world" | "author";
  messages: Message[];
  onlineCount: number;
  unreadCount: number;
}

export const useChatStore = defineStore("chat", () => {
  const { socket } = useSocket();
  const isOpen = ref(false);
  const isMinimized = ref(false);
  const activeTabId = ref<string>("world");

  const worldMessages = ref<Message[]>([]);
  const onlineCountWorld = ref(0);
  const unreadWorld = ref(0);
  const megaphoneQueue = ref<Message[]>([]);
  const pendingMegaphoneActivation = ref(false); // set to true to activate megaphone in UnifiedChat

  const toRoomKey = (id: string | number) => String(id);

  const joinedAuthorRooms = ref<Map<string, {
    authorId: string;
    name: string;
    messages: Message[];
    onlineCount: number;
    unreadCount: number;
  }>>(new Map());

  const authorRoomsList = computed(() => Array.from(joinedAuthorRooms.value.values()));

  const normalizeMessage = (msg: any): Message => ({
    userId: Number(msg?.userId),
    username: msg?.username || "",
    fullName: msg?.fullName || msg?.full_name || msg?.username || "Anonymous",
    avatar: msg?.avatar || "",
    content: msg?.content || msg?.text || "",
    timestamp: Number(msg?.timestamp) || Date.now(),
    isMegaphone: !!msg?.isMegaphone,
    author_id: msg?.author_id !== undefined && msg?.author_id !== null ? String(msg.author_id) : undefined,
    equipped_frame: msg?.equipped_frame || null,
    equipped_chat_color: msg?.equipped_chat_color || null,
    level: msg?.level || null,
    badge: msg?.badge || null,
  });

  const toggleChat = () => {
    isOpen.value = !isOpen.value;
  };

  const setMinimized = (val: boolean) => {
    isMinimized.value = val;
  };

  const switchTab = (tabId: string | number) => {
    const nextTab = tabId === "world" ? "world" : toRoomKey(tabId);
    const oldTab = activeTabId.value;
    activeTabId.value = nextTab;

    if (socket.value) {
      if (oldTab === "world" && nextTab !== "world") {
        socket.value.emit("leave_world_chat");
      } else if (oldTab !== "world" && nextTab === "world") {
        socket.value.emit("join_world_chat");
      }
    }

    if (nextTab === "world") {
      unreadWorld.value = 0;
    } else {
      const room = joinedAuthorRooms.value.get(nextTab);
      if (room) room.unreadCount = 0;
    }
  };

  const joinAuthorRoom = async (authorId: string | number, authorName: string = "Author Room") => {
    const key = toRoomKey(authorId);

    if (joinedAuthorRooms.value.has(key)) {
      switchTab(key);
      isOpen.value = true;
      return;
    }

    joinedAuthorRooms.value.set(key, {
      authorId: key,
      name: authorName,
      messages: [],
      onlineCount: 0,
      unreadCount: 0,
    });

    if (socket.value) {
      socket.value.emit("join_author_room", { authorId: key });
    }

    switchTab(key);
    isOpen.value = true;
  };

  const leaveRoom = (authorId: string | number) => {
    const key = toRoomKey(authorId);
    if (socket.value) {
      socket.value.emit("leave_author_room", { authorId: key });
    }
    joinedAuthorRooms.value.delete(key);
    if (activeTabId.value === key) {
      activeTabId.value = "world";
    }
  };

  const rejoinRooms = () => {
    if (!socket.value?.connected) return;
    socket.value.emit("join_room", 1);
    if (activeTabId.value === "world") {
      socket.value.emit("join_world_chat");
    }
    for (const [key] of joinedAuthorRooms.value) {
      socket.value.emit("join_author_room", { authorId: key });
    }
  };

  const initListeners = () => {
    if (!socket.value) return;

    socket.value.on("connect", rejoinRooms);
    if (socket.value.connected) rejoinRooms();

    socket.value.off("new_message");
    socket.value.on("new_message", (msg: any) => {
      worldMessages.value.push(normalizeMessage(msg));
      if (worldMessages.value.length > 50) worldMessages.value.shift();
      if (activeTabId.value !== "world") unreadWorld.value++;
    });

    socket.value.off("new_megaphone");
    socket.value.on("new_megaphone", (msg: any) => {
      const normalized = { ...normalizeMessage(msg), isMegaphone: true };
      worldMessages.value.push(normalized);
      if (worldMessages.value.length > 50) worldMessages.value.shift();
      if (activeTabId.value !== "world") unreadWorld.value++;
      // Add to ticker queue
      megaphoneQueue.value.push(normalized);
      if (megaphoneQueue.value.length > 10) megaphoneQueue.value.shift();
    });

    socket.value.off("author_room_joined");
    socket.value.on("author_room_joined", (payload: { authorId: string | number; history: any[]; onlineCount: number }) => {
      const key = toRoomKey(payload.authorId);
      const room = joinedAuthorRooms.value.get(key);
      if (!room) return;
      room.messages = (payload.history || []).map((m: any) => normalizeMessage(m));
      room.onlineCount = Number(payload.onlineCount) || 0;
    });

    socket.value.off("new_author_message");
    socket.value.on("new_author_message", (msg: any) => {
      const normalized = normalizeMessage(msg);
      if (!normalized.author_id) return;

      const room = joinedAuthorRooms.value.get(normalized.author_id);
      if (room) {
        room.messages.push(normalized);
        if (room.messages.length > 50) room.messages.shift();
        if (activeTabId.value !== normalized.author_id) room.unreadCount++;
      }
    });

    socket.value.off("author_presence_update");
    socket.value.on("author_presence_update", (data: { authorId: string | number; count: number }) => {
      const key = toRoomKey(data.authorId);
      const room = joinedAuthorRooms.value.get(key);
      if (room) room.onlineCount = Number(data.count) || 0;
    });

    socket.value.off("world_presence_update");
    socket.value.on("world_presence_update", (data: { count: number }) => {
      onlineCountWorld.value = Number(data.count) || 0;
    });

    axios.get("/api/chat/history/1").then((res) => {
      worldMessages.value = (res.data.data || []).map((m: any) => normalizeMessage(m));
    });

    axios.get("/api/chat/online-stats").then((res) => {
      onlineCountWorld.value = Number(res.data.data.count) || 0;
    });
  };

  // Opens world chat in megaphone mode (called from inventory when using Loa ID 3)
  const openWithMegaphone = () => {
    isOpen.value = true;
    isMinimized.value = false;
    activeTabId.value = "world";
    pendingMegaphoneActivation.value = true;
  };

  return {
    isOpen,
    isMinimized,
    activeTabId,
    worldMessages,
    onlineCountWorld,
    unreadWorld,
    megaphoneQueue,
    pendingMegaphoneActivation,
    joinedAuthorRooms,
    authorRoomsList,
    toggleChat,
    setMinimized,
    switchTab,
    joinAuthorRoom,
    leaveRoom,
    initListeners,
    openWithMegaphone,
  };
});

