import apiClient from './client';
import type { User, UserRole, Department } from './auth';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  department?: Department;
  teamId?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: Department;
  teamId?: string;
  avatar?: string;
  avatarUrl?: string;
}

export const usersAPI = {
  // Get all users (Admin only)
  getAll: async (): Promise<{ success: boolean; count: number; data: User[] }> => {
    return apiClient.get('/users');
  },

  // Get user by ID (Admin only)
  getById: async (id: string): Promise<{ success: boolean; data: User }> => {
    return apiClient.get(`/users/${id}`);
  },

  // Create user (Admin only)
  create: async (data: CreateUserData): Promise<{ success: boolean; data: User }> => {
    return apiClient.post('/users', data);
  },

  // Update user (Admin only)
  update: async (id: string, data: UpdateUserData): Promise<{ success: boolean; data: User }> => {
    return apiClient.put(`/users/${id}`, data);
  },

  // Delete user (Admin only)
  delete: async (id: string): Promise<{ success: boolean; message: string; data: {} }> => {
    return apiClient.delete(`/users/${id}`);
  },
};
