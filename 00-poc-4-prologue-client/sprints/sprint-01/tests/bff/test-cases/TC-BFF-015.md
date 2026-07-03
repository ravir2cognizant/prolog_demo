---
id: TC-BFF-015
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-015 — GET /reference/journal-entry-types Returns Types Array

## Scenario
GET /reference/journal-entry-types returns 200 with an array of JournalEntryType objects.

## Preconditions
- BFF running; authenticated
- At least 1 type seeded (e.g. typeCode="FJ", typeLabel="Finance Journal")

## Steps
1. `GET /reference/journal-entry-types` with valid Bearer token
2. Assert status 200
3. Assert response has `types` array with ≥ 1 element
4. Assert `types[0]` has: `typeCode` (string), `typeLabel` (string)

## Expected Result
- `200 OK`
- Types array correctly shaped

## Test Data
- Seeded: `{ typeCode: "FJ", typeLabel: "Finance Journal" }`
