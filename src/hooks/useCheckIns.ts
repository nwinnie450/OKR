import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInsAPI, type CheckIn, type CreateCheckInData, type UpdateCheckInData, type CheckInFilters } from '@/lib/api';
import { keyResultKeys } from './useKeyResults';
import { objectiveKeys } from './useObjectives';

// Query keys
export const checkInKeys = {
  all: ['checkins'] as const,
  lists: () => [...checkInKeys.all, 'list'] as const,
  list: (filters?: CheckInFilters) => [...checkInKeys.lists(), filters] as const,
  details: () => [...checkInKeys.all, 'detail'] as const,
  detail: (id: string) => [...checkInKeys.details(), id] as const,
  stats: (userId?: string) => [...checkInKeys.all, 'stats', userId] as const,
};

// Get all check-ins
export function useCheckIns(filters?: CheckInFilters) {
  return useQuery({
    queryKey: checkInKeys.list(filters),
    queryFn: async () => {
      const response = await checkInsAPI.getCheckIns(filters);
      return response.data;
    },
  });
}

// Get single check-in
export function useCheckIn(id: string) {
  return useQuery({
    queryKey: checkInKeys.detail(id),
    queryFn: async () => {
      const response = await checkInsAPI.getCheckIn(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Get user check-in stats
export function useCheckInStats(userId?: string) {
  return useQuery({
    queryKey: checkInKeys.stats(userId),
    queryFn: async () => {
      const response = await checkInsAPI.getUserStats(userId);
      return response.data;
    },
  });
}

// Create check-in
export function useCreateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCheckInData) => {
      const response = await checkInsAPI.createCheckIn(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.stats() });
      queryClient.invalidateQueries({ queryKey: keyResultKeys.detail(data.keyResultId) });
      queryClient.invalidateQueries({ queryKey: keyResultKeys.lists() });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.lists() });
    },
  });
}

// Update check-in
export function useUpdateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCheckInData }) => {
      const response = await checkInsAPI.updateCheckIn(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.detail(data._id) });
    },
  });
}

// Delete check-in
export function useDeleteCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await checkInsAPI.deleteCheckIn(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.lists() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.stats() });
    },
  });
}
