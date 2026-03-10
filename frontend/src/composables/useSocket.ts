// frontend/src/composables/useSocket.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/modules/auth/auth.store';
import { useNotificationStore } from '@/modules/notification/notification.store';
import { useAppToast } from '@/composables/useAppToast';

const socket = ref<Socket | null>(null);

export function useSocket() {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const { showSuccessToast } = useAppToast();

  const connect = () => {
    if (socket.value?.connected) return;

    const token = authStore.token;
    const userId = authStore.user?.id;

    if (!token || !userId) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    socket.value = io(apiUrl, {
      query: { userId, token },
      auth: { token },
      transports: ['websocket']
    });

    socket.value.on('connect', () => {
      console.log('Connected to Spirit Realm (Socket.io)');
      // Join World Chat Room by default
      socket.value?.emit('join_room', 1);
    });

    socket.value.on('new_notification', (data) => {
      notificationStore.unreadCount++;
      // Add to list if it matches current filter or we are in "all" view
      notificationStore.notifications = [data, ...notificationStore.notifications];
      
      showSuccessToast(`[Thông báo mới] ${data.content}`);
    });

    socket.value.on('system_notification', (data) => {
      showSuccessToast(`[Hệ thống] ${data.content}`);
    });

    socket.value.on('disconnect', () => {
      console.log('Disconnected from Spirit Realm');
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  return {
    socket,
    connect,
    disconnect
  };
}
