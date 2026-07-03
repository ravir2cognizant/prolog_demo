---
id: TC-BFF-032
ed-ref: ED-007
rc-ref: RC-007
type: integration
priority: P2
automated: yes
---

# TC-BFF-032 — GET /navigation Accepts sortField and sortOrder Query Parameters

## Scenario
GET /journal-entries/{journalId}/navigation accepts optional sortField and sortOrder query parameters without errors.

## Preconditions
- Seeded JEs; journalId=2 is middle

## Steps
1. `GET /journal-entries/2/navigation?sortField=journalNumber&sortOrder=asc` → assert 200
2. `GET /journal-entries/2/navigation?sortField=transactionDate&sortOrder=desc` → assert 200
3. `GET /journal-entries/2/navigation?sortField=INVALID` → assert 400 (invalid value)

## Expected Result
- Valid sortField values: 200
- Invalid sortField: 400 with field error

## Test Data
- sortField: "journalNumber", "transactionDate", "editDateTime" (valid); "INVALID" (invalid)
