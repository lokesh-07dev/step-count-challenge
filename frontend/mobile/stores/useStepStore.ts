import { create } from "zustand";
import { DEFAULT_DAILY_STEP_TARGET } from "@stepora/shared";

interface StepStoreState {
  todaySteps: number;
  dailyTarget: number;
  connectedSource: "health_connect" | "healthkit" | "manual_dev" | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  milestone1000Acknowledged: boolean;

  setSteps: (steps: number) => void;
  setTarget: (target: number) => void;
  setSource: (source: "health_connect" | "healthkit" | "manual_dev") => void;
  setSyncStatus: (isSyncing: boolean, lastSyncedAt?: string) => void;
  acknowledgeMilestone1000: () => void;
}

export const useStepStore = create<StepStoreState>((set) => ({
  todaySteps: 3450,
  dailyTarget: DEFAULT_DAILY_STEP_TARGET,
  connectedSource: null,
  lastSyncedAt: null,
  isSyncing: false,
  milestone1000Acknowledged: true,

  setSteps: (steps) => set({ todaySteps: steps }),
  setTarget: (target) => set({ dailyTarget: target }),
  setSource: (source) => set({ connectedSource: source }),
  setSyncStatus: (isSyncing, lastSyncedAt) =>
    set((state) => ({
      isSyncing,
      lastSyncedAt: lastSyncedAt ?? state.lastSyncedAt,
    })),
  acknowledgeMilestone1000: () => set({ milestone1000Acknowledged: true }),
}));
