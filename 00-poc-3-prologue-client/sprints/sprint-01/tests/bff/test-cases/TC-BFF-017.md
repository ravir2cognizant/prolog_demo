---
id: TC-BFF-017
ed-ref: ED-005
rc-ref: RC-005
type: integration
priority: P2
automated: yes
---

# TC-BFF-017 -- POST /journal-entries/{id}/reverse Creates Unposted Reversal Entry

## Test Objective
Verify that triggering a reversal on a Posted journal entry returns 200 with a `reversalEntryId`, `reversalEntryStatus: "Unposted"`, `reversalDate`, and `originatingEntryId` matching the original entry.

## Preconditions
- AUTH_DEV_BYPASS=1
- A Posted JE exists

## Test Steps
1. Create and post a balanced JE
2. `POST /journal-entries/{id}/reverse` with body `{ "reversalDate": "2026-06-01" }`
3. Assert `res.status === 200`
4. Assert `res.body.reversalEntryId` is a non-empty string
5. Assert `res.body.reversalEntryStatus === "Unposted"`
6. Assert `res.body.reversalDate === "2026-06-01"`
7. Assert `res.body.originatingEntryId === {original id}`

## Expected Results
- 200 OK with reversal entry details
- Reversal entry is Unposted
- originating entry ID preserved

## Coverage Notes
Covers ED-005 Trigger Journal Entry Reversal, RC-005 FR-2 (reversal created), FR-4 (reversal is Unposted), AC-5 (description references original).
