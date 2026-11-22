import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionData } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("No authorization code returned from Google.");
      return;
    }

    async function exchangeCode() {
      try {
        const res = await fetch("/api/v1/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: window.location.origin + "/auth/callback",
          }),
        });

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message || "Failed to exchange Google OAuth code.");
        }

        setSessionData(json.data.user, json.data.token);
        navigate("/dashboard", { replace: true });
      } catch (err: any) {
        setError(err.message || "Failed to complete Google authentication.");
      }
    }

    exchangeCode();
  }, [searchParams, navigate, setSessionData]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-950 flex items-center justify-center text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
        <p className="text-sm text-slate-400 max-w-md">{error}</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-semibold text-sm"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Completing Google authentication...</p>
    </div>
  );
};
