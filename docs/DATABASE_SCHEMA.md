# Stepora — Database Schema & Entity Relationship Design

## 1. Relational Database Overview (Neon PostgreSQL + Drizzle ORM)

Stepora uses a fully normalized, foreign-key-constrained relational model in PostgreSQL.

```
                          ┌──────────────────────────┐
                          │          users           │
                          └────────────┬─────────────┘
                                       │ 1:1
              ┌────────────────────────┼────────────────────────┐
              │ 1:M                    │ 1:1                    │ 1:M
    ┌─────────▼────────┐     ┌─────────▼────────┐     ┌─────────▼────────┐
    │     accounts     │     │  user_profiles   │     │     sessions     │
    │  (Better Auth)   │     │ (bio, goal, etc) │     │  (Better Auth)   │
    └──────────────────┘     └──────────────────┘     └──────────────────┘
              │ 1:M                    │ 1:M                    │ 1:M
    ┌─────────▼────────┐     ┌─────────▼────────┐     ┌─────────▼────────┐
    │     devices      │     │  daily_activity  │     │    sync_logs     │
    │ (mobile/web id)  │     │  (verified steps)│     │ (idempotent log) │
    └─────────┬────────┘     └──────────────────┘     └──────────────────┘
              │ 1:M
    ┌─────────▼────────┐
    │health_permissions│
    └──────────────────┘

    CHALLENGE & GROUP SUBSYSTEM
    ───────────────────────────────────────────────────────────────────────
    [users] ──(1:M)──> [individual_challenges] ──(1:M)──> [individual_participants]
       │
       ├──(1:M)──> [groups] ──(1:M)──> [group_members]
       │             │
       │             └──(1:M)──> [group_challenges]
       │                                  │
       └──(1:M)──> [challenge_daily_scores] <── (Independent participant steps)
       │
       └──(1:M)──> [challenge_results] (Finalized ranks, ties, completions)

    ENGAGEMENT & AUDITING SUBSYSTEM
    ───────────────────────────────────────────────────────────────────────
    [users] ──(1:M)──> [motivation_events] (1,000-step event deduplication)
       ├──(1:M)──> [achievements] (Badges & unlocked dates)
       ├──(1:M)──> [notifications] (In-app, push, and reminders)
       └──(1:M)──> [audit_logs] (Admin events & security actions)
```

## 2. Table Definitions & Constraints

### 2.1 Core Identity
- **`users`**: `id (UUID PK)`, `name (TEXT)`, `email (TEXT UNIQUE)`, `email_verified (BOOL)`, `image (TEXT)`, `role ('user'|'admin')`, `timezone (TEXT)`, `status ('active'|'suspended'|'deactivated')`, `created_at`, `updated_at`.
- **`user_profiles`**: `id (UUID PK)`, `user_id (FK users CASCADE UNIQUE)`, `username (TEXT UNIQUE)`, `bio (TEXT)`, `height_cm (NUMERIC)`, `weight_kg (NUMERIC)`, `step_target_default (INT DEFAULT 10000)`, `connected_health_source (TEXT)`, `health_permission_status (TEXT)`, `privacy_setting (TEXT)`.
- **`accounts`**: `id (TEXT PK)`, `user_id (FK users CASCADE)`, `account_id (TEXT)`, `provider_id (TEXT, e.g. 'google', 'credential')`, `access_token`, `refresh_token`, `password (TEXT, hashed)`.
- **`sessions`**: `id (TEXT PK)`, `user_id (FK users CASCADE)`, `token (TEXT UNIQUE)`, `expires_at (TIMESTAMP)`, `ip_address (TEXT)`, `user_agent (TEXT)`.
- **`verifications`**: `id (TEXT PK)`, `identifier (TEXT)`, `value (TEXT)`, `expires_at (TIMESTAMP)`.

