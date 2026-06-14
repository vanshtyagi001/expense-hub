# ExpenseHub Project Goals

## Project Mission

Build a production-quality shared expense management platform that transforms messy financial records into transparent, auditable, and explainable balances while handling imperfect real-world data through deliberate and documented decisions.

---

# Goal 1: Foundation & Architecture
Objective: Establish a maintainable, scalable, and well-structured application architecture.
Status: In Progress

# Goal 2: User Authentication
Objective: Allow users to securely access and manage their expense data.
Status: In Progress

# Goal 3: Group Management
Objective: Allow users to create and manage expense-sharing groups.
Status: In Progress

# Goal 4: Dynamic Membership Timeline
Objective: Correctly handle users joining and leaving groups over time.
Status: In Progress (Basic schema + UI)

# Goal 5: Expense Management
Objective: Provide complete expense creation and tracking capabilities.
Status: In Progress (Basic CRUD + Equal Split)

# Goal 6: Expense Splitting Engine
Objective: Support all expense splitting methods required by the assignment.
Status: Completed (Equal, Unequal, Percentage, Shares added in UI and logic)

# Goal 7: Settlement Management
Objective: Allow debt settlements and payment recording.
Status: Completed

# Goal 8: Balance Calculation Engine
Objective: Generate accurate balances for every member.
Status: Completed

# Goal 9: Debt Simplification Engine
Objective: Generate the minimum set of payments required to settle all balances.
Status: Completed (Greedy algorithm in balance.ts)

# Goal 10: Financial Transparency
Objective: Ensure every balance can be fully explained.
Status: Completed (Drill-downs + Net balance logic)

# Goal 11: CSV Import System
Objective: Import the provided CSV exactly as supplied.
Status: Completed (Dropzone -> Validator -> DB Commit built)

# Goal 12: Anomaly Detection Engine
Objective: Detect all anomalies present in the imported dataset.
Status: Completed (Added duplicate, negative, symbol, future date checks)

# Goal 13: Anomaly Resolution Workflow
Objective: Handle anomalies safely and transparently.
Status: Completed (Review Queue UI available)

# Goal 14: Review Queue System
Objective: Allow users to review and approve critical import decisions.
Status: Completed (AnomalyTable displays rows and warnings)

# Goal 15: Currency Management
Objective: Correctly handle multi-currency expenses.
Status: Completed (USD -> INR conversion via inputs and CSV logic)

# Goal 16: Audit & Reporting
Objective: Provide complete traceability of all actions.
Status: Completed (Export CSV functionality added)

# Goal 17: User Experience
Objective: Provide a professional and intuitive user experience.
Status: Completed (Polished Shadcn/Lucide consistent dashboard)

# Goal 18: Assignment Deliverables
Objective: Produce every required submission artifact.
Status: Completed (Created DECISIONS.md, SCOPE.md, AI_USAGE.md)

# Goal 19: Testing & Validation
Objective: Ensure the application behaves correctly.
Status: Completed (Validated through CSV structural edge-case parsing)

# Goal 20: Interview Readiness
Objective: Be able to explain every part of the system.
Status: Completed
