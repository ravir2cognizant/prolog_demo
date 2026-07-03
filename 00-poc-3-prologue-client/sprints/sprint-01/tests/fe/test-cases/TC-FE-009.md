---
id: TC-FE-009
rc-ref: RC-008
type: unit
priority: P2
automated: yes
---

# TC-FE-009 -- Submit for Approval Button Is Visible and Calls Correct Endpoint

## Test Objective
Verify that the "Submit for Approval" action button is rendered on the JournalEntryPage for Unposted entries, and that clicking it calls `POST /journal-entries/{id}/submit-for-approval`.

## Preconditions
- JournalEntryPage loaded with an existing Unposted entry (id = 'je-pending')
- `apiClient.POST` mocked for `/journal-entries/je-pending/submit-for-approval`
- Entry has a Routing field value set

## Test Steps
1. Render JournalEntryPage at route `/journal-entries/je-pending` with Unposted entry
2. Assert "Submit for Approval" (or equivalent label) button is present
3. Click the button
4. Assert `apiClient.POST` called with path matching `/journal-entries/je-pending/submit-for-approval`

## Expected Results
- Submit for Approval button visible for Unposted entries
- Click triggers the correct API endpoint
- No JS error thrown

## Coverage Notes
Covers RC-008 FR-3 (routing status visible in header), FR-4 (approver can act), AC-1 (entry reflects awaiting approval after submission). UI coverage for routing/approval submit path.
Note: Full approval queue UI is a stub in this sprint. This TC covers only the submit-for-approval action on the JE form.
