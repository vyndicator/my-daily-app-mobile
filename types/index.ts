export interface User {
  id: number;
  email: string;
}

export interface Note {
  id: number;
  content: string;
}

export interface Todo {
  id: number;
  text: string;
  dueDate: string;
  completed: boolean;
  recurring?: boolean;
  recurrenceInterval?: 'yearly' | 'monthly' | 'weekly';
}

export interface Habit {
  id: number;
  text: string;
  days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  createdAt: string;
  completedToday?: boolean;
}

export interface ShoppingItem {
  id: number;
  text: string;
  isFavorite: boolean;
}

export interface HistoryItem {
  id: number;
  text: string;
  isFavorite: boolean;
}

export interface Birthday {
  id: number;
  name: string;
  date: string; // ISO date string
  notes?: string;
}
