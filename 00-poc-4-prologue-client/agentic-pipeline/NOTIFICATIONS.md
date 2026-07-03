# Notifications
<!-- Human-operator blockers and alerts written by hooks and agents. -->
<!-- Clear entries once you have acted on them. -->

## ~~RESOLVED~~ HB-001 (Balance field clarification)
**Blocking:** RC-005 (Journal Entry Balance Validation Display)

A-01 found a contradiction in the source image:
- The journal entry header shows **"Balanced: No"**
- The line-items grid footer shows **Debit $1,435.00 = Credit $1,435.00, Difference $0.00**

**Question:** What does the "Balanced" header field represent?
Options: (a) a user-settable flag independent of grid math, (b) a system flag not yet recalculated,
(c) a different concept altogether (e.g. multi-dimensional balance across cost centres).

Resolution needed before BFF Designer and Frontend Developer can implement balance logic.

When resolved: update RC-005 OQ-001 and resolve HB-001 in the Blocker List.

---

## ~~PARTIALLY RESOLVED~~ HB-002 (Chartfield code structure — S2–S5 labels still open, non-blocking)
**Blocking:** RC-004 (Journal Entry Line Items Management)

The account/chartfield code in the screenshot uses a **5-segment format**: `1-098-1680-098-86`
The meaning of each segment, valid values, and validation rules are unknown.

**Questions:** What does each segment represent? What are the valid values / lookup sources for each?
Are segments user-typed or selected from dropdowns? Are there validation rules per segment?

Resolution needed before BFF Designer and Frontend Developer can design the account code input control.

When resolved: update RC-004 OQ-006 and resolve HB-002 in the Blocker List.
