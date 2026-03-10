import axios from "@/utils/axios";

// Notification type constants (matches constants/notification.constants.js)
export const NOTIF_TYPE = {
  MENTION: 1,
  CHAT_REPLY: 2,
  COMMENT_REPLY: 3,
  NEW_CHAPTER: 11,
  BOOK_APPROVED: 12,
  GIFT_LINH_THACH: 21,
  MAINTENANCE: 22
} as const;

export const CATEGORY_MAP = {
  interaction: [1, 2, 3],
  story: [11, 12],
  system: [21, 22]
} as const;

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  is_read: 0 | 1;
  type: number;
  target_id: number | null;
  created_at: string;
}

export interface NotificationResponse {
  success: true;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  unreadCount: number;
}

export const getNotificationsApi = async (page = 1, limit = 10, category?: string): Promise<NotificationResponse> => {
  const response = await axios.get('/api/notifications', {
    params: { page, limit, category }
  });
  return response.data;
};

export const markAsReadApi = async (id: number): Promise<void> => {
  await axios.put(`/api/notifications/${id}/read`);
};

export const markAllAsReadApi = async (): Promise<void> => {
  await axios.put('/api/notifications/read-all');
};
