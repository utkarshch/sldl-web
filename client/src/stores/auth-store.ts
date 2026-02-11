import { create } from "zustand";

interface AuthState {
  username: string;
  password: string;
  isConfigured: boolean;
  isValidating: boolean;
  error: string | null;
  setCredentials: (username: string, password: string) => void;
  setConfigured: (val: boolean) => void;
  setValidating: (val: boolean) => void;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  username: "",
  password: "",
  isConfigured: false,
  isValidating: false,
  error: null,
  setCredentials: (username, password) => set({ username, password }),
  setConfigured: (val) => set({ isConfigured: val }),
  setValidating: (val) => set({ isValidating: val }),
  setError: (err) => set({ error: err }),
}));
