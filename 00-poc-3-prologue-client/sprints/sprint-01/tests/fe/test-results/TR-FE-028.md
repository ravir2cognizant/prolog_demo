---
id: TR-FE-028
tc-ref: TC-FE-028
verdict: NOT_RUN
executed-by: A-07
date: 2026-05-21
runner: vitest
---
# TR-FE-028 -- Routing Field: Routing Rules Dropdown Populated from API
## Verdict: NOT_RUN
## Reason: No automated test. Code inspection confirms `GET /routing-rules` is called in the parallel ref-data load in `JournalEntryPage.tsx` and the response populates the routing select. No defect identified.
## Risk: LOW — ref data load pattern consistent across all selects.
