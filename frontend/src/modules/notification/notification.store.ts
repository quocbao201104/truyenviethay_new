import { defineStore } from 'pinia';
import { getNotificationsApi, markAsReadApi, markAllAsReadApi, type Notification } from './notification.api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  page: number;
  hasMore: boolean;
  currentCategory: string | undefined;
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    page: 1,
    hasMore: true,
    currentCategory: undefined,
  }),

  actions: {
    async fetchNotifications(reset = false, category?: string) {
      if (reset) {
        this.page = 1;
        this.notifications = [];
        this.hasMore = true;
        this.currentCategory = category;
      }
      
      if (!this.hasMore && !reset) return;

      this.loading = true;
      try {
        const response = await getNotificationsApi(this.page, 10, this.currentCategory);
        
        if (reset) {
          this.notifications = response.data;
        } else {
          const existingIds = new Set(this.notifications.map(n => n.id));
          const newItems = response.data.filter((d: Notification) => !existingIds.has(d.id));
          this.notifications = [...this.notifications, ...newItems];
        }

        this.unreadCount = response.unreadCount;
        this.hasMore = this.page < response.pagination.totalPages;
        if (this.hasMore) this.page++;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        this.loading = false;
      }
    },

    async markAsRead(id: number) {
      try {
        await markAsReadApi(id);
        const notification = this.notifications.find(n => n.id === id);
        if (notification && notification.is_read === 0) {
          notification.is_read = 1;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },

    async markAllAsRead() {
      try {
        await markAllAsReadApi();
        this.notifications.forEach(n => n.is_read = 1);
        this.unreadCount = 0;
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    },

    addRealtimeNotification(data: Notification) {
      const exists = this.notifications.some(n => n.id === data.id);
      if (exists) return;
      this.notifications = [data, ...this.notifications];
      if (data.is_read === 0) this.unreadCount++;
    }
  }
});
