---
id: TC-BFF-004
ed-ref: ED-002
rc-ref: RC-002
type: integration
priority: P1
automated: yes
---

# TC-BFF-004 — GET /journal-entries/{journalId} Returns All 16 Header Fields + Lines + Totals

## Scenario
Authenticated GET /journal-entries/{journalId} returns HTTP 200 with all required response fields: all 16 JE header fields, `lines` array, and `totals` object.

## Preconditions
- BFF running; seeded JE with journalId=1 (Unposted, balanced)

## Steps
1. `GET /journal-entries/1` with valid Bearer token
2. Assert status 200
3. Assert all 16 header fields present:
   journalId, companyId, companyName, journalEntryType, journalNumber, status,
   transactionDate, editDateTime, editUserId, autoReversalDate, description,
   postingSession, sourceDocument, glImport, allocationMethodId, balanced,
   postedDateTime, posterUserId
4. Assert `lines` is an array
5. Assert `totals` has fields: `totalDebits`, `totalCredits`, `difference`

## Expected Result
- `200 OK`
- All required fields present
- `balanced` is boolean (system-calculated, ED-002 design note)
- `postedDateTime` is null for Unposted entry

## Test Data
- journalId: 1 (seeded Unposted JE)
