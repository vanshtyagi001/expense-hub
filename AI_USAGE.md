# AI_USAGE.md

# AI Usage Log

## Methodology

AI was used as a supplementary development aid for research, validation, and documentation purposes. Final implementation decisions, business rules, testing, and debugging were completed manually.

### 1. Schema Review

AI was consulted to review the initial relational database design and suggest improvements to relationships between users, groups, expenses, settlements, and imported records.

Final schema design decisions were reviewed and implemented manually.

---

### 2. Settlement Logic Research

AI was used to discuss common approaches for debt simplification and settlement generation.

After reviewing the options, the settlement logic was implemented and tested manually within the application.

---

### 3. Data Validation Discussion

AI was used to brainstorm possible anomaly categories that could appear in imported CSV data, such as missing values, duplicate expenses, and settlement records.

Detection rules and handling policies were defined and implemented manually.

---

### 4. Documentation Assistance

AI was used to help organize project documentation, including technical notes, decision logs, and project summaries.

All project-specific content was reviewed and edited before inclusion.

---

# Cases Where AI Was Incorrect

## Case 1

### AI Suggestion

Automatically remove duplicate expenses during import.

### Issue

This could incorrectly remove valid transactions.

### Resolution

Duplicates are flagged and reviewed by the user before any action is taken.

---

## Case 2

### AI Suggestion

Treat negative expense amounts as invalid records.

### Issue

Negative amounts may represent refunds.

### Resolution

Negative values are classified as potential refunds and require review.

---

## Case 3

### AI Suggestion

Calculate balances using all members currently present in a group.

### Issue

This ignored member join and leave dates.

### Resolution

Expense participation is validated against membership timelines before balance calculation.

---

# Final Notes

AI was used primarily for discussion, validation, and documentation support.

The application's architecture, anomaly handling rules, balance calculations, settlement processing, testing, debugging, and final implementation decisions were completed manually.
