---
id: TC-FE-028
rc-ref: RC-008
type: unit
priority: P2
automated: yes
---

# TC-FE-028 -- Routing Field: Routing Rules Dropdown Populated from API

## Test Objective
Verify that the Routing dropdown in the JournalEntryPage header is populated from `GET /routing-rules` and that selecting a value persists it in the form state.

## Preconditions
- `apiClient.GET` mocked: `/routing-rules` → `{ items: [{ id: 'rr-1', name: 'GL Supervisor Approval' }] }`

## Test Steps
1. Render JournalEntryPage in create mode
2. Await ref data load
3. Assert the Routing select/dropdown contains "GL Supervisor Approval"
4. Select "rr-1"
5. Assert the form state for routing reflects "rr-1"

## Expected Results
- Routing dropdown populated from `/routing-rules`
- Selected value stored in form state

## Coverage Notes
Covers RC-008 FR-1 (Routing field in header), FR-2 (configurable routing rules), AC-5 (no routing = no approval required; conversely, routing set = approval required).
