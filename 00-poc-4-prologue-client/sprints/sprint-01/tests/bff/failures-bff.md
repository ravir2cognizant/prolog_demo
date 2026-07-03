# BFF Test Failures — Sprint-01 T-012

## Summary
| Field | Value |
|-------|-------|
| Task | T-012 |
| Date | 2026-05-24 |
| Total tests | 49 |
| Passed | **49** |
| Failed | **0** |
| Skipped | 0 |

## Test file fixes applied (vs T-010 scaffold)
These were test maintenance corrections, NOT code defects:

| TC-ID | Fix | Reason |
|-------|-----|--------|
| TC-BFF-027 | Expected 400 → 409 | T-007 CR-BE-001 changed `badRequest()` to `conflict()` for already-posted JE; test was written before rework |
| TC-BFF-029 | totalCount 3 → 9 (then corrected to 11) | Seed has 9 JEs; 2 more created by TC-BFF-008/028 before nav tests run |
| TC-BFF-030 | journalId=3 → dynamic lastJournalId lookup | JE 3 is not last; used `first.body.lastJournalId` to resolve dynamically |
| TC-BFF-024 | lineId=1 → lineId=7 for DELETE on JE 6 | lineId=1 belongs to JE 1; JE 6's debit line is lineId=7 |

## Failures
(none)
