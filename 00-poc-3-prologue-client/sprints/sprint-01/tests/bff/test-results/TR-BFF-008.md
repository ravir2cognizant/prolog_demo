---
id: TR-BFF-008
tc-ref: TC-BFF-008
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-008 -- GET /journal-entry-types Returns code and name

## Verdict: PASS

## Evidence
```
✓ TC-BFF-008: GET /journal-entry-types > returns 200 with code and name on each item
```
GET /journal-entry-types returned 200 with `items` array. Each item has `code` (string) and `name` (string).

## Notes
Public endpoint. Seed contains STD, ADJ, REV, ACR types.
