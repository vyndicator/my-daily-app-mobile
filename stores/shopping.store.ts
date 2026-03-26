import { create } from 'zustand';
import client from '../api/client';
import { ShoppingItem, HistoryItem } from '../types';

interface ShoppingState {
  items: ShoppingItem[];
  history: HistoryItem[];
  loading: boolean;
  load: () => Promise<void>;
  addItem: (text: string) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  toggleFavoriteHistory: (id: number) => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  history: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const [itemsRes, historyRes] = await Promise.all([
        client.get('/api/shopping/items'),
        client.get('/api/shopping/history'),
      ]);
      set({ items: itemsRes.data, history: historyRes.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (text) => {
    const response = await client.post('/api/shopping/items', {
      text,
      isFavorite: false,
    });
    set({ items: [...get().items, response.data] });
  },

  removeItem: async (id) => {
    const previous = get().items;
    set({ items: previous.filter((i) => i.id !== id) });
    try {
      await client.delete(`/api/shopping/items/${id}`);
      // Reload history since deleting might add it there
      const historyRes = await client.get('/api/shopping/history');
      set({ history: historyRes.data });
    } catch {
      set({ items: previous });
    }
  },

  toggleFavoriteHistory: async (id) => {
    const previous = get().history;
    set({
      history: previous.map((h) =>
        h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
      ),
    });
    try {
      await client.put(`/api/shopping/history/${id}/favorite`);
    } catch {
      set({ history: previous });
    }
  },
}));
