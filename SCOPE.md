# Feature Scope

## What is Supported
* **Advanced Expense Splits**: Equal, percentages, exact amounts, and custom ratio shares.
* **Complex Reconciliations**: Full anomaly detection pipeline highlighting Duplicate records, Zero-Value records, Future-dated records, Date parse failures, and Settlement classification overlaps before committal.
* **Temporal Group Memberships**: Prevents allocating expenses to users outside their active presence window (e.g. Sam doesn't pay March rent).
* **Multi-Currency UI Display**: Preserves original inputs ($10 USD) while reconciling unified debt graphs locally (INR).
* **Optimized Settlement Graph Engine**: Automatically produces minimal payment channels to settle grouped debt instead of pairwise transactions.
* **Exporting / Auditing**: Basic Drill-downs of personal impacts per bill and exported structural CSV logs.

## What is NOT Supported
* **Live Exchange Rates**: Uses simplified static math (83 INR for 1 USD mockup) to avoid breaking API dependencies.
* **Image Receipt Parsing**: No OCR integration.
* **True Distributed Cloud Auth**: Uses simplified JWT local-system representation for rapid evaluation stability.
