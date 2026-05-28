import { apiClient } from './client';
import type { DashboardSummary, Activity } from '@/types';

export const dashboardService = {
  async getDashboardSummary(babyId: string): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>(`/api/dashboard/${babyId}`);
  },

  async getActivities(babyId: string, days: number = 7): Promise<Activity[]> {
    return apiClient.get<Activity[]>(`/api/activity/${babyId}?days=${days}`);
  },
};
