import { apiClient } from './client';
import type { Baby } from '@/types';

export const babyService = {
  async getBabies(): Promise<Baby[]> {
    return apiClient.get<Baby[]>('/api/babies');
  },

  async getBaby(id: string): Promise<Baby> {
    return apiClient.get<Baby>(`/api/babies/${id}`);
  },

  async createBaby(baby: Omit<Baby, 'id' | 'createdAt' | 'lastModifiedUtc'>): Promise<Baby> {
    return apiClient.post<Baby>('/api/babies', baby);
  },

  async updateBaby(id: string, baby: Partial<Baby>): Promise<Baby> {
    return apiClient.put<Baby>(`/api/babies/${id}`, baby);
  },

  async deleteBaby(id: string): Promise<void> {
    return apiClient.delete(`/api/babies/${id}`);
  },

  async uploadPhoto(babyId: string, file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.upload<{ photoUrl: string }>(`/api/babies/${babyId}/photo`, formData);
  },
};
