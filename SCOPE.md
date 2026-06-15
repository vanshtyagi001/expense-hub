# CSV Anomaly Log

## 1. Duplicate Expense

**Rows:** #4 and #5

* "Dinner at Marina Bites"
* "dinner - marina bites"

Detection:

* Same date
* Same amount
* Same participants
* Similar description

Resolution:

* Mark as potential duplicate
* User review required

---

## 2. Inconsistent Payer Name Casing

**Rows:** #8, #26

Examples:

* Priya
* priya
* rohan

Detection:
Case-insensitive name normalization.

Resolution:
Normalize to canonical member names.

---

## 3. Alias / Alternate Member Name

**Row:** #10

Example:

* "Priya S"

Detection:
Unknown member matching existing member.

Resolution:
Map to Priya after user confirmation.

---

## 4. Missing Payer

**Row:** #12

Detection:
paid_by field empty.

Resolution:
Review required before import.

---

## 5. Settlement Logged As Expense

**Row:** #13

Description:

"Rohan paid Aisha back"

Detection:
Settlement keywords detected.

Resolution:
Convert to Settlement entity.

---

## 6. Invalid Percentage Split

**Row:** #14

Split:

30% + 30% + 30% + 20%

Total = 110%

Detection:
Percentage total ≠ 100%.

Resolution:
Block automatic import and request correction.

---

## 7. Mixed Date Formats

**Rows:**
#15-31

Examples:

* 2026-02-01
* 01/03/2026
* Mar 14

Detection:
Multiple date formats.

Resolution:
Normalize to ISO format.

---

## 8. Foreign Currency Expenses

**Rows:** #19, #20, #22, #25

Currency:

USD

Detection:
Currency differs from default currency.

Resolution:
Convert using configured exchange rate.

---

## 9. Share Split Type

**Rows:** #21, #34

Detection:
split_type = share

Resolution:
Calculate participant shares.

---

## 10. Non-Member Participant

**Row:** #22

Participant:

"Dev's friend Kabir"

Detection:
Participant not part of group.

Resolution:
Create Guest Participant record.

---

## 11. Possible Duplicate With Conflicting Amounts

**Rows:** #23 and #24

Descriptions:

* Dinner at Thalassa
* Thalassa dinner

Amounts:

* ₹2400
* ₹2450

Detection:
High similarity but different amounts.

Resolution:
Manual review required.

---

## 12. Negative Amount

**Row:** #25

Amount:

-30 USD

Detection:
Amount < 0

Resolution:
Treat as refund candidate.

---

## 13. Missing Currency

**Row:** #27

Detection:
Currency field empty.

Resolution:
Default INR after user confirmation.

---

## 14. Amount Formatting Inconsistency

**Rows:** #6, #18, #28

Examples:

* 1,200
* 1450
* " 1450 "

Detection:
Formatting inconsistency.

Resolution:
Normalize numeric values.

---

## 15. Excessive Decimal Precision

**Row:** #9

Amount:

899.995

Detection:
More than 2 decimal places.

Resolution:
Round to 2 decimals.

---

## 16. Zero Amount Expense

**Row:** #30

Amount:

0

Detection:
Amount = 0

Resolution:
Flag as invalid expense.

---

## 17. Ambiguous Date

**Row:** #33

Date:

04/05/2026

Could mean:

* 4 May 2026
* 5 April 2026

Detection:
Ambiguous locale-specific format.

Resolution:
User review required.

---

## 18. Former Member Included After Leaving

**Row:** #35

Participant:

Meera

Context:
Meera moved out at end of March.

Expense Date:
2026-04-02

Detection:
Participant no longer active.

Resolution:
Remove from split after confirmation.

---

## 19. Deposit Recorded As Expense

**Row:** #37

Description:

Sam deposit share

Detection:
Deposit-related keywords.

Resolution:
Convert to settlement/deposit record.

---

## 20. Split Type Conflict

**Row:** #41

split_type:

equal

split_details:

shares provided

Detection:
Conflicting split definitions.

Resolution:
User chooses which split rule to apply.
