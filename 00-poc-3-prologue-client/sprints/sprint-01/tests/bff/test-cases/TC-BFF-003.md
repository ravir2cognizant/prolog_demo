---
id: TC-BFF-003
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-003 -- POST /journal-entries Creates Entry and Returns ID + Unposted Status

## Test Objective
Verify that `POST /journal-entries` with a valid payload creates a journal entry and returns `id`, `status: "Unposted"`, and `createdAt`.

## Preconditions
- seedStore() loaded
- AUTH_DEV_BYPASS=1

## Test Steps
1. `POST /journal-entries` with body:
   ```json
   {
     "companyId": "company-001",
     "entryType": "FJ",
     "transactionDate": "2026-05-21",
     "description": "TC-BFF-003 Test Entry"
   }
   ```
2. Assert `res.status === 200`
3. Assert `res.body.id` is a non-empty string
4. Assert `res.body.status === "Unposted"`
5. Assert `res.body.createdAt` is a non-empty ISO string

## Expected Results
- 200 OK
- New JE ID assigned
- Status = "Unposted"
- createdAt timestamp present

## Coverage Notes
Covers ED-001 Create Journal Entry, RC-001 FR-2 (auto-assign ID), FR-6 (default Unposted), AC-4 (new entry shows Unposted).
