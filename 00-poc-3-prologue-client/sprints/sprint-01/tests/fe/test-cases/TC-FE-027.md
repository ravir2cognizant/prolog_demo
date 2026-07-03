---
id: TC-FE-027
rc-ref: RC-005
type: unit
priority: P2
automated: yes
---

# TC-FE-027 -- Auto Reversal Date Field: Read-Only When Entry is Posted

## Test Objective
Verify that the Auto Reversal Date field is editable when the entry is Unposted but becomes read-only once the entry is Posted, per RC-005 FR-7.

## Preconditions
- Two mocked scenarios: Unposted entry and Posted entry with autoReversalDate set

## Test Steps
**Scenario A -- Unposted:**
1. Render JournalEntryPage with Unposted entry, autoReversalDate = null
2. Assert the Auto Reversal Date input is not disabled

**Scenario B -- Posted:**
1. Render JournalEntryPage with Posted entry, autoReversalDate = '2026-06-01'
2. Assert the Auto Reversal Date input is disabled or read-only
3. Assert the field displays "2026-06-01"

## Expected Results
- Unposted: Auto Reversal Date editable
- Posted: Auto Reversal Date read-only, shows the stored date

## Coverage Notes
Covers RC-005 FR-6 (user can remove/change before posting), FR-7 (read-only after posting), AC-4 (posted entry: field is read-only).
