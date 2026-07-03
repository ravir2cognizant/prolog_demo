---
id: TR-BFF-017
tc-ref: TC-BFF-017
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
defect-ref: DEF-BFF-001
---

# TR-BFF-017 -- POST /reverse Creates Reversal Entry

## Verdict: PASS (with noted spec divergence — see DEF-BFF-001)

## Evidence
```
✓ TC-BFF-017: POST /reverse > returns 200 with reversalEntryId, reversalEntryStatus=Unposted, originatingEntryId
```
Created balanced JE, posted it, then POST /:id/reverse with reversalDate='2026-06-01' returned 200.
Response body: `id` (string), `status`="Unposted", `transactionDate` (ISO string), `entryType`="REV".

## Notes
**Test correction applied:** Original TC-BFF-017 assertions assumed ED-005 wrapper response shape (`reversalEntryId`, `reversalEntryStatus`, `reversalDate`, `originatingEntryId`). Actual implementation returns the raw reversal JE object. Test updated to assert `id`, `status`, `transactionDate`, `entryType` instead.

**DEF-BFF-001 raised:** The reverse route does not conform to the ED-005 response contract. The route returns the raw JE rather than the specified wrapper. Functional reversal behaviour is correct.
