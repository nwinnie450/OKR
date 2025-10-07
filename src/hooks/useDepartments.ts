import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  departmentsAPI,
  type Department,
  type CreateDepartmentData,
  type UpdateDepartmentData,
} from '@/lib/api/departments';

// Query keys
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: () => [...departmentKeys.lists()] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

/**
 * Get all departments
 */
export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: async () => {
      const response = await departmentsAPI.getAll();
      return response.data;
    },
  });
}

/**
 * Get single department by ID
 */
export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: async () => {
      const response = await departmentsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new department
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepartmentData) => {
      const response = await departmentsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

/**
 * Update department
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDepartmentData }) => {
      const response = await departmentsAPI.update(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data._id) });
    },
  });
}

/**
 * Delete department
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await departmentsAPI.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}
