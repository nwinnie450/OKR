import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { keyResultsAPI, type KeyResult, type CreateKeyResultData, type UpdateKeyResultData, type KeyResultFilters } from '@/lib/api';
import { objectiveKeys } from './useObjectives';

// Query keys
export const keyResultKeys = {
  all: ['keyresults'] as const,
  lists: () => [...keyResultKeys.all, 'list'] as const,
  list: (filters?: KeyResultFilters) => [...keyResultKeys.lists(), filters] as const,
  details: () => [...keyResultKeys.all, 'detail'] as const,
  detail: (id: string) => [...keyResultKeys.details(), id] as const,
};

// Get all key results
export function useKeyResults(filters?: KeyResultFilters) {
  return useQuery({
    queryKey: keyResultKeys.list(filters),
    queryFn: async () => {
      const response = await keyResultsAPI.getKeyResults(filters);
      return response.data;
    },
  });
}

// Get single key result
export function useKeyResult(id: string) {
  return useQuery({
    queryKey: keyResultKeys.detail(id),
    queryFn: async () => {
      const response = await keyResultsAPI.getKeyResult(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create key result
export function useCreateKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateKeyResultData) => {
      const response = await keyResultsAPI.createKeyResult(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: keyResultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.detail(data.objectiveId) });
    },
  });
}

// Update key result
export function useUpdateKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateKeyResultData }) => {
      const response = await keyResultsAPI.updateKeyResult(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: keyResultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: keyResultKeys.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.detail(data.objectiveId) });
    },
  });
}

// Delete key result
export function useDeleteKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await keyResultsAPI.deleteKeyResult(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keyResultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.lists() });
    },
  });
}
