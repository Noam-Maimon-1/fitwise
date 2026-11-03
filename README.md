# FitWise — Adaptive Bio-Coach

A full-stack fitness and nutrition coaching web application. Users register, receive AI-generated workout and meal plans tailored to their goals, log workouts, track meals, submit weekly check-ins, and monitor progress over time. Admins manage users, exercises, and food items through a dedicated panel.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [ORM Setup (Prisma)](#orm-setup-prisma)
- [Running the Project](#running-the-project)
- [Authentication Model](#authentication-model)
- [Demo Accounts](#demo-accounts)
- [API Endpoints](#api-endpoints)
- [WebSocket Feature](#websocket-feature)
- [AI Features](#ai-features)
- [Known Limitations](#known-limitations)

---

## Project Purpose

FitWise is a personalized fitness coach web app. On registration, the system uses the Gemini AI API to generate a complete, calorie-targeted workout plan and meal plan based on the user's height, weight, age, goal, and activity level. As the user logs workouts and weekly weigh-ins, an AI analysis engine tracks trends and surfaces actionable recommendations. A real-time support chat lets users contact an admin or manager at any time. A floating AI coach widget allows users to ask fitness questions via a stateless AI chat endpoint.

---

## Tech Stack

| Layer | Technology | Port |
|---|---|---|
| Backend API | Node.js + Express 5 | 3000 |
| Frontend SPA | React 18 + React Router v6 | 5173 |
| Database | MySQL / MariaDB | 3306 |
| ORM | Prisma 6 | — |
| Real-time | Socket.IO 4 | 3000 (same server) |
| AI | Google Gemini 2.5 Flash | — |

---

## Prerequisites

Install all of these before continuing:

- **Node.js** v18 or later — https://nodejs.org
- **MySQL** or **MariaDB** running locally on port 3306
- A **Google Gemini API key** — https://aistudio.google.com/app/apikey (free tier is sufficient)

---

## Installation

### 1. Clone the repository (Or download the zip)

```bash
git clone <repo-url>
cd FitWise
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Environment Variables

Both directories ship with a `.env.example` file. Copy it to `.env` and fill in your values.

### Backend

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and set your values:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/fitwise"
GEMINI_API_KEY=your_gemini_api_key_here
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string. Format: `mysql://user:password@host:port/database` |
| `GEMINI_API_KEY` | Google Gemini API key used for plan generation, analysis, and chat |

### Frontend

```bash
cp client/.env.example client/.env
```

The frontend `.env` sets the dev server port to `5173`. No other values are needed — the backend URL is hardcoded to `http://localhost:3000` in `client/src/services/api.js`.

---

## Database Setup

### 1. Create the database

Open your MySQL client (MySQL Workbench, DBeaver, or the CLI) and run:

```sql
CREATE DATABASE fitwise;
```

### 2. Run Prisma migrations

From the `backend/` directory, apply all migrations to create the tables:

```bash
cd backend
npx prisma migrate deploy
```

### 3. Seed demo data

Populate the database with exercises, food items, and six demo user accounts:

```bash
npx prisma db seed
```

The seed script is at `backend/prisma/seed.js`. It inserts the exercise library, food database, demo accounts, seeded workout and meal plans, check-in history, and support conversations.

---

## ORM Setup (Prisma)

The project uses **Prisma 6** as its ORM, targeting MySQL via the `mysql` provider.

### Schema location

```
backend/prisma/
├── schema.prisma       ← Data model definitions
├── prismaClient.js     ← Singleton Prisma client (import this in services)
├── seed.js             ← Demo data seeding script
└── migrations/         ← Auto-generated migration history
```

### Models (database tables)

| Model | Purpose |
|---|---|
| `User` | Account credentials and role (user / admin / manager) |
| `Profile` | Fitness profile: height, weight, age, goal, activity level |
| `Settings` | Display preferences per user |
| `Progress` | Daily aggregated metrics (calories, workouts, active minutes) |
| `WorkoutPlan` | A named workout plan assigned to a user |
| `WorkoutPlanDay` | Individual days within a plan (day name, workout title) |
| `PlanExercise` | Junction: exercises scheduled for a plan day (sets, reps, weight) |
| `Exercise` | Exercise library (muscle group, difficulty, equipment type) |
| `WorkoutLog` | A completed workout session |
| `LogExercise` | Exercises performed within a log |
| `LogSet` | Individual sets within a logged exercise |
| `DailyMealPlan` | A meal plan assigned to a user (caloric target, macros) |
| `Meal` | A named meal within a plan (breakfast, lunch, etc.) |
| `MealFoodItem` | Junction: food items in a meal with portion weights |
| `FoodItem` | Food database (nutrition per 100 g) |
| `CheckIn` | Weekly weigh-in records |
| `AiRecommendation` | Stored AI analysis results |
| `SupportConversation` | One conversation thread per user for support chat |
| `SupportMessage` | Individual messages within a support conversation |
| `UserPresence` | Online/offline status and last-seen timestamp per user |

### Regenerate the Prisma client (after schema changes)

```bash
cd backend
npx prisma generate
```

### Open Prisma Studio (visual DB browser)

```bash
cd backend
npx prisma studio
```

---

## Running the Project

Open two terminals.

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

The backend starts on `http://localhost:3000`. Nodemon restarts automatically on file changes.

**Terminal 2 — Frontend**

```bash
cd client
npm start
```

The React dev server starts on `http://localhost:5173` and opens the browser automatically.

---

## Authentication Model

> This is a university project. Authentication is simulated — there are no JWTs or session tokens.

After login, the server returns the user's `id` and `role`. The React frontend stores these in `localStorage` and attaches them as HTTP headers on every subsequent request:

| Header | Value | Purpose |
|---|---|---|
| `userid` | User's numeric ID | Identifies the caller (used by most routes) |
| `x-user-id` | User's numeric ID | Alias used by `/api/users/me` and `/api/settings` |
| `x-user-role` | `user` / `admin` / `manager` | Role-based access control |

The backend's `authorize` middleware reads `x-user-role` directly. **There is no signature verification** — any client that knows a user's ID and role can impersonate them.

### Roles

| Role | Permissions |
|---|---|
| `user` | Own data only (workout logs, check-ins, progress) |
| `manager` | Read all users, create/update exercises and food items, access admin panel |
| `admin` | Full access including user management, delete operations, and admin panel |

---

## Demo Accounts

These accounts are inserted by the seed script. All passwords are `password123` (stored as bcrypt hashes).

> Upgrading a database created before password hashing was added? Run `node scripts/hashExistingPasswords.js` from `backend/` once — it hashes any remaining plaintext passwords in place.

| Email | Role | Name |
|---|---|---|
| john@fitwize.com | user | John Doe |
| noam@fitwize.com | admin | Noam Levi |
| dana@fitwize.com | user | Dana Cohen |
| roi@fitwize.com | manager | Roi Bublil |
| maya@fitwize.com | user | Maya Ben-David |
| eitan@fitwize.com | user | Eitan Katz |

---

## API Endpoints

All endpoints are prefixed with `/api`. Every response follows this envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On failure, `success` is `false`, `data` is `null`, and `error` contains `{ code, message, details }`.

---

### Auth — `/api/auth`

| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/api/auth/register` | None | `{ firstName, lastName, email, password, age, gender, height, weight, fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay }` — triggers AI plan generation |
| POST | `/api/auth/login` | None | `{ email, password }` — returns `{ userId, firstName, lastName, userRole, email }` |
| POST | `/api/auth/logout` | Any | No body — client clears localStorage |

**Register field details:**

| Field | Type | Values |
|---|---|---|
| `gender` | string | `"male"` \| `"female"` |
| `activityLevel` | string | `"beginner"` \| `"intermediate"` \| `"advanced"` |
| `fitnessGoal` | string | e.g. `"muscle_gain"`, `"weight_loss"`, `"maintenance"` |
| `age`, `height`, `weight`, `workoutsPerWeek`, `mealsPerDay` | number | Positive numbers |

---

### Users — `/api/users`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/users` | Admin / Manager | List all users |
| GET | `/api/users/me` | Any | Returns caller's user record; reads userId from `x-user-id` header |
| GET | `/api/users/:id` | Any | Get one user; admins see all fields, users see limited data |
| POST | `/api/users` | Admin / Manager | Create user (no email/password — body: `{ firstName, lastName, userRole, age, gender, height, weight, activityLevel, fitnessGoal }`) |
| PUT | `/api/users/:id` | Admin / Manager | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

---

### Exercises — `/api/exercises`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/exercises` | None | List all exercises |
| GET | `/api/exercises/:id` | None | Get one exercise |
| POST | `/api/exercises` | Admin / Manager | Body: `{ name, muscleGroup, difficultyLevel, equipment?, description? }` |
| PUT | `/api/exercises/:id` | Admin / Manager | Update exercise |
| DELETE | `/api/exercises/:id` | Admin | Delete exercise |

---

### Food Items — `/api/food-items`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/food-items` | None | List all food items |
| GET | `/api/food-items/:id` | None | Get one food item |
| GET | `/api/food-items/alternatives/:foodItemId` | None | Returns calorie-equivalent alternatives in the same category. **Requires `?grams=<positive number>` query param.** |
| POST | `/api/food-items` | Admin / Manager | Body: `{ name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g }` — all numeric fields required |
| PUT | `/api/food-items/:id` | Admin / Manager | Update food item |
| DELETE | `/api/food-items/:id` | Admin | Delete food item |

---

### Workout Plans — `/api/workout-plans`

Plans are created by admins/managers (manually or automatically on user registration via AI). Days and exercises are embedded in the plan data returned by GET and submitted atomically in POST/PUT bodies.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/workout-plans` | User / Admin / Manager | Returns active plans for the requesting user (reads from `userid` header) |
| GET | `/api/workout-plans/:id` | User / Admin / Manager | Returns plan with nested `days[]` and `exercises[]` (JOIN proof) |
| POST | `/api/workout-plans` | Admin / Manager | Body: `{ name, goal, isActive }` |
| PUT | `/api/workout-plans/:id` | Admin / Manager | Body: `{ name, goal, isActive }` |
| DELETE | `/api/workout-plans/:id` | Admin | Cascades to days and plan exercises |

---

### Workout Logs — `/api/workout-logs`

Exercises and their sets are submitted as nested arrays in the POST/PUT body. There are no separate sub-routes for adding individual exercises or sets.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/workout-logs` | User / Admin / Manager | Optional filters: `?workoutPlanId=N`, `?workoutDayId=N` |
| GET | `/api/workout-logs/:id` | User / Admin / Manager | Returns log with nested exercises and sets |
| POST | `/api/workout-logs` | User / Admin / Manager | See body structure below |
| PUT | `/api/workout-logs/:id` | User / Admin / Manager | Same body as POST; replaces all exercises |
| DELETE | `/api/workout-logs/:id` | User / Admin | Returns `{ workoutLogId: N }` |

**POST / PUT body:**

```json
{
  "workoutPlanId": 1,
  "date": "2026-06-20",
  "workoutTitle": "Monday Push Day",
  "durationMinutes": 60,
  "difficultyRating": 7,
  "notes": "optional",
  "exercises": [
    {
      "exerciseId": 1,
      "exerciseName": "Bench Press",
      "sets": [
        { "setNumber": 1, "reps": 8, "weight": 60 },
        { "setNumber": 2, "reps": 8, "weight": 62.5 }
      ]
    }
  ]
}
```

Field rules: `durationMinutes` > 0, `difficultyRating` 1–10, `exercises` non-empty, each set `reps` ≥ 0, `weight` ≥ 0.

---

### Daily Meal Plans — `/api/daily-meal-plans`

Meals and food items are submitted as nested arrays. There are no separate sub-routes for adding individual meals or food items.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/daily-meal-plans` | User / Admin / Manager | Returns plans for the requesting user |
| GET | `/api/daily-meal-plans/:id` | User / Admin / Manager | Returns plan with nested meals and food items (JOIN proof) |
| POST | `/api/daily-meal-plans` | Admin / Manager | See body structure below |
| PUT | `/api/daily-meal-plans/:id` | Admin / Manager | Same body as POST; replaces all meals |
| DELETE | `/api/daily-meal-plans/:id` | Admin | Cascades to meals and food item entries |

**POST / PUT body:**

```json
{
  "name": "Muscle Gain Plan",
  "goal": "muscle_gain",
  "targetCalories": 2800,
  "targetProtein": 180,
  "isActive": false,
  "meals": [
    {
      "mealType": "breakfast",
      "title": "Oats and Eggs",
      "estimatedCalories": 600,
      "estimatedProtein": 40,
      "foodItems": [
        { "foodItemId": 6, "foodName": "Oats", "quantityGrams": 100 },
        { "foodItemId": 5, "foodName": "Egg",  "quantityGrams": 150 }
      ]
    }
  ]
}
```

Field rules: `targetCalories` > 0, `targetProtein` ≥ 0, `meals` non-empty, each `foodItemId` must reference an existing food item.

---

### Check-Ins — `/api/check-ins`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/check-ins` | User / Admin / Manager | List all check-ins for the user identified by `userid` header |
| GET | `/api/check-ins/:id` | User / Admin / Manager | Get one check-in |
| POST | `/api/check-ins` | User / Admin / Manager | Body: `{ checkInDate, weight, workoutsCompleted, feedback? }` — creating a check-in syncs `profile.currentWeight` to this value |
| PUT | `/api/check-ins/:id` | User / Admin / Manager | Same body as POST |
| DELETE | `/api/check-ins/:id` | User / Admin | Returns `{ checkInId: N }` |

**POST field rules:** `weight` > 0 (number), `workoutsCompleted` ≥ 0 (number), `feedback` optional string.

---

### Profiles — `/api/profiles`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/profiles/:userId` | Any | Get profile for a specific user |
| POST | `/api/profiles` | Any | Creates profile; userId from `userid` header. Body: `{ fitnessGoal, workoutsPerWeek, mealsPerDay, ... }` |
| PUT | `/api/profiles/:userId` | Any | All fields optional (patch-style update) |
| POST | `/api/profiles/:userId/replan` | Any | Triggers AI to deactivate current plans and generate new ones. Body: `{ fitnessGoal, activityLevel, workoutsPerWeek, mealsPerDay, height?, currentWeight? }` |

---

### Progress Data — `/api/progress`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/progress` | Any | Get all daily progress records for the user identified by `userid` header |
| GET | `/api/progress/:date` | Any | Get progress for a specific date (`YYYY-MM-DD`) |
| POST | `/api/progress` | Any | Body: `{ date, caloriesConsumed, workoutsCompleted, activeMinutes }` — all numeric values ≥ 0 |
| PUT | `/api/progress/:id` | Any | Update a progress record by its numeric database **id** (not date) |

---

### Settings — `/api/settings`

Settings userId is read from the `x-user-id` header, not the URL.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/settings` | Any | Get display settings for the user identified by `x-user-id` header |
| PUT | `/api/settings` | Any | Body: `{ displayName, email, theme }` — all three fields required. `theme`: `"light"` \| `"dark"` |

---

### AI — `/api/ai`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/ai/recommendations` | User / Admin / Manager | Run AI progress analysis; stores result in `AiRecommendation` table; may adjust caloric target and exercise weights. Reads userId from `userid` header. |
| GET | `/api/ai/recommendations` | User / Admin / Manager | Fetch all stored AI recommendations for the current user |
| POST | `/api/ai/chat` | None | Body: `{ message }` — sends a single question to the AI coach; returns `{ message, timestamp }`. Stateless — no conversation history is maintained. |

---

### Support Chat (HTTP) — `/api/support`

These HTTP endpoints read and write the same data that the Socket.IO support namespace populates. See [WebSocket Feature](#websocket-feature) for the real-time layer.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/support/my-conversation` | User / Admin / Manager | Returns the current user's support conversation and all its messages. Creates the conversation if none exists yet. |
| GET | `/api/support/admins-presence` | User / Admin / Manager | Returns online/offline status for all admins and managers, merging DB state with live Socket.IO socket state. |
| GET | `/api/support/admin/users` | Admin / Manager | Returns all user conversations with presence data (`isOnline`, `lastSeen`). Used in the Admin Panel chat centre. |
| GET | `/api/support/admin/conversation/:userId` | Admin / Manager | Returns the full conversation and messages for a specific user. Creates the conversation if none exists yet. |

---

### Admin Panel — `/api/admin`

All routes require `x-user-role: admin` or `x-user-role: manager`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/admin/workout-plans` | Admin / Manager | Returns workout plans for **all** users |
| GET | `/api/admin/daily-meal-plans` | Admin / Manager | Returns meal plans for **all** users |
| GET | `/api/admin/users/stats` | Admin / Manager | Returns all users with `currentWeight` (from profile) and `checkInCount` |
| GET | `/api/admin/check-ins/user/:userId` | Admin / Manager | Returns the full check-in history for a specific user |

---

## WebSocket Feature

FitWise uses **Socket.IO 4** for a real-time **support chat** between regular users and admins/managers. The AI coach chat widget is a separate HTTP feature (see [AI Features](#ai-features)).

**File:** `backend/src/sockets/support.socket.js`

### Connection

```js
const socket = io('http://localhost:3000/support');
```

The client connects to the `/support` namespace (not the default `/` namespace). The frontend uses `autoConnect: false` and initiates the connection after login.

### Rooms

| Room | Who joins |
|---|---|
| `user_support_<userId>` | Every user on connection |
| `support_admins` | Admins and managers only |

### Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `support:join` | `{ userId, role }` | Register the socket with the server. Must be emitted immediately after connecting. |
| `support:message` | `{ conversationUserId, message }` | Send a chat message. `conversationUserId` is the user who owns the conversation thread. Only the conversation owner or an admin/manager may send to a thread. |
| `support:typing` | `{ conversationUserId, isTyping }` | Broadcast a typing indicator to the other participants. |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `support:joined` | `{ userId, role }` | Confirms the socket has been registered. |
| `support:new_message` | `{ conversationUserId, message }` | Broadcast to `user_support_<userId>` and `support_admins` when a message is saved. |
| `support:typing` | `{ conversationUserId, senderId, isTyping }` | Forwarded to other participants (not echoed back to sender). |
| `support:presence_update` | `{ userId, isOnline, lastSeen? }` | Emitted when a user connects or disconnects. Admin/manager presence is broadcast to all sockets; user presence is sent only to `support_admins`. |
| `support:error` | `{ message }` | Sent to the sender if a message fails authorization or persistence. |

### Persistence

Messages are written to the `SupportMessage` table. Presence state is stored in `UserPresence`. The HTTP endpoint `GET /api/support/my-conversation` reads the same persisted data, so conversations survive page refreshes.

---

## AI Features

FitWise has three distinct AI integration points, all using **Google Gemini 2.5 Flash** via the `@google/generative-ai` SDK.

### 1. Plan Generation on Registration

**File:** `backend/src/services/planGenerator.js`

When a user completes registration:

1. BMR is calculated using the Mifflin-St Jeor equation based on the user's profile.
2. A caloric target is derived from BMR × activity multiplier ± goal adjustment.
3. A prompt is sent to Gemini asking it to produce a structured workout plan (days with exercises drawn from the existing exercise library IDs) and a meal plan (meals with food items drawn from the existing food item IDs).
4. The AI output is validated against real database IDs.
5. All records are written to the database.

This also runs when the user triggers `POST /api/profiles/:userId/replan`.

### 2. Progress Analysis

**File:** `backend/src/services/aiAnalysisService.js`
**Endpoint:** `POST /api/ai/recommendations`

When triggered (manually from the Settings page):

1. The service collects in parallel: the user's profile, all check-ins, recent workout logs (last 21 days), and active workout and meal plans.
2. A structured prompt is built that includes the weight trend (last 6 check-ins), workout performance, and current plan details.
3. Gemini returns a JSON object with three assessment fields (`weightAssessment`, `nutritionAssessment`, `workoutAssessment`), a `recommendations` array, and an `actions` object.
4. If `actions.caloricTargetAdjustment` is non-null, the profile's caloric target and all food quantities in the active meal plan are scaled proportionally.
5. If `actions.exerciseAdjustments` is non-empty, `targetSets`, `targetReps`, and/or `targetWeight` are updated on the specified plan exercises.
6. The result is stored in the `AiRecommendation` table and returned to the client.

### 3. AI Coach Chat

**File:** `backend/src/services/ai.service.js`
**Endpoint:** `POST /api/ai/chat`

The floating AI coach widget in the bottom-right corner of every page sends plain HTTP POST requests to this endpoint. Each request is independent — no conversation history is maintained server-side. The Gemini model is instructed to give concise 2–4 sentence responses focused on fitness and nutrition.

> **Note:** This is **not** the WebSocket feature. The WebSocket (`/support` namespace) is the user↔admin support chat. The AI coach chat is a standard REST endpoint.

---

## Known Limitations

These are intentional simplifications for a university project context.

| Limitation | Detail |
|---|---|
| **No real authentication** | Auth headers (`userid`, `x-user-role`) are sent unverified by the client. Any user can impersonate another by changing localStorage. |
| **Single-origin CORS** | The backend only allows requests from `http://localhost:5173`. Changing either port requires updating `backend/server.js` and the Socket.IO init options. |
| **Frontend API URL is hardcoded** | `client/src/services/api.js` points to `http://localhost:3000`. If you change the backend port, update this file manually. |
| **Gemini API rate limits** | The free tier of the Gemini API has per-minute request limits. Rapid registrations or repeated `/replan` calls may hit these limits. |
| **No input sanitization** | There is minimal server-side validation on request bodies. |
| **AI chat is stateless** | The AI coach widget (`POST /api/ai/chat`) sends one question at a time with no server-side conversation history. Each message is a fresh request. |
| **Support chat history requires socket connection** | Chat messages are only persisted when sent through the Socket.IO `support:message` event. Messages sent through the HTTP support endpoints are not supported. |
| **No file uploads** | Profile photos and similar media are not supported. |
| **No email verification** | Registration accepts any email format without sending a confirmation email. |
