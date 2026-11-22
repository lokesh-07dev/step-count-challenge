import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserSummary } from "@stepora/shared";

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  demoGoogleSignIn: (email?: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSessionData: (user: UserSummary, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "stepora_auth_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/session", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const json = await res.json();
        if (json.success && json.data.authenticated && json.data.user) {
          setUser(json.data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const setSessionData = (newUser: UserSummary, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
  };

  const signIn = async (email: string, password: string) => {
    const res = await fetch("/api/v1/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || "Failed to sign in.");
    }

    setSessionData(json.data.user, json.data.token);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/v1/auth/sign-up", {
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
      throw new Error(json.error?.message || "Failed to create account.");
    }

    setSessionData(json.data.user, json.data.token);
  };

  const signInWithGoogle = async () => {
    try {
      const res = await fetch("/api/v1/auth/google/url?redirectUri=" + encodeURIComponent(window.location.origin + "/auth/callback"));
      const json = await res.json();

      if (json.success && json.data?.configured && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        // Fallback for development if credentials haven't been entered in .env yet
        await demoGoogleSignIn();
      }
    } catch {
      await demoGoogleSignIn();
    }
  };

  const demoGoogleSignIn = async (
    email = "google.fitness.user@gmail.com",
    name = "Google Fit Walker"
  ) => {
    const res = await fetch("/api/v1/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testProfile: {
          email,
          name,
          picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        },
      }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || "Google sign-in failed.");
    }

    setSessionData(json.data.user, json.data.token);
  };

  const signOut = async () => {
    if (token) {
      try {
        await fetch("/api/v1/auth/sign-out", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Sign-out request failed:", err);
      }
    }

    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        demoGoogleSignIn,
        signOut,
        setSessionData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
