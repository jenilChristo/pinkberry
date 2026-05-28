import { apiClient } from './client';
import type { CryAnalysis, CryAnalysisResult, CryPatterns } from '@/types';

export const cryAnalysisService = {
  async analyzeCry(
    babyId: string,
    audioDataBase64: string,
    durationSeconds: number,
    recordedBy: string
  ): Promise<CryAnalysisResult> {
    return apiClient.post<CryAnalysisResult>('/api/cryanalysis/analyze', {
      babyId,
      audioDataBase64,
      durationSeconds,
      recordedBy,
    });
  },

  async saveAnalysis(
    babyId: string,
    result: CryAnalysisResult,
    durationSeconds: number,
    recordedBy: string,
    notes?: string
  ): Promise<string> {
    return apiClient.post<string>('/api/cryanalysis/save', {
      babyId,
      primaryReason: result.primaryReason,
      secondaryReason: result.secondaryReason,
      confidenceLevel: result.confidenceLevel,
      durationSeconds,
      audioIntensityDb: result.audioIntensityDb,
      recordedBy,
      notes,
    });
  },

  async getHistory(babyId: string, days: number = 7): Promise<CryAnalysis[]> {
    return apiClient.get<CryAnalysis[]>(`/api/cryanalysis/history/${babyId}?days=${days}`);
  },

  async getPatterns(babyId: string, days: number = 30): Promise<CryPatterns> {
    return apiClient.get<CryPatterns>(`/api/cryanalysis/patterns/${babyId}?days=${days}`);
  },

  async provideFeedback(
    analysisId: string,
    wasAccurate: boolean,
    feedbackNotes?: string
  ): Promise<void> {
    return apiClient.post(`/api/cryanalysis/${analysisId}/feedback`, {
      wasAccurate,
      feedbackNotes,
    });
  },
};
