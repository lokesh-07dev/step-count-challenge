# Stepora — Deployment Guide

## 1. Backend Deployment (Cloudflare Workers)

Stepora is architected to deploy seamlessly onto **Cloudflare Workers**.

1. Authenticate with Wrangler:
   ```bash
   npx wrangler login
   ```
2. Set Production Secrets:
   ```bash
   cd backend
   npx wrangler secret put DATABASE_URL
   npx wrangler secret put BETTER_AUTH_SECRET
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   ```
3. Deploy Worker:
   ```bash
   npm --workspace=@stepora/backend run deploy
   ```

---

## 2. Database Migration Deployment (Neon PostgreSQL)

1. Verify `DATABASE_URL` in your environment.
2. Generate migration bundle:
   ```bash
   npm --workspace=@stepora/backend run db:generate
   ```
3. Run migrations against production database:
   ```bash
   npm --workspace=@stepora/backend run db:migrate
   ```

---

## 3. Web Deployment (Vercel, Cloudflare Pages, or Netlify)

1. Build static output:
   ```bash
   npm --workspace=@stepora/web run build
   ```
2. Configure build settings:
   - Build command: `npm --workspace=@stepora/web run build`
   - Output directory: `frontend/web/dist`
   - Environment variables: `VITE_API_URL=https://api.stepora.app`

---

## 4. Mobile Production Builds (EAS / Expo)

1. Install EAS CLI: `npm install -g eas-cli`
2. Configure EAS project: `eas init`
3. Build Android APK/AAB: `eas build --platform android --profile production`
4. Build iOS IPA: `eas build --platform ios --profile production`
