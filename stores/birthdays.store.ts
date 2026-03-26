import { create } from 'zustand';
import client from '../api/client';
import { Birthday } from '../types';

function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  const next = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface BirthdaysState {
  birthdays: Birthday[];
  loading: boolean;
  load: () => Promise<void>;
  add: (name: string, date: string, notes?: string) => Promise<void>;
  update: (id: number, name: string, date: string, notes?: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  sortedByUpcoming: () => Birthday[];
}

export const useBirthdaysStore = create<BirthdaysState>((set, get) => ({
  birthdays: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const response = await client.get('/api/birthdays');
      set({ birthdays: response.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  add: async (name, date, notes) => {
    const response = await client.post('/api/birthdays', { name, date, notes });
    set({ birthdays: [...get().birthdays, response.data] });
  },

  update: async (id, name, date, notes) => {
    const previous = get().birthdays;
    set({
      birthdays: previous.map((b) =>
        b.id === id ? { ...b, name, date, notes } : b
      ),
    });
    try {
      await client.put(`/api/birthdays/${id}`, { name, date, notes });
    } catch {
      set({ birthdays: previous });
      throw new Error('Failed to update birthday');
    }
  },

  remove: async (id) => {
    const previous = get().birthdays;
    set({ birthdays: previous.filter((b) => b.id !== id) });
    try {
      await client.delete(`/api/birthdays/${id}`);
    } catch {
      set({ birthdays: previous });
    }
  },

  sortedByUpcoming: () => {
    return [...get().birthdays].sort(
      (a, b) => getDaysUntil(a.date) - getDaysUntil(b.date)
    );
  },
}));

export { getDaysUntil };
