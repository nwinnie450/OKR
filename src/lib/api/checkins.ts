import apiClient from './client';

export interface CheckIn {
  _id: string;
  keyResultId: string;
  userId: string;
  currentValue: number;
  progress: number;
  confidence: 'on-track' | 'at-risk' | 'off-track';
  statusComment?: string;
  blockers?: string;
  completedTaskIds?: string[];
  isLate: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckInData {
  keyResultId: string;
  currentValue: number;
  confidence: 'on-track' | 'at-risk' | 'off-track';
  statusComment?: string;
  blockers?: string;
  completedTaskIds?: string[];
}

export interface UpdateCheckInData {
  currentValue?: number;
  confidence?: 'on-track' | 'at-risk' | 'off-track';
  statusComment?: string;
  blockers?: string;
}

export interface CheckInFilters {
  keyResultId?: string;
  userId?: string;
}

export interface CheckInStats {
  totalCheckIns: number;
  lateCheckIns: number;
  recentCheckIns: number;
  overallConfidence: 'on-track' | 'at-risk' | 'off-track';
  complianceRate: number;
}

export const checkInsAPI = {
  // Get all check-ins
  getCheckIns: async (filters?: CheckInFilters): Promise<{ success: boolean; count: number; data: CheckIn[] }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiClient.get(`/checkins?${params.toString()}`);
  },

  // Get single check-in
  getCheckIn: async (id: string): Promise<{ success: boolean; data: CheckIn }> => {
    return apiClient.get(`/checkins/${id}`);
  },

  // Create check-in
  createCheckIn: async (data: CreateCheckInData): Promise<{ success: boolean; data: CheckIn }> => {
    return apiClient.post('/checkins', data);
  },

  // Update check-in
  updateCheckIn: async (id: string, data: UpdateCheckInData): Promise<{ success: boolean; data: CheckIn }> => {
    return apiClient.put(`/checkins/${id}`, data);
  },

  // Delete check-in
  deleteCheckIn: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/checkins/${id}`);
  },

  // Get user check-in stats
  getUserStats: async (userId?: string): Promise<{ success: boolean; data: CheckInStats }> => {
    const url = userId ? `/checkins/stats/user/${userId}` : '/checkins/stats/user';
    return apiClient.get(url);
  },
};
