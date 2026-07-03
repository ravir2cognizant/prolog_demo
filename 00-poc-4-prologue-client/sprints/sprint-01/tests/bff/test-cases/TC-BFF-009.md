---
id: TC-BFF-009
ed-ref: ED-003
rc-ref: RC-003
type: integration
priority: P1
automated: yes
---

# TC-BFF-009 — POST /journal-entries Returns 400 on Missing Required Fields

## Scenario
POST /journal-entries with missing required fields (companyId, journalEntryType, transactionDate, description) returns 400 with a field-specific error.

## Preconditions
- BFF running; authenticated

## Steps
1. POST with missing `companyId` → assert 400; assert `field: "companyId"` in error
2. POST with missing `journalEntryType` → assert 400
3. POST with missing `transactionDate` → assert 400
4. POST with missing `description` → assert 400
5. POST with empty `description` (`""`) → assert 400
6. POST with all required fields → assert 201

## Expected Result
- Missing any required field: `400 Bad Request` with `{ "error": "...", "field": "[fieldName]" }`
- All fields present: `201 Created`

## Test Data
- Partial payloads missing one required field each
