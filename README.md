# Stepora — Step Count Challenge Platform

> **Stepora** is a production-grade cross-platform fitness application engineered for Android, iOS, and responsive web. It synchronizes real physical walking steps from **Android Health Connect** and **Apple HealthKit**, empowering users to create custom-duration individual challenges, join private friend groups via secure invitation codes, and compete on live server-calculated leaderboards.

---

## 1. Monorepo Architecture

Stepora organizes frontend, backend, and shared code into distinct, decoupled workspaces:

```text
STEP COUNT CHALLENGE/
│
├── frontend/                     # Client Applications
│   ├── mobile/                   # React Native & Expo (Android & iOS)
│   │   ├── app/                  # Expo Router filesystem navigation
│   │   ├── components/           # Reusable UI widgets & progress rings
│   │   ├── services/             # Health Connect & HealthKit integrations
│   │   └── stores/               # Zustand client state management
│   │
│   └── web/                      # React, Vite, and Tailwind CSS Responsive Web Portal
│       ├── src/components/       # Design system components
│       ├── src/pages/            # Landing page, dashboard, challenge views
│       └── src/services/         # API integration client
│
├── backend/                      # Serverless REST API
│   ├── src/db/                   # Drizzle ORM schemas & Neon PostgreSQL client
│   │   └── schema/               # 19 normalized database tables
│   ├── src/routes/               # Hono route handlers (health, auth, activity, etc.)
│   ├── src/middleware/           # CORS, logging, and centralized error handling
│   ├── wrangler.toml             # Cloudflare Workers configuration
│   └── drizzle.config.ts         # Database migration configuration
│
├── shared/                       # Shared TypeScript Foundation (@stepora/shared)
│   ├── src/constants/            # Presets, milestones (1,000 steps), health sources
│   ├── src/schemas/              # Zod validation schemas
│   ├── src/types/                # Shared TypeScript contracts and domain models
│   └── src/utils/                # Step, distance, calorie & date utilities
│
├── docs/                         # Technical architecture and design docs
│   └── ARCHITECTURE.md
│
├── .env.example                  # Environment configuration template
├── package.json                  # Root npm workspace orchestrator
├── tsconfig.base.json            # Base strict TypeScript configuration
└── README.md
```

---

## 2. Technology Stack

| Layer           | Technologies                                                                     |
| :-------------- | :------------------------------------------------------------------------------- |
| **Mobile App**  | React Native, Expo SDK 52, TypeScript, Expo Router, Zustand, TanStack Query, Zod |
| **Web Portal**  | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Router           |
| **Backend API** | Hono v4, Cloudflare Workers runtime, TypeScript, Zod                             |
| **Database**    | Neon PostgreSQL (Serverless pooling), Drizzle ORM                                |
| **Storage**     | Cloudflare R2 for user avatars and media                                         |
| **Health**      | Android Health Connect, Apple HealthKit                                          |

---

## 3. Getting Started & Installation

### Prerequisites

- **Node.js**: `v20.x` or `v22.x+` (verified on Node `v24.18.0`)
- **Package Manager**: `npm` (v10+ or v11+)
- **Git**

### Installation

Clone or open the project folder in your terminal, then install all workspace dependencies from the root:

```bash
# Install all dependencies across frontend, backend, and shared workspaces
npm install
```

---

## 4. Running the Development Environments

Stepora allows you to run each component independently or simultaneously:

### A. Run Backend API Server (Cloudflare Worker / Local Node)

```bash
# Starts the Hono API server locally on http://localhost:8787
npm run dev:backend

# Or run via Cloudflare Wrangler simulator
cd backend && npm run dev:wrangler
```

- **Health check endpoint**: [http://localhost:8787/health](http://localhost:8787/health)
- **API v1 base**: `http://localhost:8787/api/v1`

### B. Run Responsive Web Portal (Vite + React)

```bash
# Starts the Vite web application on http://localhost:5173
npm run dev:web
```

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Automatically proxies `/health` and `/api` to the backend running on port `8787`.

### C. Run Mobile Application (Expo / React Native)

```bash
# Starts the Expo development server on http://localhost:8081
npm run dev:mobile

# Launch on Android Emulator
npm --workspace=@stepora/mobile run android

# Launch on iOS Simulator (macOS only)
npm --workspace=@stepora/mobile run ios

# Launch in Web browser mode for quick UI preview
npm --workspace=@stepora/mobile run web
```

---

## 5. Environment Variables Configuration

Copy `.env.example` to `.env` in the root and in the respective workspaces:

```bash
cp .env.example .env
```

Key environment variables:

- `DATABASE_URL`: Connection string for Neon PostgreSQL database.
- `BETTER_AUTH_SECRET`: Minimum 32-character secret for Better Auth sessions.
- `BETTER_AUTH_URL`: Backend origin (`http://localhost:8787`).
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: Cloudflare R2 bucket credentials.
- `VITE_API_URL`: Backend address for web client (`http://localhost:8787`).
- `EXPO_PUBLIC_API_URL`: Backend address for mobile client (`http://10.0.2.2:8787` for Android emulator).

---

## 6. Database Migrations (Neon PostgreSQL & Drizzle ORM)

```bash
# Generate SQL migration files from Drizzle schema
npm --workspace=@stepora/backend run db:generate

# Apply pending migrations to Neon PostgreSQL database
npm --workspace=@stepora/backend run db:migrate

# Launch visual Drizzle Studio to inspect database records
npm --workspace=@stepora/backend run db:studio
```

---

## 7. Quality Checks

```bash
# Run TypeScript typechecks across all workspaces
npm run typecheck

# Run ESLint across all workspaces
npm run lint

# Check formatting
npm run format:check
```

---

## 8. Development Roadmap

- [x] **Phase 1: Foundation & Architecture** (Monorepo, Scaffolds, Shared Package, Health API, Web Landing, Mobile Entry)
- [ ] **Phase 2: Database & Authentication** (Better Auth, Sessions, Neon Postgres Migrations, Profiles)
- [ ] **Phase 3: UI Design System & Dashboard Layouts** (Design Tokens, Theme, Responsive Views)
- [ ] **Phase 4: Automatic Step Tracking Engine** (Health Connect, HealthKit, Idempotent Sync)
- [ ] **Phase 5: Individual Challenge System** (Custom Durations, Daily Target Calculations)
- [ ] **Phase 6: Group Challenge System** (Cryptographic Invite Codes, Membership, Independent Scoring)
- [ ] **Phase 7: Live Leaderboards** (Daily & Overall Rankings, Tie Resolution)
- [ ] **Phase 8: Motivation Engine** (1,000-Step Celebrations, Badges, Notification Pipeline)
- [ ] **Phase 9: Verification, Security Hardening & Production Deployment**
