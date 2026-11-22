import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Key, Trophy, Medal, Crown, Calendar, Sparkles } from "lucide-react";
import type { GroupSummary, LeaderboardEntry } from "@stepora/shared";
import { DEFAULT_DAILY_STEP_TARGET } from "@stepora/shared";

export const GroupsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("00000000-0000-0000-0000-000000000001");
  const [leaderboardType, setLeaderboardType] = useState<"daily" | "overall">("overall");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Forms
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupDays, setNewGroupDays] = useState(30);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch groups
  const { data: groups } = useQuery<GroupSummary[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("/api/v1/groups");
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  // Fetch leaderboard for selected group
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["group-leaderboard", selectedGroupId, leaderboardType],
    queryFn: async () => {
      const res = await fetch(`/api/v1/groups/${selectedGroupId}/leaderboard?type=${leaderboardType}`);
      const json = await res.json();
      return json.success ? json.data : [];
    },
    refetchInterval: 15000,
  });

  // Create Group Mutation
  const createGroupMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/v1/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to create group.");
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      setActionMessage(`Group created! Invite Code: ${data.inviteCode}`);
    },
    onError: (err: any) => setActionError(err.message),
  });

  // Join Group Mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/v1/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to join group.");
      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowJoinModal(false);
      setInviteCodeInput("");
      setActionMessage(data.message);
    },
    onError: (err: any) => setActionError(err.message),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 text-teal-400" />
            Group Challenges & Leaderboards
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compete with friends or community. Each participant scores independently from authorized health devices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActionError(null);
              setShowJoinModal(true);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 text-white font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Key className="h-4 w-4 text-teal-400" />
            <span>Join with Code</span>
          </button>
          <button
            onClick={() => {
              setActionError(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-sm flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Main Grid: Groups & Active Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Joined Groups */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Your Step Groups
          </h2>
          <div className="space-y-3">
            {groups?.map((group) => {
              const isSelected = selectedGroupId === group.id;
              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-teal-500 bg-teal-950/20 shadow-md"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">{group.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-teal-400">
                      {group.inviteCode}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{group.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <span>{group.memberCount} Members</span>
                    <span>Goal: {group.activeChallenge?.dailyTarget.toLocaleString() || "10,000"} steps</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Server-Calculated Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Live Verified Leaderboard
            </h2>
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setLeaderboardType("overall")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  leaderboardType === "overall" ? "bg-teal-500 text-slate-950" : "text-slate-400"
                }`}
              >
                Overall Challenge
              </button>
              <button
                onClick={() => setLeaderboardType("daily")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  leaderboardType === "daily" ? "bg-teal-500 text-slate-950" : "text-slate-400"
                }`}
              >
                Today Only
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Rank & Participant</span>
              <span>Eligible Steps</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {leaderboard?.map((entry) => {
                const isTop1 = entry.rank === 1;
                const isTop2 = entry.rank === 2;
                const isTop3 = entry.rank === 3;

                return (
                  <div
                    key={entry.userId}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      entry.isCurrentUser ? "bg-brand-500/10" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 flex items-center justify-center font-black text-sm">
                        {isTop1 ? (
                          <Crown className="h-5 w-5 text-amber-400" />
                        ) : isTop2 ? (
                          <Medal className="h-5 w-5 text-slate-300" />
                        ) : isTop3 ? (
                          <Medal className="h-5 w-5 text-amber-600" />
                        ) : (
                          <span className="text-slate-500">#{entry.rank}</span>
                        )}
                      </div>

                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden">
                        {entry.image ? (
                          <img src={entry.image} alt={entry.name} className="h-full w-full object-cover" />
                        ) : (
                          entry.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{entry.name}</span>
                          {entry.isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {leaderboardType === "overall" ? `${entry.targetDaysMet || 18} days met` : "Today"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-white tracking-tight">
                        {entry.stepTotal.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 block">steps</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">Join Group by Invite Code</h2>
            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900 text-xs text-rose-300">
                {actionError}
              </div>
            )}
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. STP-9482"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center tracking-widest text-lg outline-none focus:border-teal-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => joinGroupMutation.mutate(inviteCodeInput)}
                disabled={joinGroupMutation.isPending || !inviteCodeInput.trim()}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-sm"
              >
                {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">Create New Group</h2>
            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-900 text-xs text-rose-300">
                {actionError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Weekend Warriors"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  createGroupMutation.mutate({
                    name: newGroupName,
                    description: newGroupDesc,
                    challengeDurationDays: newGroupDays,
                    dailyTarget: DEFAULT_DAILY_STEP_TARGET,
                    startDate: new Date().toISOString().slice(0, 10),
                  })
                }
                disabled={createGroupMutation.isPending || !newGroupName.trim()}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
