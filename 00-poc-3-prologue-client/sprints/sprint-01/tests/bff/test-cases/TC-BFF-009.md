---
id: TC-BFF-009
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P2
automated: yes
---

# TC-BFF-009 -- GET /source-documents and GET /allocation-methods Return Seeded Items

## Test Objective
Verify that both reference data endpoints return 200 with non-empty items arrays.

## Preconditions
- seedStore() loaded
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /source-documents` — assert 200, items array length > 0, each item has `code` and `name`
2. `GET /allocation-methods` — assert 200, items array length > 0, each item has `id` and `name`

## Expected Results
- Both return 200 OK with seeded items

## Coverage Notes
Covers ED-001 List Source Documents (RC-001 FR-8), List Allocation Methods (RC-001 FR-1 allocationMethodId dropdown).
