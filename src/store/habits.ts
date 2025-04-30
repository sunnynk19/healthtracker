import { create } from 'zustand';
import { HabitData } from '@/app/api/excel/route';

interface HabitStore {
  habitData: HabitData[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  setHabitData: (data: HabitData[]) => void;
  toggleHabit: (date: string, habit: keyof Omit<HabitData, 'date' | 'smokingCount'>) => void;
  incrementSmokingCount: (date: string) => void;
  initializeExcel: () => Promise<void>;
  saveToExcel: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habitData: [],
  isLoading: false,
  error: null,
  initialized: false,

  setHabitData: (data) => set({ habitData: data }),

  toggleHabit: (date, habit) => {
    const { habitData } = get();
    const newData = habitData.map(day => {
      if (day.date === date) {
        return {
          ...day,
          [habit]: !day[habit]
        };
      }
      return day;
    });
    set({ habitData: newData });
  },

  incrementSmokingCount: (date) => {
    const { habitData } = get();
    const newData = habitData.map(day => {
      if (day.date === date) {
        return {
          ...day,
          smokingCount: day.smokingCount + 1
        };
      }
      return day;
    });
    set({ habitData: newData });
  },

  initializeExcel: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/excel');
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      const data = await response.json();
      set({ habitData: data, initialized: true });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveToExcel: async () => {
    const { habitData } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save data' });
    } finally {
      set({ isLoading: false });
    }
  }
})); 