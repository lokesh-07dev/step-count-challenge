import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Footprints,
  Trophy,
  Users,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Activity,
  HeartPulse,
} from "lucide-react";
import { checkBackendHealth } from "../services/api";
import { APP_NAME, APP_TAGLINE, MOTIVATION_MILESTONES } from "@stepora/shared";

export const LandingPage: React.FC = () => {
  const {
    data: health,
    isSuccess,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["backend-health"],
    queryFn: checkBackendHealth,
    retry: 2,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 pb-12">
        {/* Backend Connectivity Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all shadow-sm">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-slate-400 border-slate-800 bg-slate-900/60">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              Probing Stepora API...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-900/50 bg-emerald-950/40">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Backend Connected ({health?.service} v{health?.version})
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-400 border-rose-900/50 bg-rose-950/40">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Backend Offline (Start worker: npm run dev:backend)
            </span>
          )}
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Walk every day. <br />
          <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Challenge together.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {APP_NAME} synchronizes real physical steps from Android Health Connect and Apple
          HealthKit into private challenges, group competitions, and live leaderboards.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-base transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center justify-center"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* Primary Value Pillars */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur space-y-4">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Smartphone className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Native Health Integration</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Directly connected to Android Health Connect and Apple HealthKit. No manual step typing,
            no fake claims. Only authorized, verified hardware step records.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur space-y-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Custom Challenge Durations</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Create individual or group challenges with flexible durations: 7, 10, 14, 21, 30, 45, 60
            days or custom durations. Each day tracks against individual daily targets.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur space-y-4">
          <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Group Leaderboards & Codes</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Invite friends via unique, secure invite codes. Every participant maintains their own
            step score. Real-time daily and overall leaderboards determine the champion.
          </p>
        </div>
      </section>

      {/* 1,000 Step Milestone Highlight */}
      <section className="p-8 sm:p-12 rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Motivation Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            The {MOTIVATION_MILESTONES.FIRST_MILESTONE.toLocaleString()} Steps Milestone
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stepora celebrates every victory. When you cross the first 1,000 steps of your day, the
            motivational engine triggers a vibrant celebration and registers the milestone to boost
            your streak and inspire you toward your full daily target.
          </p>
        </div>
      </section>
    </div>
  );
};
