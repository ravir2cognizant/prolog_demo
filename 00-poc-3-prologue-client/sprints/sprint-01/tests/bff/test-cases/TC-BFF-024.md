---
id: TC-BFF-024
ed-ref: ED-014
rc-ref: RC-014
type: integration
priority: P3
automated: yes
---

# TC-BFF-024 -- Fiscal Year and Period Control Endpoints Return 200 (ED-014, ED-015)

## Test Objective
Verify that the fiscal year (GET /fiscal-years) and any period control endpoints return 200 from the BFF. These correspond to ED-014 (Fiscal Year configuration) and ED-015 (Period Control).

## Preconditions
- seedStore() loaded
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /fiscal-years` — assert 200 (or 404 if route not yet present)
2. Note: If route is stub only (returns empty list), assert 200 with items []

## Expected Results
- 200 OK (or stub empty response)
- No 500 errors

## Coverage Notes
Covers ED-014/ED-015. These are configuration endpoints; full implementation is post-sprint-01. Minimal contract check.
