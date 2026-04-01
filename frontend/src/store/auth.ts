'use client';
import { create } from 'zustand';

export interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_access_token', accessToken);
      localStorage.setItem('nexus_refresh_token', refreshToken);
    }
    set({ user, accessToken });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexus_access_token');
      localStorage.removeItem('nexus_refresh_token');
    }
    set({ user: null, accessToken: null });
  },

  setLoading: (v) => set({ isLoading: v }),
}));
