---
id: TR-FE-002
tc-ref: TC-FE-002
verdict: NOT_RUN
executed-by: A-07
date: 2026-05-21
runner: vitest
---

# TR-FE-002 -- Journal Entry Header Save Calls POST and Resets to Edit Mode

## Verdict: NOT_RUN

## Reason
No automated Vitest test for this case exists in the current test suite. TC-FE-002 requires a mock for `apiClient.POST` on `/journal-entries` and assertion that the returned JE ID is displayed in the header after save. Test implementation is pending for sprint rework (T-007) if required.

## Risk
MEDIUM — the POST save path is a core user action. Manual smoke test recommended before demo.
