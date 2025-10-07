import apiClient from './client';

export interface Badge {
  _id: string;
  userId: string;
  badgeType: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  criteria?: any;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeType {
  type: string;
  title: string;
  description: string;
  icon: string;
}

export interface CheckBadgesResponse {
  success: boolean;
  message: string;
  newBadges: Badge[];
  totalBadges: number;
}

export interface BadgeFilters {
  userId?: string;
}

export const badgesAPI = {
  // Get user's badges
  getBadges: async (filters?: BadgeFilters): Promise<{ success: boolean; count: number; data: Badge[] }> => {
    const params = new URLSearchParams();
    if (filters?.userId) {
      params.append('userId', filters.userId);
    }
    return apiClient.get(`/badges?${params.toString()}`);
  },

  // Get all available badge types
  getBadgeTypes: async (): Promise<{ success: boolean; count: number; data: BadgeType[] }> => {
    return apiClient.get('/badges/types');
  },

  // Check and award badges for a user
  checkBadges: async (userId?: string): Promise<CheckBadgesResponse> => {
    const endpoint = userId ? `/badges/check/${userId}` : '/badges/check';
    return apiClient.post(endpoint);
  },

  // Award a badge manually (admin only)
  awardBadge: async (data: { userId: string; badgeType: string }): Promise<{ success: boolean; data: Badge }> => {
    return apiClient.post('/badges', data);
  },

  // Delete a badge (admin only)
  deleteBadge: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/badges/${id}`);
  },
};
