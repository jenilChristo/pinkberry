import { apiClient } from './client';
import type { SleepRecord } from '@/types';

export const sleepService = {
  async getSleepRecords(babyId: string, days: number = 7): Promise<SleepRecord[]> {
    return apiClient.get<SleepRecord[]>(`/api/sleep/${babyId}?days=${days}`);
  },

  async startSleep(babyId: string, recordedBy: string, notes?: string): Promise<SleepRecord> {
    return apiClient.post<SleepRecord>('/api/sleep/start', {
      babyId,
      recordedBy,
      notes,
    });
  },

  async endSleep(
    sleepId: string,
    quality: SleepRecord['quality'],
    notes?: string
  ): Promise<SleepRecord> {
    return apiClient.post<SleepRecord>(`/api/sleep/${sleepId}/end`, {
      quality,
      notes,
    });
  },

  async createSleepRecord(
    record: Omit<SleepRecord, 'id' | 'createdAt' | 'lastModifiedUtc'>
  ): Promise<SleepRecord> {
    return apiClient.post<SleepRecord>('/api/sleep', record);
  },

  async updateSleepRecord(id: string, record: Partial<SleepRecord>): Promise<SleepRecord> {
    return apiClient.put<SleepRecord>(`/api/sleep/${id}`, record);
  },

  async deleteSleepRecord(id: string): Promise<void> {
    return apiClient.delete(`/api/sleep/${id}`);
  },
};
