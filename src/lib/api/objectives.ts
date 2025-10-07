import apiClient from './client';
import type { User } from './auth';

export interface Objective {
  _id: string;
  title: string;
  description?: string;
  type: 'company' | 'department' | 'team' | 'individual';
  ownerId: User | string;
  departmentId?: string;
  department?: { _id: string; name: string; code: string };
  teamId?: string;
  team?: { _id: string; name: string };
  timePeriod: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'Annual';
  year: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress: number;
  confidence: 'on-track' | 'at-risk' | 'off-track';
  category?: string;
  tags?: string[];
  alignedToId?: string | Objective;
  context?: string;
  initiatives?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  keyResults?: any[];
}

export interface CreateObjectiveData {
  title: string;
  description?: string;
  type: 'company' | 'department' | 'team' | 'individual';
  ownerId?: string;
  departmentId?: string;
  teamId?: string;
  timePeriod: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'Annual';
  year: number;
  category?: string;
  tags?: string[];
  alignedToId?: string;
  context?: string;
  initiatives?: string[];
}

export interface UpdateObjectiveData extends Partial<CreateObjectiveData> {
  status?: 'draft' | 'active' | 'completed' | 'archived';
  progress?: number;
  confidence?: 'on-track' | 'at-risk' | 'off-track';
}

export interface ObjectiveFilters {
  type?: 'company' | 'department' | 'team' | 'individual';
  status?: 'draft' | 'active' | 'completed' | 'archived';
  timePeriod?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2' | 'Annual';
  year?: number;
  departmentId?: string;
  teamId?: string;
  ownerId?: string;
  alignedToId?: string;
}

export const objectivesAPI = {
  // Get all objectives
  getObjectives: async (filters?: ObjectiveFilters): Promise<{ success: boolean; count: number; data: Objective[] }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiClient.get(`/objectives?${params.toString()}`);
  },

  // Get single objective
  getObjective: async (id: string): Promise<{ success: boolean; data: Objective }> => {
    return apiClient.get(`/objectives/${id}`);
  },

  // Create objective
  createObjective: async (data: CreateObjectiveData): Promise<{ success: boolean; data: Objective }> => {
    return apiClient.post('/objectives', data);
  },

  // Update objective
  updateObjective: async (id: string, data: UpdateObjectiveData): Promise<{ success: boolean; data: Objective }> => {
    return apiClient.put(`/objectives/${id}`, data);
  },

  // Delete objective
  deleteObjective: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/objectives/${id}`);
  },

  // Publish objective
  publishObjective: async (id: string): Promise<{ success: boolean; data: Objective }> => {
    return apiClient.put(`/objectives/${id}/publish`);
  },
};
