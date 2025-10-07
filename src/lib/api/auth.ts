import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = 'admin' | 'pm' | 'ba' | 'dev' | 'qa' | 'support' | 'hr' | 'finance' | 'manager' | 'member';

export interface DepartmentObject {
  _id: string;
  name: string;
  code: string;
}

export interface TeamObject {
  _id: string;
  name: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  department?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  departments?: (DepartmentObject | string)[];
  avatar?: string;
  avatarUrl?: string;
  teams?: (TeamObject | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', credentials);
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return apiClient.post('/auth/register', data);
  },

  // Get current user
  getMe: async (): Promise<{ success: boolean; data: User }> => {
    return apiClient.get('/auth/me');
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<{ success: boolean; data: User }> => {
    return apiClient.put('/auth/profile', data);
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    return apiClient.put('/auth/password', data);
  },
};
