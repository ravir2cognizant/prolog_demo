---
id: TR-FE-009
tc-ref: TC-FE-009
verdict: NOT_RUN
executed-by: A-07
date: 2026-05-21
runner: vitest
---

# TR-FE-009 -- Submit for Approval Button Is Visible and Calls Correct Endpoint

## Verdict: NOT_RUN

## Reason
No automated test for the Submit for Approval button. Code inspection confirms the button is conditionally rendered for Unposted entries in `JournalEntryPage.tsx`. The `doSubmitForApproval()` handler calls `apiClient.POST` on the correct path.

## Risk
LOW — conditional button rendering and single API call. No complex logic.
