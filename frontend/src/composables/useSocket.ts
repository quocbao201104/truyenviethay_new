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
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.value.on('connect', () => {
      console.log('Connected to Spirit Realm (Socket.io)');
      socket.value?.emit('join_room', 1);
    });

    socket.value.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.value.on('new_notification', (data) => {
      notificationStore.addRealtimeNotification(data);
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
