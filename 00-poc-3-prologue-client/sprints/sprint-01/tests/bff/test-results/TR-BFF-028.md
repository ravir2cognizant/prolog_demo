---
id: TR-BFF-028
tc-ref: TC-BFF-028
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-028 -- GET /accounts/{id}/balances Returns Periods Array

## Verdict: PASS

## Evidence
```
✓ TC-BFF-028: GET /accounts/{id}/balances > returns 200 with accountId and periods array
```
GET /accounts/acct-001/balances?fiscalYearId=fy-2026 returned 200 with `accountId`="acct-001" and `periods` array (12 periods for fy-2026).

## Notes
Period balance computed from posted JE lines filtered by period date range. Seed acct-001 has je-seed-001 Posted entry contributing to balance.
