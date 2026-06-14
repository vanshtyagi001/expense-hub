# ExpenseHub

ExpenseHub is a shared expense management platform that focuses on transparency, auditability, and financial clarity. It features a canvas-first green fintech aesthetic, premium card geometry, audit-focused dashboards, anomaly review workflows, and transparent balance tracking.

## Core Features
- **Canvas-first Design**: A fully saturated Expense Green `#00e013` floods the entire hero canvas, creating immediate brand recognition.
- **Transparent Financial Dashboards**: Focused on balances and settlements.
- **Anomaly Detection Workflow**: Discover potential duplicates, membership conflicts, settlement misclassifications, and currency issues via CSV import.
- **Audit-friendly**: Every balance can be traced back to individual expenses with complete transparency.
- **Membership Timeline**: Expenses only affect members who were active in the group during the expense date.

## Local Setup

If you have exported this project from Google AI Studio, follow these steps to run it locally:

1. **Clone/Extract** the project repository.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and configure your Cloud SQL (PostgreSQL) connection details.
   ```env
   SQL_HOST="your_db_host"
   SQL_DB_NAME="your_db_name"
   SQL_ADMIN_USER="your_db_user"
   SQL_ADMIN_PASSWORD="your_db_password"
   ```
4. **Database Migration**:
   Update your database schema using Drizzle ORM:
   ```bash
   npx drizzle-kit push
   ```
5. **Start Dev Server**:
   ```bash
   npm run dev
   ```

*(Note: The original plan referenced Prisma, but this project was implemented using Drizzle ORM to interface with Cloud SQL PostgreSQL).*

## Seed Command (Optional)
To seed the database with initial users and group data for development:
```bash
npm run db:seed
```
*(You will need to create a `seed.ts` script to run this).*

## Deployment

This application is built with Vite, React, Express, and Drizzle ORM, and is designed to run in a Node.js environment (e.g., Google Cloud Run, Vercel, or Heroku).

1. Build the production assets:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

## AI Tools Used
- Google AI Studio (Gemini 3.1 Pro) for generating full-stack code, UI components, and the anomaly detection pipeline.
- AI Coding Agent utilized for scaffolding the database, routing, authentication flow (Firebase Auth), and CSV parsing/validations.
