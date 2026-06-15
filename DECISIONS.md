# DECISIONS.md

# ExpenseHub Decision Log

This document records the major product and engineering decisions made during the development of ExpenseHub. For each decision, the problem, alternatives considered, chosen solution, reasoning, and trade-offs are documented.

---

# Decision 1: Relational Database Selection

## Problem

The assignment explicitly requires the use of a relational database.

## Options Considered

### Option A: MongoDB

Pros:

* Flexible schema
* Fast development

Cons:

* Not a relational database
* Violates assignment requirement

### Option B: PostgreSQL

Pros:

* Strong relational modeling
* ACID transactions
* Excellent support for joins and constraints

Cons:

* Slightly more setup complexity

## Chosen Option

PostgreSQL

## Reason

Expenses, settlements, memberships, and anomaly tracking have strong relationships. PostgreSQL provides data integrity and satisfies the assignment requirement.

## Trade-Offs

Slightly more complex schema design compared to document databases.

---

# Decision 2: Membership Timeline Tracking

## Problem

Members can join and leave groups over time.

Example:

* Meera leaves at the end of March.
* Sam joins in April.

## Options Considered

### Option A: Store only active members

Pros:

* Simple implementation

Cons:

* Historical balances become inaccurate

### Option B: Track join and leave dates

Pros:

* Accurate historical calculations
* Supports changing memberships

Cons:

* More complex balance logic

## Chosen Option

Track membership timelines using joinedAt and leftAt dates.

## Reason

The assignment explicitly requires support for changing group memberships.

## Trade-Offs

Balance calculations must validate membership status for every expense.

---

# Decision 3: Expense Split Architecture

## Problem

The CSV contains multiple split types.

## Options Considered

### Option A: Support Equal Split only

Pros:

* Simple

Cons:

* Fails assignment requirements

### Option B: Support all split types

Pros:

* Handles all imported data
* Future-proof design

Cons:

* Additional calculation logic

## Chosen Option

Support:

* Equal
* Percentage
* Shares
* Unequal

## Reason

The assignment explicitly requires support for every split type appearing in the CSV.

## Trade-Offs

Increased validation and testing requirements.

---

# Decision 4: Settlement Representation

## Problem

Some rows represent repayments rather than expenses.

Example:

"Rohan paid Aisha back"

## Options Considered

### Option A: Store settlements as expenses

Pros:

* Simpler schema

Cons:

* Distorts balances
* Difficult reporting

### Option B: Dedicated settlements table

Pros:

* Clear financial model
* Easier auditing

Cons:

* Additional table and APIs

## Chosen Option

Separate settlements table.

## Reason

Settlements reduce debt rather than create new expenses.

## Trade-Offs

Additional backend complexity.

---

# Decision 5: Currency Handling

## Problem

The dataset contains both INR and USD expenses.

## Options Considered

### Option A: Maintain multiple currencies in balances

Pros:

* Preserves original values

Cons:

* Confusing settlements
* Difficult balance calculations

### Option B: Normalize to INR

Pros:

* Single balance system
* Easier settlements

Cons:

* Requires conversion policy

## Chosen Option

Convert imported expenses to INR while preserving:

* Original amount
* Original currency
* Exchange rate

## Reason

Users ultimately need a single debt and settlement view.

## Trade-Offs

Balances depend on the selected exchange rate policy.

---

# Decision 6: CSV Import Architecture

## Problem

The CSV contains inconsistent and potentially invalid data.

## Options Considered

### Option A: Import directly into production tables

Pros:

* Simple

Cons:

* Risk of corrupted data

### Option B: Staging and review workflow

Pros:

* Safer
* Auditable

Cons:

* More implementation effort

## Chosen Option

Staging import pipeline.

Flow:

CSV Upload
→ Validation
→ Anomaly Detection
→ Review Queue
→ Final Import

## Reason

Allows users to inspect problematic records before they affect balances.

## Trade-Offs

Longer import process.

---

# Decision 7: Anomaly Handling Policy

## Problem

