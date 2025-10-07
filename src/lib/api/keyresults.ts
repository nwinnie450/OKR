import apiClient from './client';

export interface KeyResult {
  _id: string;
  objectiveId: string;
  title: string;
  description?: string;
  ownerId: string;
  metricType: 'number' | 'percentage' | 'currency' | 'boolean';
  unit?: string;
  startingValue: number;
  targetValue: number;
  currentValue: number;
  progress: number;
  confidence: 'on-track' | 'at-risk' | 'off-track';
  dueDate?: string;
  lastCheckinAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKeyResultData {
  objectiveId: string;
  title: string;
  description?: string;
  ownerId?: string;
  metricType: 'number' | 'percentage' | 'currency' | 'boolean';
  unit?: string;
  startingValue: number;
  targetValue: number;
  dueDate?: string;
}

export interface UpdateKeyResultData {
  title?: string;
  description?: string;
  currentValue?: number;
  dueDate?: string;
}

export interface KeyResultFilters {
  objectiveId?: string;
  ownerId?: string;
}

export const keyResultsAPI = {
  // Get all key results
  getKeyResults: async (filters?: KeyResultFilters): Promise<{ success: boolean; count: number; data: KeyResult[] }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiClient.get(`/keyresults?${params.toString()}`);
  },

  // Get single key result
  getKeyResult: async (id: string): Promise<{ success: boolean; data: KeyResult }> => {
    return apiClient.get(`/keyresults/${id}`);
  },

  // Create key result
  createKeyResult: async (data: CreateKeyResultData): Promise<{ success: boolean; data: KeyResult }> => {
    return apiClient.post('/keyresults', data);
  },

  // Update key result
  updateKeyResult: async (id: string, data: UpdateKeyResultData): Promise<{ success: boolean; data: KeyResult }> => {
    return apiClient.put(`/keyresults/${id}`, data);
  },

  // Delete key result
  deleteKeyResult: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/keyresults/${id}`);
  },
};
