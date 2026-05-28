import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isLoading: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  } | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isLoading: false,
  toast: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  showToast: (message, type) => set({ toast: { message, type, visible: true } }),
  hideToast: () => set({ toast: null }),
}));