The CSV contains intentionally bad data.

## Options Considered

### Option A: Automatically fix anomalies

Pros:

* Fast import

Cons:

* Risk of incorrect assumptions

### Option B: Reject entire import

Pros:

* Safe

Cons:

* Poor user experience

### Option C: Review Queue

Pros:

* Transparent
* User-controlled

Cons:

* Additional UI complexity

## Chosen Option

Review Queue.

## Reason

Meera explicitly requested approval before changes are made.

## Trade-Offs

User involvement required during import.

---

# Decision 8: Duplicate Detection Strategy

## Problem

Some expenses appear duplicated.

## Options Considered

### Option A: Exact matching

Pros:

* Simple

Cons:

* Misses spelling variations

### Option B: Fuzzy matching

Pros:

* Detects real-world duplicates

Cons:

* False positives possible

## Chosen Option

Fuzzy matching combined with user review.

## Reason

Descriptions may differ slightly while representing the same expense.

## Trade-Offs

Requires manual verification.

---

# Decision 9: Balance Calculation Method

## Problem

Balances must always remain accurate after edits and imports.

## Options Considered

### Option A: Store calculated balances

Pros:

* Fast retrieval

Cons:

* Risk of stale data

### Option B: Calculate balances dynamically

Pros:

* Always accurate

Cons:

* More computation

## Chosen Option

Dynamic balance calculation.

## Reason

Accuracy is more important than micro-optimizations.

## Trade-Offs

Slightly higher query cost.

---

# Decision 10: Debt Simplification Algorithm

## Problem

Users want simple settlement instructions.

## Options Considered

### Option A: Show every debt relationship

Pros:

* Complete information

Cons:

* Difficult to understand

### Option B: Simplify transactions

Pros:

* Easier settlements

Cons:

* Requires algorithmic processing

## Chosen Option

Greedy debt simplification algorithm.

## Reason

Produces a minimal settlement plan that users can execute easily.

## Trade-Offs

Additional processing during balance generation.

---

# Decision 11: Explainable Balances

## Problem

Users want to understand why they owe money.

## Options Considered

### Option A: Show only final balances

Pros:

* Clean UI

Cons:

* No transparency

### Option B: Full balance breakdown

Pros:

* Explainable calculations
* Easier debugging

Cons:

* Additional UI complexity

## Chosen Option

Balance explanation view.

## Reason

Directly addresses Rohan's requirement.

## Trade-Offs

More data displayed to users.

---

# Decision 12: Auditability

## Problem

Financial systems require traceability.

## Options Considered

### Option A: Store final results only

Pros:

* Simpler

Cons:

* Difficult debugging

### Option B: Store anomaly history and import reports

Pros:

* Fully auditable

Cons:

* Additional storage

## Chosen Option

Maintain import reports, anomaly logs, and review history.

## Reason

Supports transparency and interview explainability.

## Trade-Offs

Slightly larger database footprint.

---

# Decision 13: Authentication Strategy

## Problem

Users require secure access.

## Options Considered

### Option A: Session-based authentication

Pros:

* Traditional

Cons:

* More server-side state

### Option B: JWT authentication

Pros:

* Stateless
* Easy API protection

Cons:

* Token management required

## Chosen Option

JWT Authentication.

## Reason

Simple and scalable for this project.

## Trade-Offs

Requires token expiration handling.

---

# Decision 14: User Experience Philosophy

## Problem

Financial applications often become cluttered.

## Options Considered

### Option A: Data-heavy interface

Pros:

* More information visible

Cons:

* Overwhelming

### Option B: Clean fintech-style interface

Pros:

* Better usability
* Easier navigation

Cons:

* Requires careful design

## Chosen Option

Minimalist fintech-inspired design.

## Reason

Supports clarity and trust.

## Trade-Offs

Some advanced information is hidden behind detail views.

---

# Final Principle

Throughout ExpenseHub development, the primary decision-making rule was:

"Never silently modify financial data."

Every calculation, anomaly, conversion, and settlement should be visible, explainable, and auditable by the user.
