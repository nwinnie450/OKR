import apiClient from './client';

export interface Team {
  _id: string;
  name: string;
  description?: string;
  leaderId?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  department?: string;
  isActive: boolean;
  memberCount: number;
  tags?: string[];
  color?: string;
  createdAt: string;
  updatedAt: string;
  members?: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  }>;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  leaderId?: string;
  department?: string;
  tags?: string[];
  color?: string;
}

export interface UpdateTeamData extends Partial<CreateTeamData> {
  isActive?: boolean;
}

export interface TeamFilters {
  isActive?: boolean;
  leaderId?: string;
  search?: string;
}

export const teamsAPI = {
  // Get all teams
  getTeams: async (filters?: TeamFilters): Promise<{ success: boolean; count: number; data: Team[] }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiClient.get(`/teams?${params.toString()}`);
  },

  // Get single team
  getTeam: async (id: string): Promise<{ success: boolean; data: Team }> => {
    return apiClient.get(`/teams/${id}`);
  },

  // Create team
  createTeam: async (data: CreateTeamData): Promise<{ success: boolean; data: Team }> => {
    return apiClient.post('/teams', data);
  },

  // Update team
  updateTeam: async (id: string, data: UpdateTeamData): Promise<{ success: boolean; data: Team }> => {
    return apiClient.put(`/teams/${id}`, data);
  },

  // Delete team
  deleteTeam: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/teams/${id}`);
  },

  // Add member to team
  addMember: async (teamId: string, userId: string): Promise<{ success: boolean; message: string; data: Team }> => {
    return apiClient.post(`/teams/${teamId}/members`, { userId });
  },

  // Remove member from team
  removeMember: async (teamId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/teams/${teamId}/members`, { data: { userId } });
  },
};
