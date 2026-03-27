import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import client from "../api/client";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (token) {
        const response = await client.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: response.data, token, initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch {
      await SecureStore.deleteItemAsync("auth_token");
      set({ initialized: true, user: null, token: null });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const response = await client.post("/api/auth/login", {
        email,
        password,
      });
      const { token } = response.data;
      await SecureStore.setItemAsync("auth_token", token);
      const userResponse = await client.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: userResponse.data, token, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email, password) => {
    set({ loading: true });
    try {
      await client.post("/api/auth/register", { email, password });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
    await get().signIn(email, password);
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync("auth_token");
    set({ user: null, token: null });
  },
}));
