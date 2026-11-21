import { z } from "zod";
import {
  DEFAULT_DAILY_STEP_TARGET,
  MIN_DAILY_STEP_TARGET,
  MAX_DAILY_STEP_TARGET,
  MIN_CHALLENGE_DURATION_DAYS,
  MAX_CHALLENGE_DURATION_DAYS,
  HEALTH_SOURCES,
  GROUP_ROLE,
  CHALLENGE_STATUS,
} from "../constants";

// -----------------------------------------------------------------------------
// Authentication Schemas
// -----------------------------------------------------------------------------
export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  timezone: z.string().default("UTC"),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// -----------------------------------------------------------------------------
// User & Profile Schemas
// -----------------------------------------------------------------------------
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  bio: z.string().max(250).optional(),
  stepTargetDefault: z
    .number()
    .int()
    .min(MIN_DAILY_STEP_TARGET)
    .max(MAX_DAILY_STEP_TARGET)
    .optional(),
  heightCm: z.number().positive().max(300).optional(),
  weightKg: z.number().positive().max(500).optional(),
  timezone: z.string().optional(),
  profileImage: z.string().url().optional(),
});

// -----------------------------------------------------------------------------
// Activity Synchronization Schemas
// -----------------------------------------------------------------------------
export const NormalizedStepRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  stepCount: z.number().int().nonnegative("Step count must be non-negative"),
  activeMinutes: z.number().int().nonnegative().optional().default(0),
  distanceMeters: z.number().nonnegative().optional().default(0),
  caloriesBurned: z.number().nonnegative().optional().default(0),
  source: z.enum([
    HEALTH_SOURCES.HEALTH_CONNECT,
    HEALTH_SOURCES.HEALTHKIT,
    HEALTH_SOURCES.MANUAL_DEV,
  ]),
  sourceRecordId: z.string().optional(),
  clientTimestamp: z.string().datetime(),
});

export const SyncActivityBatchSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  platform: z.enum(["android", "ios", "web"]),
  records: z.array(NormalizedStepRecordSchema).min(1, "Must submit at least one record"),
  syncBatchId: z.string().uuid().optional(),
});

// -----------------------------------------------------------------------------
// Individual Challenge Schemas
// -----------------------------------------------------------------------------
export const CreateIndividualChallengeSchema = z.object({
  name: z.string().min(3, "Challenge name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  dailyTarget: z
    .number()
    .int()
    .min(MIN_DAILY_STEP_TARGET)
    .max(MAX_DAILY_STEP_TARGET)
    .default(DEFAULT_DAILY_STEP_TARGET),
  durationDays: z.number().int().min(MIN_CHALLENGE_DURATION_DAYS).max(MAX_CHALLENGE_DURATION_DAYS),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
});

export const UpdateIndividualChallengeSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum([CHALLENGE_STATUS.ACTIVE, CHALLENGE_STATUS.CANCELLED]).optional(),
});

// -----------------------------------------------------------------------------
// Group Challenge Schemas
// -----------------------------------------------------------------------------
export const CreateGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  challengeDurationDays: z
    .number()
    .int()
    .min(MIN_CHALLENGE_DURATION_DAYS)
    .max(MAX_CHALLENGE_DURATION_DAYS)
    .default(30),
  dailyTarget: z
    .number()
    .int()
    .min(MIN_DAILY_STEP_TARGET)
    .max(MAX_DAILY_STEP_TARGET)
    .default(DEFAULT_DAILY_STEP_TARGET),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  rules: z.record(z.unknown()).optional(),
});

export const JoinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(4, "Invitation code is too short")
    .max(12, "Invitation code is too long")
    .transform((val) => val.trim().toUpperCase()),
});

// -----------------------------------------------------------------------------
// Leaderboard Schemas
// -----------------------------------------------------------------------------
export const LeaderboardQuerySchema = z.object({
  groupId: z.string().uuid("Invalid Group ID"),
  type: z.enum(["daily", "overall"]).default("overall"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
