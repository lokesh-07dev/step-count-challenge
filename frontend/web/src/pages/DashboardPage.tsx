import React from "react";
import {
  Footprints,
  Flame,
  MapPin,
  TrendingUp,
  Trophy,
  Users,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import {
  DEFAULT_DAILY_STEP_TARGET,
  calculateProgressPercentage,
  calculateRemainingSteps,
} from "@stepora/shared";

export const DashboardPage: React.FC = () => {
  const currentSteps = 6420;
  const target = DEFAULT_DAILY_STEP_TARGET;
  const percentage = calculateProgressPercentage(currentSteps, target);
  const remaining = calculateRemainingSteps(currentSteps, target);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Activity Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Displaying activity synchronized from your connected mobile device.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-slate-300">Device in Sync</span>
        </div>
      </div>

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
          subValue="To achieve today's goal"
          icon={TrendingUp}
          accentColor="text-teal-400"
        />
        <StatCard
          label="Distance Walked"
          value="4.8 km"
          subValue="Average stride 0.76m"
          icon={MapPin}
          accentColor="text-cyan-400"
        />
        <StatCard
          label="Calories Burned"
          value="288 kcal"
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
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Active Challenges Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Challenge Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-400">
              <Trophy className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Individual Challenge</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Active (Day 12 of 30)
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium">30-Day Healthy Stepper Challenge</p>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Accumulated Steps:</span>
              <span className="font-semibold text-slate-200">124,500</span>
            </div>
            <div className="flex justify-between">
              <span>Days Target Met:</span>
              <span className="font-semibold text-slate-200">10 / 12 days</span>
            </div>
          </div>
        </div>

        {/* Group Challenge Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-400">
              <Users className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Group Challenge</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950 text-teal-400 border border-teal-800">
              Rank #2 of 8
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium">Weekend Striders Invitational</p>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Your Eligible Steps:</span>
              <span className="font-semibold text-slate-200">6,420</span>
            </div>
            <div className="flex justify-between">
              <span>Leader (Alex):</span>
              <span className="font-semibold text-slate-200">7,100 (+680)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
