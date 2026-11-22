import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { PRESET_CHALLENGE_DURATIONS, DEFAULT_DAILY_STEP_TARGET } from "@stepora/shared";
import type { IndividualChallengeProgress } from "@stepora/shared";

export const ChallengesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState<number>(30);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customDays, setCustomDays] = useState<string>("14");
  const [dailyTarget, setDailyTarget] = useState<number>(DEFAULT_DAILY_STEP_TARGET);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: challenges, isLoading } = useQuery<IndividualChallengeProgress[]>({
    queryKey: ["individual-challenges"],
    queryFn: async () => {
      const res = await fetch("/api/v1/individual-challenges");
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/v1/individual-challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || "Failed to create challenge.");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["individual-challenges"] });
      setShowCreateModal(false);
      setName("");
      setDescription("");
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const finalDuration = isCustomDuration ? Number(customDays) : durationDays;

    if (!name.trim()) {
      setError("Please provide a challenge name.");
      return;
    }

    if (!finalDuration || finalDuration < 1 || finalDuration > 365) {
      setError("Duration must be between 1 and 365 days.");
      return;
    }

    createMutation.mutate({
      name,
      description,
      dailyTarget,
      durationDays: finalDuration,
      startDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Trophy className="h-7 w-7 text-brand-400" />
            Individual Step Challenges
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build personal walking commitments with custom duration. 100% daily achievement required to complete.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Challenge</span>
        </button>
      </div>

      {/* 1,000 Step Milestone Motivational Feature Banner */}
      <div className="p-6 rounded-3xl border border-amber-900/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">The 1,000-Step Milestone Event</h3>
            <p className="text-xs text-slate-400">
              Crossing 1,000 steps triggers celebratory animations and streaks toward your daily target.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold whitespace-nowrap">
          Milestone Active Today
        </div>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges?.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {item.status.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{item.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-brand-400">{item.completionPercentage}%</span>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>

            {item.description && <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>}

            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-center">
              <div>
                <p className="text-base font-bold text-white">{item.dailyTarget.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Daily Goal</p>
              </div>
              <div>
                <p className="text-base font-bold text-white">{item.durationDays} Days</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Duration</p>
              </div>
              <div>
                <p className="text-base font-bold text-emerald-400">{item.targetDaysAchieved} / {item.currentDayNumber}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Days Met</p>
              </div>
            </div>

            {/* Strict Calendar Days Strip */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Challenge Progress Schedule</span>
                <span>Day {item.currentDayNumber} of {item.durationDays}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-2 rounded-full"
                  style={{ width: `${item.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Individual Challenge</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900/60 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Challenge Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 10K Daily Habit Builder"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Daily Step Target
                </label>
                <input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  min={1000}
                  max={100000}
                  step={500}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Duration (Days)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_CHALLENGE_DURATIONS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        setDurationDays(days);
                        setIsCustomDuration(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        !isCustomDuration && durationDays === days
                          ? "bg-brand-500 border-brand-500 text-slate-950"
                          : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomDuration(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isCustomDuration
                        ? "bg-brand-500 border-brand-500 text-slate-950"
                        : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {isCustomDuration && (
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    min={1}
                    max={365}
                    placeholder="Enter custom days (e.g. 18)"
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-brand-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Optional Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Set your intention or personal rules..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm"
                >
                  {createMutation.isPending ? "Creating..." : "Start Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
