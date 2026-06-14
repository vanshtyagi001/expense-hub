# Technical Decisions

This document outlines the architectural and product decisions made during the construction of ExpenseHub to safely and reasonably process real-world imperfect data.

## 1. Local Database & Server Engine
**Decision**: Single Express + Vite isomorphic container. Local SQLite via Drizzle ORM (memory-hosted or local file).
**Why**: 
To keep the application entirely self-contained without demanding complex external Firebase/Cloud SQL provisions from the evaluators, maximizing the "run anywhere" requirement.

## 2. Dealing with Anomalies (`importAnomalies`)
**Decision**: We stage raw CSV imports into a dedicated `importAnomalies` table alongside a specific `importSessionId` instead of dropping them.
**Why**: 
Real-world data is disastrous. We used an intermediate Staging Table architecture where records are inspected *before* committing. 
The system detects missing payers, duplicate transactions, and non-expense records (like settlements named "Rohan paid me back"). This allows the Meera/Aisha persona to safely audit the import rather than facing a corrupted database.

## 3. Currency Normalization
**Decision**: Hard-code USD/INR exchange rate (for MVP bounds), tracking `exchangeRate` explicitly per expense.
**Why**: 
The prompt mentioned USD transactions while others are INR. Storing everything natively in INR utilizing a defined conversion factor guarantees that net debt calculation is strictly monotonic avoiding multi-currency balance graphs (which are exceptionally confusing to settle). We persist the original currency so the display remains accurate ($ USD).

## 4. Debt Simplification 
**Decision**: Greedy Algorithm for Graph Edges minimization.
**Why**: 
Instead of tracking 5 partial settlements, `balance.ts` evaluates the absolute credit/debt vectors for all participants and matches the most indebted participant with the most credited participant linearly. It generates a perfectly optimized Settlement Plan with `O(N log N)` routing.

## 5. Group Membership Time-Bound Safety
**Decision**: Discard split allocations to members whose `joinedAt` date strictly post-dates the expense.
**Why**: 
Sam joined in April. March bills are not Sam's problem. We enforce timestamp validations inside the Split Engine to prevent distributing the Goa Trip cost to latecomers automatically just because they exist in the DB structure.
