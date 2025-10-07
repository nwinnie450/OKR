import apiClient from './client';

export interface Notification {
  _id: string;
  userId: string;
  type: 'okr_created' | 'okr_updated' | 'okr_deleted' | 'checkin_submitted' |
        'deadline_approaching' | 'badge_earned' | 'team_assignment' | 'comment_added' | 'mentioned';
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: 'Objective' | 'KeyResult' | 'CheckIn' | 'Badge' | 'Team' | 'User';
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  limit?: number;
  page?: number;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export const notificationsAPI = {
  // Get all notifications
  getNotifications: async (filters?: NotificationFilters): Promise<NotificationResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiClient.get(`/notifications?${params.toString()}`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; count: number }> => {
    return apiClient.get('/notifications/unread/count');
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{ success: boolean; data: Notification }> => {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },

  // Mark all as read
  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch('/notifications/read-all', {});
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/notifications/${id}`);
  },

  // Clear all read notifications
  clearRead: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete('/notifications/read/clear');
  },
};
