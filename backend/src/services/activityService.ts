import type { NormalizedStepRecord, DailyActivitySummary } from "@stepora/shared";
import {
  calculateDistanceMeters,
  calculateCaloriesBurned,
  formatDateString,
  MOTIVATION_MILESTONES,
} from "@stepora/shared";

interface UserActivityState {
  daily: Map<string, DailyActivitySummary>; // Key: YYYY-MM-DD
  processedSourceRecordIds: Set<string>;
  triggeredMilestones: Set<string>; // Key: YYYY-MM-DD:milestone
}

const userActivities = new Map<string, UserActivityState>();

function getUserState(userId: string): UserActivityState {
  let state = userActivities.get(userId);
  if (!state) {
    state = {
      daily: new Map<string, DailyActivitySummary>(),
      processedSourceRecordIds: new Set<string>(),
      triggeredMilestones: new Set<string>(),
    };
    userActivities.set(userId, state);
  }
  return state;
}

export class ActivityService {
  /**
   * Process a batch of step records for a user idempotently
   */
  static processSyncBatch(
    userId: string,
    records: NormalizedStepRecord[]
  ): {
    acceptedCount: number;
    duplicateCount: number;
    milestoneUnlocked: { milestone: number; message: string } | null;
    todaySummary: DailyActivitySummary;
  } {
    const state = getUserState(userId);
    let accepted = 0;
    let duplicates = 0;
    let unlockedMilestone: { milestone: number; message: string } | null = null;
    const todayStr = formatDateString(new Date());

    for (const record of records) {
      if (record.sourceRecordId && state.processedSourceRecordIds.has(record.sourceRecordId)) {
        duplicates++;
        continue;
      }

      if (record.sourceRecordId) {
        state.processedSourceRecordIds.add(record.sourceRecordId);
      }

      const existing = state.daily.get(record.date);
      const newStepCount = (existing ? existing.stepCount : 0) + record.stepCount;
      const target = 10000;
      const distance = calculateDistanceMeters(newStepCount);
      const calories = calculateCaloriesBurned(newStepCount);
      const activeMins = (existing ? existing.activeMinutes : 0) + (record.activeMinutes || 0);

      const summary: DailyActivitySummary = {
        date: record.date,
        stepCount: newStepCount,
        target,
        targetMet: newStepCount >= target,
        distanceMeters: distance,
        caloriesBurned: calories,
        activeMinutes: activeMins,
        source: record.source,
        lastSyncedAt: new Date().toISOString(),
      };

      state.daily.set(record.date, summary);
      accepted++;

      // Check 1,000 Step Motivational Event
      const milestoneKey = `${record.date}:${MOTIVATION_MILESTONES.FIRST_MILESTONE}`;
      if (
        newStepCount >= MOTIVATION_MILESTONES.FIRST_MILESTONE &&
        !state.triggeredMilestones.has(milestoneKey)
      ) {
        state.triggeredMilestones.add(milestoneKey);
        unlockedMilestone = {
          milestone: MOTIVATION_MILESTONES.FIRST_MILESTONE,
          message: `Congratulations! You unlocked the 1,000 steps milestone for ${record.date}! Keep up the momentum!`,
        };
      }
    }

    const todaySummary =
      state.daily.get(todayStr) || {
        date: todayStr,
        stepCount: 0,
        target: 10000,
        targetMet: false,
        distanceMeters: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
        source: "manual_dev",
        lastSyncedAt: new Date().toISOString(),
      };

    return {
      acceptedCount: accepted,
      duplicateCount: duplicates,
      milestoneUnlocked: unlockedMilestone,
      todaySummary,
    };
  }

  /**
   * Get daily activity summary for a specific date
   */
  static getDailySummary(userId: string, dateStr: string): DailyActivitySummary {
    const state = getUserState(userId);
    return (
      state.daily.get(dateStr) || {
        date: dateStr,
        stepCount: 0,
        target: 10000,
        targetMet: false,
        distanceMeters: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
        source: "manual_dev",
        lastSyncedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Get activity history for the last N days
   */
  static getActivityHistory(userId: string, days = 7): DailyActivitySummary[] {
    const state = getUserState(userId);
    const results: DailyActivitySummary[] = [];

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDateString(d);
      results.push(this.getDailySummary(userId, dateStr));
    }

    return results;
  }
}
