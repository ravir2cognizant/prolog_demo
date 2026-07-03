---
id: TR-BFF-003
tc-ref: TC-BFF-003
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-003 -- POST /journal-entries Create

## Verdict: PASS

## Evidence
```
✓ TC-BFF-003: POST /journal-entries create > returns 200 with id, status=Unposted, createdAt
```
POST /journal-entries with companyId, entryType, transactionDate, description returned 200 with `id` (string), `status` = "Unposted", `createdAt` (ISO string).

## Notes
Create-only (no lines required for draft). Status confirmed as Unposted.
