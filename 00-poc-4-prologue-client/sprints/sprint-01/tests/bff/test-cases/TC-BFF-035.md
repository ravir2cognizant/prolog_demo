---
id: TC-BFF-035
ed-ref: ED-004
rc-ref: RC-004
type: integration
priority: P1
automated: yes
---

# TC-BFF-035 — POST /lines Returns 403 on Posted Journal Entry

## Scenario
POST /journal-entries/{journalId}/lines on a Posted JE returns 403 — posted entries cannot be edited.

## Preconditions
- Seeded Posted JE with journalId=2

## Steps
1. `POST /journal-entries/2/lines` with a valid line payload
2. Assert status 403
3. Assert `{ "error": "Forbidden" }`

## Expected Result
- `403 Forbidden`
- No line added to Posted JE

## Test Data
- journalId: 2 (Posted JE)
