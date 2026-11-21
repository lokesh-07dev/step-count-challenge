import type { z } from "zod";
import type {
  SignUpSchema,
  SignInSchema,
  UpdateProfileSchema,
  NormalizedStepRecordSchema,
  SyncActivityBatchSchema,
  CreateIndividualChallengeSchema,
  CreateGroupSchema,
  JoinGroupSchema,
  LeaderboardQuerySchema,
} from "../schemas";
import type {
  HEALTH_SOURCES,
  CHALLENGE_STATUS,
  GROUP_ROLE,
  SYNC_STATUS,
  NOTIFICATION_TYPES,
} from "../constants";

// Inferred Types
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type NormalizedStepRecord = z.infer<typeof NormalizedStepRecordSchema>;
export type SyncActivityBatchInput = z.infer<typeof SyncActivityBatchSchema>;
export type CreateIndividualChallengeInput = z.infer<typeof CreateIndividualChallengeSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type JoinGroupInput = z.infer<typeof JoinGroupSchema>;
export type LeaderboardQueryParams = z.infer<typeof LeaderboardQuerySchema>;

// Domain Types
export type HealthSource = (typeof HEALTH_SOURCES)[keyof typeof HEALTH_SOURCES];
export type ChallengeStatus = (typeof CHALLENGE_STATUS)[keyof typeof CHALLENGE_STATUS];
export type GroupRole = (typeof GROUP_ROLE)[keyof typeof GROUP_ROLE];
export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  image?: string | null;
  timezone: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface UserProfileDetails extends UserSummary {
  bio?: string | null;
  stepTargetDefault: number;
  heightCm?: number | null;
  weightKg?: number | null;
  connectedHealthSource?: HealthSource | null;
  healthPermissionStatus: string;
  totalHistoricalSteps: number;
  completedChallengesCount: number;
}

export interface DailyActivitySummary {
  date: string;
  stepCount: number;
  target: number;
  targetMet: boolean;
  distanceMeters: number;
  caloriesBurned: number;
  activeMinutes: number;
  source: HealthSource;
  lastSyncedAt: string;
}

export interface IndividualChallengeProgress {
  id: string;
  name: string;
  description?: string | null;
  dailyTarget: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  totalSteps: number;
  targetDaysAchieved: number;
  currentDayNumber: number;
  completionPercentage: number;
  todayAchieved: boolean;
  todaySteps: number;
}

export interface GroupSummary {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  inviteCode: string;
  creatorId: string;
  memberCount: number;
  userRole?: GroupRole;
  activeChallenge?: {
    id: string;
    name: string;
    dailyTarget: number;
    durationDays: number;
    startDate: string;
    endDate: string;
    status: ChallengeStatus;
  } | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username?: string | null;
  image?: string | null;
  stepTotal: number;
  targetDaysMet?: number;
  lastSyncAt?: string | null;
  isCurrentUser: boolean;
}

export interface MotivationEventNotice {
  id: string;
  milestoneValue: number;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AchievementBadge {
  id: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
