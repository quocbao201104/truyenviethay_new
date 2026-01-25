import axios from "@/utils/axios";

export interface Notification {
  id: number;
  user_id: number;
  content: string;
  truyen_id: number | null;
  status: 'read' | 'unread';
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

export const getNotificationsApi = async (page = 1, limit = 10): Promise<NotificationResponse> => {
  const response = await axios.get('/api/notifications', {
    params: { page, limit }
  });
  return response.data;
};

export const markAsReadApi = async (id: number): Promise<void> => {
  await axios.put(`/api/notifications/${id}/read`);
};

export const markAllAsReadApi = async (): Promise<void> => {
  await axios.put('/api/notifications/read-all');
};
