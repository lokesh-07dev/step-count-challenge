# Stepora — REST API Documentation (v1)

Base URL: `http://localhost:8787/api/v1` (Local) / `https://api.stepora.app/api/v1` (Production)

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/auth/sign-up`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123",
    "timezone": "America/New_York"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" },
      "sessionToken": "token_string"
    }
  }
  ```

### 1.2 Sign In User
- **Method**: `POST`
- **Path**: `/auth/sign-in`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123"
  }
  ```

### 1.3 Google OAuth Initiation & Callback
- **Method**: `GET`
- **Path**: `/auth/google` (Redirects to Google OAuth consent screen)
- **Path**: `/auth/callback/google` (Exchanges authorization code and issues session)

### 1.4 Get Current Session / Profile
- **Method**: `GET`
- **Path**: `/auth/session`
- **Headers**: `Authorization: Bearer <session_token>` or cookie session

---

## 2. Activity & Step Synchronization

### 2.1 Batch Step Sync (Idempotent)
- **Method**: `POST`
- **Path**: `/activity/sync`
- **Headers**: `Authorization: Bearer <session_token>`
- **Request Body**:
  ```json
  {
    "deviceId": "pixel-7-device-id",
    "platform": "android",
    "records": [
      {
        "date": "2026-11-22",
        "stepCount": 8420,
        "activeMinutes": 52,
        "distanceMeters": 6415,
        "caloriesBurned": 378,
        "source": "health_connect",
        "sourceRecordId": "hc-step-rec-923847",
        "clientTimestamp": "2026-11-22T17:30:00Z"
      }
    ]
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "batchId": "uuid",
      "acceptedRecords": 1,
      "updatedDailySteps": 8420,
      "milestoneUnlocked": { "milestoneValue": 1000, "isNew": false }
    }
  }
  ```

---

## 3. Individual Challenges

- `POST /individual-challenges`: Create new individual challenge with custom duration and daily target.
- `GET /individual-challenges`: List active and historical challenges for authenticated user.
- `GET /individual-challenges/:id`: Detailed challenge progress, completed days, and missed targets.

---

## 4. Groups & Leaderboards

- `POST /groups`: Create group with name, description, duration, and auto-generated invite code.
- `POST /groups/join`: Join group by entering alphanumeric invite code.
- `GET /groups/:id`: Group details, member list, and active challenge rules.
- `GET /groups/:id/leaderboard/daily?date=YYYY-MM-DD`: Daily rank by eligible steps.
- `GET /groups/:id/leaderboard/overall`: Cumulative challenge rank by eligible steps.

---

## 5. Motivation & Achievements

- `GET /achievements`: List all available and user-unlocked badges.
- `GET /notifications`: List user notifications and mark as read.
