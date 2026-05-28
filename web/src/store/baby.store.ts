import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Baby } from '@/types';
import { config } from '@/config';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  setBabies: (babies: Baby[]) => void;
  setCurrentBaby: (baby: Baby | null) => void;
  addBaby: (baby: Baby) => void;
  updateBaby: (id: string, updates: Partial<Baby>) => void;
  removeBaby: (id: string) => void;
}

export const useBabyStore = create<BabyState>()(
  persist(
    (set) => ({
      babies: [],
      currentBaby: null,
      setBabies: (babies) => set({ babies }),
      setCurrentBaby: (baby) => {
        set({ currentBaby: baby });
        if (baby) {
          localStorage.setItem(config.storage.currentBaby, baby.id);
        } else {
          localStorage.removeItem(config.storage.currentBaby);
        }
      },
      addBaby: (baby) => set((state) => ({ babies: [...state.babies, baby] })),
      updateBaby: (id, updates) =>
        set((state) => ({
          babies: state.babies.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          currentBaby:
            state.currentBaby?.id === id
              ? { ...state.currentBaby, ...updates }
              : state.currentBaby,
        })),
      removeBaby: (id) =>
        set((state) => ({
          babies: state.babies.filter((b) => b.id !== id),
          currentBaby: state.currentBaby?.id === id ? null : state.currentBaby,
        })),
    }),
    {
      name: 'baby-storage',
    }
  )
);
