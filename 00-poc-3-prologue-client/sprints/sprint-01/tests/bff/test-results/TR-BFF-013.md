---
id: TR-BFF-013
tc-ref: TC-BFF-013
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-013 -- POST /post on Unbalanced Entry Returns 400

## Verdict: PASS

## Evidence
```
✓ TC-BFF-013: POST /post on unbalanced entry > returns 400 when totalDebit != totalCredit
```
Created JE with single line (debit only, credit=0, no offsetting line), then POST /:id/post returned 400 with code ENTRY_NOT_BALANCED.

## Notes
Balance validation enforced before posting. Error surface confirmed.
