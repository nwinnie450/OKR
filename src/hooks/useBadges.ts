import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { badgesAPI, type Badge, type BadgeType, type BadgeFilters } from '@/lib/api';

// Query keys
export const badgeKeys = {
  all: ['badges'] as const,
  lists: () => [...badgeKeys.all, 'list'] as const,
  list: (filters?: BadgeFilters) => [...badgeKeys.lists(), filters] as const,
  types: () => [...badgeKeys.all, 'types'] as const,
};

// Get user's badges
export function useBadges(filters?: BadgeFilters) {
  return useQuery({
    queryKey: badgeKeys.list(filters),
    queryFn: async () => {
      const response = await badgesAPI.getBadges(filters);
      return response.data;
    },
  });
}

// Get all available badge types
export function useBadgeTypes() {
  return useQuery({
    queryKey: badgeKeys.types(),
    queryFn: async () => {
      const response = await badgesAPI.getBadgeTypes();
      return response.data;
    },
  });
}

// Check and award badges
export function useCheckBadges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId?: string) => {
      return await badgesAPI.checkBadges(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.lists() });
    },
  });
}

// Award badge manually (admin only)
export function useAwardBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; badgeType: string }) => {
      const response = await badgesAPI.awardBadge(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.lists() });
    },
  });
}

// Delete badge (admin only)
export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await badgesAPI.deleteBadge(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeKeys.lists() });
    },
  });
}
