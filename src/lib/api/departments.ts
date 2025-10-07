import apiClient from './client';

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  headOfDepartment?: string | null;
}

export const departmentsAPI = {
  /**
   * Get all active departments
   */
  getAll: async (): Promise<{ success: boolean; count: number; data: Department[] }> => {
    return apiClient.get('/departments');
  },

  /**
   * Get single department by ID
   */
  getById: async (id: string): Promise<{ success: boolean; data: Department }> => {
    return apiClient.get(`/departments/${id}`);
  },

  /**
   * Create new department
   */
  create: async (data: CreateDepartmentData): Promise<{ success: boolean; data: Department }> => {
    return apiClient.post('/departments', data);
  },

  /**
   * Update department
   */
  update: async (
    id: string,
    data: UpdateDepartmentData
  ): Promise<{ success: boolean; data: Department }> => {
    return apiClient.put(`/departments/${id}`, data);
  },

  /**
   * Delete department (soft delete)
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/departments/${id}`);
  },
};
