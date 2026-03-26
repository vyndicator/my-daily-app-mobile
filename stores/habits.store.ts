import { create } from 'zustand';
import client from '../api/client';
import { Habit, Todo } from '../types';

interface HabitsState {
  habits: Habit[];
  todos: Todo[];
  loading: boolean;
  load: () => Promise<void>;
  // Habits
  addHabit: (text: string, days: number[]) => Promise<void>;
  updateHabit: (id: number, text: string, days: number[]) => Promise<void>;
  removeHabit: (id: number) => Promise<void>;
  completeHabit: (id: number) => Promise<void>;
  // Todos
  addTodo: (text: string, dueDate: string, recurring?: boolean, recurrenceInterval?: string) => Promise<void>;
  updateTodo: (id: number, data: Partial<Todo>) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
  completeTodo: (id: number) => Promise<void>;
  // Computed
  todayHabits: () => Habit[];
  pendingTodos: () => Todo[];
  overdueTodos: () => Todo[];
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  todos: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const [habitsRes, todosRes] = await Promise.all([
        client.get('/api/habits'),
        client.get('/api/todos'),
      ]);
      set({ habits: habitsRes.data, todos: todosRes.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addHabit: async (text, days) => {
    const response = await client.post('/api/habits', {
      text,
      days,
      createdAt: new Date().toISOString(),
    });
    set({ habits: [...get().habits, response.data] });
  },

  updateHabit: async (id, text, days) => {
    const previous = get().habits;
    set({
      habits: previous.map((h) => (h.id === id ? { ...h, text, days } : h)),
    });
    try {
      await client.put(`/api/habits/${id}`, { text, days });
    } catch {
      set({ habits: previous });
      throw new Error('Failed to update habit');
    }
  },

  removeHabit: async (id) => {
    const previous = get().habits;
    set({ habits: previous.filter((h) => h.id !== id) });
    try {
      await client.delete(`/api/habits/${id}`);
    } catch {
      set({ habits: previous });
    }
  },

  completeHabit: async (id) => {
    const previous = get().habits;
    set({
      habits: previous.map((h) =>
        h.id === id ? { ...h, completedToday: true } : h
      ),
    });
    try {
      await client.put(`/api/habits/${id}/complete`);
    } catch {
      set({ habits: previous });
    }
  },

  addTodo: async (text, dueDate, recurring = false, recurrenceInterval) => {
    const response = await client.post('/api/todos', {
      text,
      dueDate,
      completed: false,
      recurring,
      recurrenceInterval,
    });
    set({ todos: [...get().todos, response.data] });
  },

  updateTodo: async (id, data) => {
    const previous = get().todos;
    set({
      todos: previous.map((t) => (t.id === id ? { ...t, ...data } : t)),
    });
    try {
      await client.put(`/api/todos/${id}`, data);
    } catch {
      set({ todos: previous });
      throw new Error('Failed to update todo');
    }
  },

  removeTodo: async (id) => {
    const previous = get().todos;
    set({ todos: previous.filter((t) => t.id !== id) });
    try {
      await client.delete(`/api/todos/${id}`);
    } catch {
      set({ todos: previous });
    }
  },

  completeTodo: async (id) => {
    const previous = get().todos;
    set({
      todos: previous.map((t) =>
        t.id === id ? { ...t, completed: true } : t
      ),
    });
    try {
      await client.put(`/api/todos/${id}/complete`);
    } catch {
      set({ todos: previous });
    }
  },

  todayHabits: () => {
    const today = new Date().getDay();
    return get().habits.filter((h) => h.days.includes(today));
  },

  pendingTodos: () => {
    const today = new Date().toISOString().split('T')[0];
    return get()
      .todos.filter((t) => !t.completed && t.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },

  overdueTodos: () => {
    const today = new Date().toISOString().split('T')[0];
    return get()
      .todos.filter((t) => !t.completed && t.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },
}));
