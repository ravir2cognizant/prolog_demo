---
id: TR-BFF-023
tc-ref: TC-BFF-023
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-023 -- Reference Data Endpoints Return 200 with Items

## Verdict: PASS

## Evidence
```
✓ TC-BFF-023: Reference data endpoints return 200 with items > /allocation-methods
✓ TC-BFF-023: Reference data endpoints return 200 with items > /source-documents
✓ TC-BFF-023: Reference data endpoints return 200 with items > /journal-entry-types
✓ TC-BFF-023: Reference data endpoints return 200 with items > /companies
✓ TC-BFF-023: Reference data endpoints return 200 with items > /currencies
```
All 5 reference data endpoints returned 200 with non-empty `items` arrays.

## Notes
Covers ED-009 through ED-013 reference data group. All seeded.
