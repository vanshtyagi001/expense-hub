# Changes Made to ExpenseHub Project

The following critical bug fixes and configuration updates were made to get the project working locally and connecting properly to the Supabase database:

## 1. Fixed Database Connection Configuration
**Files modified:** `src/db/index.ts`, `src/db/drizzle.config.ts`, `.env`
* **Issue:** The project was using 4 separate environment variables (`SQL_HOST`, `SQL_DB_NAME`, `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD`). Furthermore, `src/db/index.ts` was looking for `SQL_USER` while `.env` had `SQL_ADMIN_USER`. The SSL requirement for remote Supabase connections was also hardcoded to `false`.
* **Fix:** Simplified the entire database connection to use a single industry-standard `DATABASE_URL` variable. Removed the individual properties and hardcoded `ssl: true` requirements by allowing the connection URI to handle it.

## 2. Resolved IPv4 Connection Timeout (Supabase Pooler)
**Files modified:** `.env`
* **Issue:** The `.env` file was using the direct connection host (`db.[ref].supabase.co`). Supabase recently removed IPv4 support for direct connections on free tiers. Since local development environments usually rely on IPv4, the Node process and `drizzle-kit` were timing out with `ENOTFOUND` errors.
* **Fix:** Updated the `DATABASE_URL` in `.env` to use the **Session Pooler** host (`aws-1-ap-southeast-1.pooler.supabase.com` on port `5432`). This explicitly forces the connection over IPv4 and supports migrations.

## 3. Fixed Environment Variable Loading (ES Module Hoisting Bug)
**Files modified:** `server.ts`, `src/db/index.ts`
* **Issue:** The backend development server (`tsx server.ts`) was crashing with `Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`.
* **Root Cause:** Due to ES module import hoisting, `import { db } from './db/index.ts'` was being executed *before* `dotenv.config()` ran in `server.ts`. This meant the database `Pool` was instantiated while `process.env.DATABASE_URL` was still `undefined`.
* **Fix:** Moved `dotenv.config()` directly to the top of `src/db/index.ts` to guarantee that environment variables are loaded before the Postgres connection pool is created.

## 4. Fixed 500 Internal Server Error on Group Creation
**Files modified:** `src/api/groups/index.ts`
* **Issue:** Submitting a new group via the frontend threw a `500 Internal Server Error`.
* **Root Cause:** The `POST /api/groups` route assumed the user already existed in the database (`dbUser!.id`). Because earlier database connections failed, the user's DB record was never synced from Firebase Auth.
* **Fix:** Copied the "just-in-time" user creation logic from the `GET` route into the `POST` route. Now, if the backend notices the user doesn't exist in the Postgres `users` table during group creation, it automatically inserts them before creating the group.

## 5. Pushed Database Schema
**Commands run:** `npx drizzle-kit push --config=src/db/drizzle.config.ts`
* **Result:** After fixing the connection issues, successfully pushed the Drizzle schema. All required tables (`users`, `groups`, `group_members`, `expenses`, etc.) are now live in the Supabase instance.
