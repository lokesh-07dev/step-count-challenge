import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Footprints,
  Flame,
  MapPin,
  TrendingUp,
  Trophy,
  Users,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import {
  DEFAULT_DAILY_STEP_TARGET,
  calculateProgressPercentage,
  calculateRemainingSteps,
  calculateDistanceMeters,
  calculateCaloriesBurned,
  MOTIVATION_MILESTONES,
} from "@stepora/shared";

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [customStepsInput, setCustomStepsInput] = useState<string>("1000");
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Fetch real daily activity from backend
  const { data: dailyData, isLoading: isDailyLoading } = useQuery({
    queryKey: ["dailyActivity", user?.id, todayStr],
    queryFn: async () => {
      const res = await fetch(`/api/v1/activity/daily?date=${todayStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      return json.success ? json.data : null;
    },
    enabled: !!user,
  });

  // Fetch user challenges
  const { data: challengesData } = useQuery({
    queryKey: ["myChallenges", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/v1/challenges/my", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      return json.success ? json.data : [];
    },
    enabled: !!user,
  });

  // Fetch user groups
  const { data: groupsData } = useQuery({
    queryKey: ["myGroups", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/v1/groups/my", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      return json.success ? json.data : [];
    },
    enabled: !!user,
  });

  // Real step synchronization mutation
  const syncMutation = useMutation({
    mutationFn: async (stepsToAdd: number) => {
      const payload = {
        deviceId: "web-dashboard-simulator",
        platform: "web" as const,
        records: [
          {
            date: todayStr,
            stepCount: stepsToAdd,
            activeMinutes: Math.round(stepsToAdd / 100),
            distanceMeters: calculateDistanceMeters(stepsToAdd),
            caloriesBurned: calculateCaloriesBurned(stepsToAdd),
            source: "manual_dev" as const,
            sourceRecordId: `web-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            clientTimestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch("/api/v1/activity/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Sync failed");
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dailyActivity"] });
      queryClient.invalidateQueries({ queryKey: ["myChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["challengeLeaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["groupLeaderboard"] });

      if (data.milestoneUnlocked) {
        setSyncFeedback(
          `🎉 Unlocked 1,000 Step Milestone! Synced ${data.acceptedCount} record (${data.todaySummary.totalSteps.toLocaleString()} steps today).`
        );
      } else {
        setSyncFeedback(
          `✅ Synced ${data.acceptedCount} record. Today's total is now ${data.todaySummary.totalSteps.toLocaleString()} steps.`
        );
      }
      setTimeout(() => setSyncFeedback(null), 6000);
    },
    onError: (err: any) => {
      setSyncFeedback(`❌ Error: ${err.message}`);
      setTimeout(() => setSyncFeedback(null), 6000);
    },
  });

  const currentSteps = dailyData?.totalSteps ?? 0;
  const target = dailyData?.target ?? DEFAULT_DAILY_STEP_TARGET;
  const percentage = calculateProgressPercentage(currentSteps, target);
  const remaining = calculateRemainingSteps(currentSteps, target);
  const distanceKm = ((dailyData?.totalDistanceMeters ?? calculateDistanceMeters(currentSteps)) / 1000).toFixed(2);
  const caloriesBurned = dailyData?.totalCaloriesBurned ?? calculateCaloriesBurned(currentSteps);

  const activeChallenges = challengesData || [];
  const activeGroups = groupsData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Activity Dashboard
            </h1>
            {user && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                {user.name}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Displaying live activity synchronized with your account from mobile Health Connect and Apple HealthKit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Live API Connected</span>
          </div>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-950/40 text-brand-300 text-sm flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-400 flex-shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* 1,000-Step Milestone Achievement Alert */}
      {currentSteps >= MOTIVATION_MILESTONES.FIRST_MILESTONE && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300">1,000 Steps Daily Milestone Unlocked!</h4>
              <p className="text-xs text-slate-400">
                You crossed your first 1,000 steps today. Keep building your momentum!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            Verified
          </span>
        </div>
      )}

      {/* Today's Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Steps"
          value={currentSteps.toLocaleString()}
          subValue={`Target: ${target.toLocaleString()} steps`}
          icon={Footprints}
          badge={`${percentage}%`}
          accentColor="text-brand-400"
        />
        <StatCard
          label="Remaining Steps"
          value={remaining.toLocaleString()}
          subValue={remaining === 0 ? "Goal Achieved Today! 🎉" : "To achieve today's goal"}
          icon={TrendingUp}
          accentColor="text-teal-400"
        />
        <StatCard
          label="Distance Walked"
          value={`${distanceKm} km`}
          subValue="Calculated from stride"
          icon={MapPin}
          accentColor="text-cyan-400"
        />
        <StatCard
          label="Calories Burned"
          value={`${caloriesBurned} kcal`}
          subValue="Active walking metabolism"
          icon={Flame}
          accentColor="text-amber-400"
        />
      </div>

      {/* Progress Bar Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-white">Daily Target Progress</span>
          <span className="font-bold text-brand-400">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Sync Step Activity Tool for Simulation and Testing */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-brand-400" />
              Synchronize Device Health Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate or manually send step batches to the backend idempotency pipeline.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => syncMutation.mutate(1000)}
              disabled={syncMutation.isPending}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              +1,000 Steps
            </button>
            <button
              onClick={() => syncMutation.mutate(2500)}
              disabled={syncMutation.isPending}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              +2,500 Steps
            </button>
            <button
              onClick={() => syncMutation.mutate(5000)}
              disabled={syncMutation.isPending}
              className="px-3 py-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-xs font-semibold text-brand-400 transition-colors"
            >
              +5,000 Steps
            </button>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="100"
                max="50000"
                value={customStepsInput}
                onChange={(e) => setCustomStepsInput(e.target.value)}
                className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                placeholder="Steps"
              />
              <button
                onClick={() => {
                  const val = parseInt(customStepsInput, 10);
                  if (val > 0) syncMutation.mutate(val);
                }}
                disabled={syncMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-brand-500/20"
              >
                {syncMutation.isPending ? "Syncing..." : "Sync"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges & Groups Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Challenge Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-400">
              <Trophy className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Individual Challenges</h2>
            </div>
            <Link
              to="/challenges"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          {activeChallenges.length > 0 ? (
            <div className="space-y-3">
              {activeChallenges.slice(0, 2).map((ch: any) => (
                <div key={ch.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{ch.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
                      {ch.durationDays} Days ({ch.dailyStepTarget.toLocaleString()} steps/day)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Cumulative Verified Steps:</span>
                    <span className="font-semibold text-slate-200">
                      {(ch.totalSteps ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-400">You haven't joined an individual challenge yet.</p>
              <Link
                to="/challenges"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-semibold hover:bg-brand-500/30 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Join a Challenge
              </Link>
            </div>
          )}
        </div>

        {/* Group Challenge Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-400">
              <Users className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Group Challenges</h2>
            </div>
            <Link
              to="/groups"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              View Groups &rarr;
            </Link>
          </div>
          {activeGroups.length > 0 ? (
            <div className="space-y-3">
              {activeGroups.slice(0, 2).map((grp: any) => (
                <div key={grp.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{grp.name}</span>
                    <span className="font-mono text-[10px] text-teal-400 px-2 py-0.5 rounded-full bg-teal-950/60 border border-teal-800">
                      Code: {grp.inviteCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{grp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-slate-400">No active group challenges yet.</p>
              <Link
                to="/groups"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold hover:bg-teal-500/30 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Join or Create Group
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};