# Stepora — Setup & Environment Configuration Guide

## 1. Prerequisites
- **Node.js**: v20+ or v22+ (tested on Node v24.18.0)
- **Package Manager**: npm 10+
- **Git**

## 2. Environment Variables (.env)

Copy `.env.example` to `.env` in the root:

```ini
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/stepora?sslmode=require"

# Better Auth Secret (32+ chars random string)
BETTER_AUTH_SECRET="generate_a_random_32_character_secret_here"
BETTER_AUTH_URL="http://localhost:8787"

# Google (Gmail) OAuth Credentials
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Backend API
PORT=8787
ENVIRONMENT="development"
CORS_ORIGIN="http://localhost:5173,http://localhost:8081,exp://localhost:8081"

# Web Client
VITE_API_URL="http://localhost:8787"
VITE_APP_NAME="Stepora"

# Mobile Client
EXPO_PUBLIC_API_URL="http://10.0.2.2:8787"
EXPO_PUBLIC_APP_NAME="Stepora"
```

## 3. How to obtain Google OAuth Credentials for Gmail Sign-In
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **Stepora Fitness**.
3. Under **APIs & Services > OAuth consent screen**, select **External** and provide App name and support email.
4. Under **Credentials > Create Credentials > OAuth client ID**:
   - Application type: **Web application**.
   - Authorized JavaScript origins: `http://localhost:5173`, `http://localhost:8787`.
   - Authorized redirect URIs: `http://localhost:8787/api/auth/callback/google`, `http://localhost:5173/auth/callback`.
5. Copy the Client ID and Client Secret into your `.env` file.

## 4. Local Development Commands

```bash
# Install workspace dependencies
npm install

# Run backend API server
npm run dev:backend

# Run frontend web portal
npm run dev:web

# Run mobile Expo application
npm run dev:mobile
```
