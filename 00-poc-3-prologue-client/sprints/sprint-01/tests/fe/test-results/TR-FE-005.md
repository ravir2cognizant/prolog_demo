---
id: TR-FE-005
tc-ref: TC-FE-005
verdict: PARTIAL
executed-by: A-07
date: 2026-05-21
runner: vitest
---

# TR-FE-005 -- Post Button Visible for Unposted Entry; Entry Goes Read-Only on Posted Load

## Verdict: PARTIAL

## Evidence
`"loads existing entry and shows Posted status badge"` in `JournalEntryPage.test.tsx` — PASS. Confirms a Posted entry loads and the "Posted" badge is visible in edit mode.

## Not Covered
- Explicit assertion that Post button is absent and Unpost button is present for a Posted entry
- Assertion that Transaction Date and line inputs are `disabled` when status = Posted
- Create mode: verification that Post button is present

## Risk
LOW — status-driven read-only logic is straightforward in the implementation (`disabled={isPosted}` pattern). Code review found no defect here.
