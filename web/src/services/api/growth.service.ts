import { apiClient } from './client';
import type { GrowthMeasurement } from '@/types';

export const growthService = {
  async getGrowthMeasurements(babyId: string): Promise<GrowthMeasurement[]> {
    return apiClient.get<GrowthMeasurement[]>(`/api/growth/${babyId}`);
  },

  async createGrowthMeasurement(
    measurement: Omit<GrowthMeasurement, 'id' | 'createdAt' | 'lastModifiedUtc'>
  ): Promise<GrowthMeasurement> {
    return apiClient.post<GrowthMeasurement>('/api/growth', measurement);
  },

  async updateGrowthMeasurement(
    id: string,
    measurement: Partial<GrowthMeasurement>
  ): Promise<GrowthMeasurement> {
    return apiClient.put<GrowthMeasurement>(`/api/growth/${id}`, measurement);
  },

  async deleteGrowthMeasurement(id: string): Promise<void> {
    return apiClient.delete(`/api/growth/${id}`);
  },
};
