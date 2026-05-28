import { apiClient } from './client';
import type { Feeding } from '@/types';

export const feedingService = {
  async getFeedings(babyId: string, days: number = 7): Promise<Feeding[]> {
    return apiClient.get<Feeding[]>(`/api/feedings/${babyId}?days=${days}`);
  },

  async createFeeding(
    feeding: Omit<Feeding, 'id' | 'createdAt' | 'lastModifiedUtc'>
  ): Promise<Feeding> {
    return apiClient.post<Feeding>('/api/feedings', feeding);
  },

  async updateFeeding(id: string, feeding: Partial<Feeding>): Promise<Feeding> {
    return apiClient.put<Feeding>(`/api/feedings/${id}`, feeding);
  },

  async deleteFeeding(id: string): Promise<void> {
    return apiClient.delete(`/api/feedings/${id}`);
  },
};
