import { apiClient } from './client';
import type { DiaperChange } from '@/types';

export const diaperService = {
  async getDiaperChanges(babyId: string, days: number = 7): Promise<DiaperChange[]> {
    return apiClient.get<DiaperChange[]>(`/api/diapers/${babyId}?days=${days}`);
  },

  async createDiaperChange(
    diaper: Omit<DiaperChange, 'id' | 'createdAt' | 'lastModifiedUtc'>
  ): Promise<DiaperChange> {
    return apiClient.post<DiaperChange>('/api/diapers', diaper);
  },

  async updateDiaperChange(id: string, diaper: Partial<DiaperChange>): Promise<DiaperChange> {
    return apiClient.put<DiaperChange>(`/api/diapers/${id}`, diaper);
  },

  async deleteDiaperChange(id: string): Promise<void> {
    return apiClient.delete(`/api/diapers/${id}`);
  },
};
