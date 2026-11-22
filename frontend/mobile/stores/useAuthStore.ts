import { create } from "zustand";
import type { UserSummary } from "@stepora/shared";
import { Platform } from "react-native";

// API Base URL config: Android emulator uses 10.0.2.2, iOS simulator uses localhost
const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:8787",
  default: "http://127.0.0.1:8787",
});

interface AuthState {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setSession: (user: UserSummary, token: string) => void;
  clearSession: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setSession: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    }),

  clearSession: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    }),

  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!json.success) {
        set({ error: json.error?.message || "Invalid email or password", isLoading: false });
        return false;
      }

      set({
        user: json.data.user,
        token: json.data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Network error connecting to Stepora backend", isLoading: false });
      return false;
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        }),
      });

      const json = await res.json();
      if (!json.success) {
        set({ error: json.error?.message || "Failed to create account", isLoading: false });
        return false;
      }

      set({
        user: json.data.user,
        token: json.data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Network error connecting to Stepora backend", isLoading: false });
      return false;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      // Connect to backend Google authentication callback
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/google/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testProfile: {
            email: "mobile.google.user@gmail.com",
            name: "Mobile Health Walker",
            picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          },
        }),
      });

      const json = await res.json();
      if (!json.success) {
        set({ error: json.error?.message || "Google authentication failed", isLoading: false });
        return false;
      }

      set({
        user: json.data.user,
        token: json.data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Network error during Google sign-in", isLoading: false });
      return false;
    }
  },

  signOut: async () => {
    const { token } = get();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/sign-out`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // Ignore sign-out network error
      }
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));