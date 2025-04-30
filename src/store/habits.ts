import { create } from 'zustand';

interface HabitData {
  date: string;
  noSmoking: boolean;
  exercise: boolean;
  water: boolean;
  sleep: boolean;
  vegFruits: boolean;
  alcohol: boolean;
  saltOil: boolean;
  b12: boolean;
  breathing: boolean;
  smokingCount: number;
}

interface HabitStore {
  habitData: HabitData[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  initializeExcel: () => Promise<void>;
  toggleHabit: (date: string, habitId: string) => Promise<void>;
  incrementSmokingCount: (date: string) => Promise<void>;
  saveToExcel: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habitData: [],
  isLoading: false,
  error: null,
  initialized: false,

  initializeExcel: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/excel');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      set({ habitData: data, initialized: true });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to initialize' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleHabit: async (date: string, habitId: string) => {
    const { habitData } = get();
    const dayData = habitData.find(d => d.date === date);
    if (!dayData) return;

    const updatedData = {
      ...dayData,
      [habitId]: !dayData[habitId as keyof HabitData],
    };

    try {
      const response = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update habit');

      set({
        habitData: habitData.map(d => 
          d.date === date ? updatedData : d
        ),
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update habit' });
    }
  },

  incrementSmokingCount: async (date: string) => {
    const { habitData } = get();
    const dayData = habitData.find(d => d.date === date);
    if (!dayData) return;

    const updatedData = {
      ...dayData,
      smokingCount: (dayData.smokingCount || 0) + 1,
    };

    try {
      const response = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update smoking count');

      set({
        habitData: habitData.map(d => 
          d.date === date ? updatedData : d
        ),
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update smoking count' });
    }
  },

  saveToExcel: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/excel');
      if (!response.ok) throw new Error('Failed to save data');
      const data = await response.json();
      set({ habitData: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save data' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 