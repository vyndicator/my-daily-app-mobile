import { create } from 'zustand';
import client from '../api/client';
import { Note } from '../types';

interface NotesState {
  notes: Note[];
  loading: boolean;
  load: () => Promise<void>;
  add: (content: string) => Promise<void>;
  update: (id: number, content: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const response = await client.get('/api/notes');
      set({ notes: response.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  add: async (content) => {
    const response = await client.post('/api/notes', { content });
    set({ notes: [response.data, ...get().notes] });
  },

  update: async (id, content) => {
    const previous = get().notes;
    set({ notes: previous.map((n) => (n.id === id ? { ...n, content } : n)) });
    try {
      await client.put(`/api/notes/${id}`, { content });
    } catch {
      set({ notes: previous });
      throw new Error('Failed to update note');
    }
  },

  remove: async (id) => {
    const previous = get().notes;
    set({ notes: previous.filter((n) => n.id !== id) });
    try {
      await client.delete(`/api/notes/${id}`);
    } catch {
      set({ notes: previous });
    }
  },
}));