### 2.2 Health & Activity Tracking
- **`devices`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `device_id (TEXT)`, `platform ('android'|'ios'|'web')`, `model (TEXT)`, `os_version (TEXT)`, `app_version (TEXT)`, `last_active_at (TIMESTAMP)`.
- **`health_permissions`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `device_id (FK devices CASCADE)`, `permission_type (TEXT)`, `status ('granted'|'denied'|'revoked')`.
- **`daily_activity`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `date (TEXT YYYY-MM-DD)`, `step_count (INT)`, `active_minutes (INT)`, `distance_meters (NUMERIC)`, `calories_burned (NUMERIC)`, `source ('health_connect'|'healthkit'|'manual_dev')`, `last_synced_at (TIMESTAMP)`. **Unique Index on `(user_id, date)`**.
- **`sync_logs`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `device_id (FK devices)`, `sync_batch_id (UUID)`, `record_count (INT)`, `status ('success'|'failed'|'partial')`, `error_message (TEXT)`, `client_timestamp`, `server_timestamp`.

### 2.3 Individual Challenges
- **`individual_challenges`**: `id (UUID PK)`, `creator_id (FK users CASCADE)`, `name (TEXT)`, `description (TEXT)`, `daily_target (INT)`, `duration_days (INT)`, `start_date (TEXT)`, `end_date (TEXT)`, `status ('pending'|'active'|'completed'|'cancelled')`.
- **`individual_participants`**: `id (UUID PK)`, `challenge_id (FK individual_challenges CASCADE)`, `user_id (FK users CASCADE)`, `total_steps (INT)`, `days_completed (INT)`, `completion_percentage (NUMERIC)`, `status ('active'|'completed'|'failed'|'abandoned')`.

### 2.4 Groups & Leaderboards
- **`groups`**: `id (UUID PK)`, `name (TEXT)`, `description (TEXT)`, `image_url (TEXT)`, `invite_code (TEXT UNIQUE)`, `creator_id (FK users CASCADE)`, `status ('active'|'archived')`.
- **`group_members`**: `id (UUID PK)`, `group_id (FK groups CASCADE)`, `user_id (FK users CASCADE)`, `role ('admin'|'member')`, `status ('active'|'invited'|'banned')`. **Unique Index on `(group_id, user_id)`**.
- **`group_challenges`**: `id (UUID PK)`, `group_id (FK groups CASCADE)`, `name (TEXT)`, `description (TEXT)`, `daily_target (INT)`, `duration_days (INT)`, `start_date (TEXT)`, `end_date (TEXT)`, `rules (JSONB)`, `status ('pending'|'active'|'completed'|'cancelled')`, `winner_user_id (FK users)`, `is_tie (BOOL)`.
- **`challenge_daily_scores`**: `id (UUID PK)`, `challenge_id (UUID)`, `challenge_type ('individual'|'group')`, `user_id (FK users CASCADE)`, `date (TEXT)`, `step_count (INT)`, `target_met (BOOL)`, `eligible_steps (INT)`. **Unique Index on `(challenge_id, challenge_type, user_id, date)`**.
- **`challenge_results`**: `id (UUID PK)`, `challenge_id (UUID)`, `challenge_type ('individual'|'group')`, `user_id (FK users CASCADE)`, `final_rank (INT)`, `total_eligible_steps (INT)`, `target_days_achieved (INT)`, `completion_rate (NUMERIC)`, `result_status ('winner'|'runner_up'|'completed'|'tied'|'failed')`.

### 2.5 Engagement & Platform Administration
- **`motivation_events`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `event_type ('milestone_1000'|'streak_3'|'halfway')`, `milestone_value (INT)`, `triggered_date (TEXT)`, `acknowledged (BOOL)`. **Unique Index on `(user_id, event_type, triggered_date, milestone_value)`**.
- **`achievements`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `code (TEXT)`, `title (TEXT)`, `description (TEXT)`, `icon_name (TEXT)`, `unlocked_at (TIMESTAMP)`. **Unique Index on `(user_id, code)`**.
- **`notifications`**: `id (UUID PK)`, `user_id (FK users CASCADE)`, `type (TEXT)`, `title (TEXT)`, `body (TEXT)`, `data (JSONB)`, `read (BOOL)`.
- **`audit_logs`**: `id (UUID PK)`, `actor_id (FK users SET NULL)`, `action (TEXT)`, `target_type (TEXT)`, `target_id (TEXT)`, `details (JSONB)`, `ip_address (TEXT)`, `created_at (TIMESTAMP)`.
