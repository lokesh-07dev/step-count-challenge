# Stepora — System Architecture & Design Decisions

## 1. Architectural Philosophy

Stepora is engineered as a zero-trust, verified cross-platform fitness platform. Rather than trusting client-reported scores or allowing manual entry of step counts, the application enforces the following core architectural rules:

1. **Hardware-Verified Origin**: All step counts originate from authorized native OS health stores (Android Health Connect or Apple HealthKit).
2. **Normalized Sync Engine**: The mobile app normalizes raw health records with source record IDs and timestamps before submitting them to the backend API.
3. **Server-Calculated Leaderboards**: Leaderboard ranks and challenge progress are computed exclusively on the server using SQL aggregation. Clients cannot tamper with rankings.
4. **Independent Group Scoring**: In group challenges, every participant's steps are tracked individually. Group steps are never pooled into a single number. The individual with the highest eligible steps wins.

---

## 2. Relational Database Architecture (19 Normalized Tables)

```
[ users ] <── [ user_profiles ]
    │     <── [ accounts ] (Better Auth)
    │     <── [ sessions ] (Better Auth)
    │     <── [ devices ] <── [ health_permissions ]
    │     <── [ daily_activity ] (Unique: userId + date)
    │     <── [ sync_logs ]
    │
    ├── [ individual_challenges ] <── [ individual_participants ]
    │
    ├── [ groups ] <── [ group_members ]
    │     │
    │     └── [ group_challenges ]
    │
    ├── [ challenge_daily_scores ] (Unique: challengeId + challengeType + userId + date)
    ├── [ challenge_results ]
    ├── [ motivation_events ] (e.g. 1,000-step milestone deduplication)
    ├── [ achievements ]
    └── [ notifications ]
```

---

## 3. Idempotent Synchronization Pipeline

```text
[ Health Connect / HealthKit ]
             │
      (Read records)
             ▼
[ Mobile Normalizer ]  ──> [ Sync Payload with Device ID & Source Record IDs ]
                                            │
                                    (HTTPS POST /api/v1/activity/sync)
                                            ▼
                               [ Hono Worker API ]
                                            │
                           1. Validate user session (Better Auth)
                           2. Validate timestamps & payload (Zod)
                           3. Deduplicate against sourceRecordId
                           4. Upsert into daily_activity table
                           5. Recalculate active challenge daily scores
                           6. Trigger motivation milestone event (e.g. 1000 steps)
                           7. Return SyncBatchResult
```

---

## 4. Security & Privacy Safeguards

- **No Plaintext Passwords**: Better Auth handles secure bcrypt/argon2 hashing and session token verification.
- **Strict Role-Based Access Control**: Platform administration routes require verified `admin` role.
- **Rate Limiting & CORS**: Restricted to authorized mobile and web client origins.
- **Data Minimization**: Stepora only requests and stores walking steps, active minutes, and estimated distance/calories. No unnecessary medical history or telemetry is collected.
