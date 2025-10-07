import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectivesAPI, type Objective, type CreateObjectiveData, type UpdateObjectiveData, type ObjectiveFilters } from '@/lib/api';

// Query keys
export const objectiveKeys = {
  all: ['objectives'] as const,
  lists: () => [...objectiveKeys.all, 'list'] as const,
  list: (filters?: ObjectiveFilters) => [...objectiveKeys.lists(), filters] as const,
  details: () => [...objectiveKeys.all, 'detail'] as const,
  detail: (id: string) => [...objectiveKeys.details(), id] as const,
};

// Get all objectives
export function useObjectives(filters?: ObjectiveFilters) {
  return useQuery({
    queryKey: objectiveKeys.list(filters),
    queryFn: async () => {
      const response = await objectivesAPI.getObjectives(filters);
      return response.data;
    },
  });
}

// Get single objective
export function useObjective(id: string) {
  return useQuery({
    queryKey: objectiveKeys.detail(id),
    queryFn: async () => {
      const response = await objectivesAPI.getObjective(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create objective
export function useCreateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateObjectiveData) => {
      const response = await objectivesAPI.createObjective(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.lists() });
    },
  });
}

// Update objective
export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateObjectiveData }) => {
      const response = await objectivesAPI.updateObjective(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.lists() });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.detail(data._id) });
    },
  });
}

// Delete objective
export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await objectivesAPI.deleteObjective(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.lists() });
    },
  });
}

// Publish objective
export function usePublishObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await objectivesAPI.publishObjective(id);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.lists() });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.detail(data._id) });
    },
  });
}
