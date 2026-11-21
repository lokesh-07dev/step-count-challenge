/**
 * Stepora Shared Constants
 */

export const APP_NAME = "Stepora" as const;
export const APP_TAGLINE = "Every step matters. Walk together, achieve more." as const;

export const DEFAULT_DAILY_STEP_TARGET = 10000;
export const MIN_DAILY_STEP_TARGET = 1000;
export const MAX_DAILY_STEP_TARGET = 100000;

export const PRESET_CHALLENGE_DURATIONS = [7, 8, 9, 10, 14, 15, 21, 30, 45, 60] as const;
export const MIN_CHALLENGE_DURATION_DAYS = 1;
export const MAX_CHALLENGE_DURATION_DAYS = 365;

export const MOTIVATION_MILESTONES = {
  FIRST_MILESTONE: 1000,
  MID_DAY: 5000,
  TARGET_REACHED: 10000,
  POWER_WALKER: 15000,
  ULTRA_STEPPER: 20000,
} as const;

export const HEALTH_SOURCES = {
  HEALTH_CONNECT: "health_connect",
  HEALTHKIT: "healthkit",
  MANUAL_DEV: "manual_dev",
} as const;

export const HEALTH_PERMISSION_STATUS = {
  NOT_DETERMINED: "not_determined",
  GRANTED: "granted",
  DENIED: "denied",
  REVOKED: "revoked",
} as const;

export const CHALLENGE_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const GROUP_ROLE = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export const SYNC_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
  PARTIAL: "partial",
} as const;

export const NOTIFICATION_TYPES = {
  DAILY_REMINDER: "daily_reminder",
  TARGET_ACHIEVED: "target_achieved",
  GROUP_INVITE: "group_invite",
  NEW_MEMBER: "new_member",
  LEADERBOARD_UPDATE: "leaderboard_update",
  CHALLENGE_ENDING_SOON: "challenge_ending_soon",
  CHALLENGE_COMPLETED: "challenge_completed",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  MOTIVATION_MILESTONE: "motivation_milestone",
} as const;
