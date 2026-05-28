import { apiClient } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import { config } from '@/config';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    // Store tokens
    localStorage.setItem(config.storage.authToken, response.token);
    localStorage.setItem(config.storage.refreshToken, response.refreshToken);
    
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    
    // Store tokens
    localStorage.setItem(config.storage.authToken, response.token);
    localStorage.setItem(config.storage.refreshToken, response.refreshToken);
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem(config.storage.authToken);
      localStorage.removeItem(config.storage.refreshToken);
      localStorage.removeItem(config.storage.currentBaby);
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem(config.storage.refreshToken);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });

    localStorage.setItem(config.storage.authToken, response.token);
    localStorage.setItem(config.storage.refreshToken, response.refreshToken);

    return response;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(config.storage.authToken);
  },

  getToken(): string | null {
    return localStorage.getItem(config.storage.authToken);
  },
};
