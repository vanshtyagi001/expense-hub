# ExpenseHub — Complete Engineering Plan

## 0. Project Context
Four flatmates — Aisha, Rohan, Priya, Meera — share expenses tracked in a messy CSV.
Dev joined for a trip; some expenses were in USD.
Meera moved out at end of March.
Sam moved in mid-April.
The CSV has at least 12 deliberate data problems.

User Requirements:
- Aisha: Single summary: who pays whom and how much
- Rohan: Full drill-down: which expenses cause any balance
- Priya: Real USD→INR conversion, not 1:1
- Sam: Membership-date-aware balances (March bills ≠ Sam's problem)
- Meera: Human-in-the-loop for any deduplication/deletion

## Phase 1: Foundation & Core System (Completed/Ongoing)
**Achievements:**
- Basic database schema (Users, Groups, Expenses, Splits, Settlements, Members).
- Essential APIs and routing architecture (Express + React Client).
- Group overview, basic expense CRUD, and equal sharing algorithm.
- Currency multi-support basic layer (USD/INR exchanges in inputs).
- Membership timestamps stored, rejecting expenses for inactive members.

**What's Left:**
- Expand the Splitting Engine to handle exact/percentage/shares based splits (Goal 6).
- Implement a strong Debt Simplification Engine to minimize actual settlements (Goal 9).

## Phase 2: Complete The Anomaly Detection & CSV Import Pipeline (Critical Priority)
**Objectives (Goals 11, 12, 13, 14):**
- **Step 1: Real CSV Parser** — Read raw CSV, mapping to raw JSON objects without strict DB validations throwing fatal errors yet.
- **Step 2: Anomaly Detection** — Pass parsed rows through an anomaly engine:
  - Detect dupes (same description, dates, amounts).
  - Detect missing mandatory fields (who paid, what amount).
  - Detect currency format issues or date out-of-bounds (e.g. 1970).
  - Detect membership timeline misses (e.g., Sam paying for a February bill).
- **Step 3: Staging Engine & Resolution UI** — Push anomalies into `importAnomalies` table. Present a review queue UI allowing Meera/Admin to hit "Approve", "Discard", "Fix".

## Phase 3: Financial Transparency & Settlements
**Objectives (Goals 7, 8, 10, 15):**
- Render exact Drill-downs (Already started working!). Will enhance further so Aisha can see exactly "who owes who" (Net Balances -> Debt Simplification output).
- Settlement flows: Actual payment tracking between A -> B. Recalculation of net debt seamlessly.

## Phase 4: Final Deliverables & Polish
**Objectives (Goals 16, 17, 18, 19, 20):**
- Generate the final `DECISIONS.md`, `SCOPE.md`, `AI_USAGE.md` as required.
- Build visual summary screens ("Audit & Reporting") and export CSV options.
- Ensure all states have elegant empty states, loading indicators, and graceful error boundary fallbacks in the React app.
