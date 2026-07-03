---
id: TR-BFF-005
tc-ref: TC-BFF-005
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-005 -- PUT /journal-entries/{id} Update Unposted

## Verdict: PASS

## Evidence
```
✓ TC-BFF-005: PUT /journal-entries/{id} update unposted > returns 200 with editedAt and editedByUserId
```
Created entry, then PUT with updated description. Response 200 with `editedAt` (ISO string) and `editedByUserId` = "dev-user-001".

## Notes
PUT happy path on Unposted entry confirmed.
