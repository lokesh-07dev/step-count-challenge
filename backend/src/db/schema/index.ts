import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------------------
// 1. users
// -----------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: text("role", { enum: ["user", "admin"] })
      .default("user")
      .notNull(),
    timezone: text("timezone").default("UTC").notNull(),
    status: text("status", { enum: ["active", "suspended", "deactivated"] })
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

// -----------------------------------------------------------------------------
// 2. user_profiles
// -----------------------------------------------------------------------------
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    username: text("username").unique(),
    bio: text("bio"),
    heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    stepTargetDefault: integer("step_target_default").default(10000).notNull(),
    connectedHealthSource: text("connected_health_source", {
      enum: ["health_connect", "healthkit", "manual_dev"],
    }),
    healthPermissionStatus: text("health_permission_status", {
      enum: ["not_determined", "granted", "denied", "revoked"],
    })
      .default("not_determined")
      .notNull(),
    privacySetting: text("privacy_setting", { enum: ["public", "friends", "private"] })
      .default("public")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("user_profiles_username_idx").on(table.username)]
);

// -----------------------------------------------------------------------------
// 3. sessions (Better Auth standard)
// -----------------------------------------------------------------------------
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 4. accounts (Better Auth standard)
// -----------------------------------------------------------------------------
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 5. verifications (Better Auth email tokens)
// -----------------------------------------------------------------------------
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 6. devices
// -----------------------------------------------------------------------------
export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deviceId: text("device_id").notNull(),
  platform: text("platform", { enum: ["android", "ios", "web"] }).notNull(),
  model: text("model"),
  osVersion: text("os_version"),
  appVersion: text("app_version"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 7. health_permissions
// -----------------------------------------------------------------------------
export const healthPermissions = pgTable("health_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deviceId: uuid("device_id").references(() => devices.id, { onDelete: "cascade" }),
  permissionType: text("permission_type").notNull(), // e.g. "read_steps"
  status: text("status", { enum: ["granted", "denied", "revoked"] }).notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 8. daily_activity
// -----------------------------------------------------------------------------
export const dailyActivity = pgTable(
  "daily_activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    stepCount: integer("step_count").default(0).notNull(),
    activeMinutes: integer("active_minutes").default(0).notNull(),
    distanceMeters: numeric("distance_meters", { precision: 10, scale: 2 }).default("0").notNull(),
    caloriesBurned: numeric("calories_burned", { precision: 8, scale: 2 }).default("0").notNull(),
    source: text("source", {
      enum: ["health_connect", "healthkit", "manual_dev"],
    }).notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("daily_activity_user_date_idx").on(table.userId, table.date),
    index("daily_activity_date_idx").on(table.date),
  ]
);

// -----------------------------------------------------------------------------
// 9. sync_logs
// -----------------------------------------------------------------------------
export const syncLogs = pgTable("sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deviceId: uuid("device_id").references(() => devices.id, { onDelete: "set null" }),
  syncBatchId: uuid("sync_batch_id").notNull(),
  recordCount: integer("record_count").notNull(),
  status: text("status", { enum: ["success", "failed", "partial"] }).notNull(),
  errorMessage: text("error_message"),
  clientTimestamp: timestamp("client_timestamp", { withTimezone: true }).notNull(),
  serverTimestamp: timestamp("server_timestamp", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 10. individual_challenges
// -----------------------------------------------------------------------------
export const individualChallenges = pgTable("individual_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dailyTarget: integer("daily_target").notNull(),
  durationDays: integer("duration_days").notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(), // YYYY-MM-DD
  status: text("status", { enum: ["pending", "active", "completed", "cancelled"] })
    .default("active")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 11. individual_participants
// -----------------------------------------------------------------------------
export const individualParticipants = pgTable("individual_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id")
    .references(() => individualChallenges.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  totalSteps: integer("total_steps").default(0).notNull(),
  daysCompleted: integer("days_completed").default(0).notNull(),
  completionPercentage: numeric("completion_percentage", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  status: text("status", { enum: ["active", "completed", "abandoned"] })
    .default("active")
    .notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 12. groups
// -----------------------------------------------------------------------------
export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    inviteCode: text("invite_code").notNull().unique(),
    creatorId: uuid("creator_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status", { enum: ["active", "archived"] })
      .default("active")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("groups_invite_code_idx").on(table.inviteCode)]
);

// -----------------------------------------------------------------------------
// 13. group_members
// -----------------------------------------------------------------------------
export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .references(() => groups.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role", { enum: ["admin", "member"] })
      .default("member")
      .notNull(),
    status: text("status", { enum: ["active", "invited", "banned"] })
      .default("active")
      .notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("group_members_unique_idx").on(table.groupId, table.userId)]
);

// -----------------------------------------------------------------------------
// 14. group_challenges
// -----------------------------------------------------------------------------
export const groupChallenges = pgTable("group_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .references(() => groups.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  dailyTarget: integer("daily_target").notNull(),
  durationDays: integer("duration_days").notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD
  endDate: text("end_date").notNull(), // YYYY-MM-DD
  rules: jsonb("rules").default({}),
  status: text("status", { enum: ["pending", "active", "completed", "cancelled"] })
    .default("active")
    .notNull(),
  winnerUserId: uuid("winner_user_id").references(() => users.id, { onDelete: "set null" }),
  isTie: boolean("is_tie").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 15. challenge_daily_scores
// -----------------------------------------------------------------------------
export const challengeDailyScores = pgTable(
  "challenge_daily_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id").notNull(),
    challengeType: text("challenge_type", { enum: ["individual", "group"] }).notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: text("date").notNull(),
    stepCount: integer("step_count").default(0).notNull(),
    targetMet: boolean("target_met").default(false).notNull(),
    eligibleSteps: integer("eligible_steps").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("challenge_daily_scores_unique_idx").on(
      table.challengeId,
      table.challengeType,
      table.userId,
      table.date
    ),
  ]
);

// -----------------------------------------------------------------------------
// 16. motivation_events
// -----------------------------------------------------------------------------
export const motivationEvents = pgTable(
  "motivation_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    eventType: text("event_type").notNull(), // e.g. "milestone_1000"
    milestoneValue: integer("milestone_value").notNull(),
    triggeredDate: text("triggered_date").notNull(), // YYYY-MM-DD
    acknowledged: boolean("acknowledged").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("motivation_events_unique_idx").on(
      table.userId,
      table.eventType,
      table.triggeredDate,
      table.milestoneValue
    ),
  ]
);

// -----------------------------------------------------------------------------
// 17. achievements
// -----------------------------------------------------------------------------
export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    iconName: text("icon_name").notNull(),
    metadata: jsonb("metadata").default({}),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("achievements_user_code_idx").on(table.userId, table.code)]
);

// -----------------------------------------------------------------------------
// 18. notifications
// -----------------------------------------------------------------------------
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data").default({}),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// 19. challenge_results
// -----------------------------------------------------------------------------
export const challengeResults = pgTable("challenge_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  challengeId: uuid("challenge_id").notNull(),
  challengeType: text("challenge_type", { enum: ["individual", "group"] }).notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  finalRank: integer("final_rank"),
  totalEligibleSteps: integer("total_eligible_steps").notNull(),
  targetDaysAchieved: integer("target_days_achieved").notNull(),
  completionRate: numeric("completion_rate", { precision: 5, scale: 2 }).notNull(),
  resultStatus: text("result_status", {
    enum: ["winner", "runner_up", "completed", "tied", "did_not_finish"],
  }).notNull(),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }).defaultNow().notNull(),
});
