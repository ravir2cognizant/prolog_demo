---
id: TC-BFF-023
ed-ref: ED-009
rc-ref: RC-009
type: integration
priority: P3
automated: yes
---

# TC-BFF-023 -- Stub/Configuration Reference Data Endpoints Return 200 (ED-009 to ED-013)

## Test Objective
Verify that the stub reference data GET endpoints for Allocation Methods, Source Documents, Journal Entry Types, Companies, and Currencies all return 200 with `items` arrays. These correspond to ED-009 through ED-013 configuration sub-topics.

## Preconditions
- seedStore() loaded
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /allocation-methods` — assert 200, items array
2. `GET /source-documents` — assert 200, items array
3. `GET /journal-entry-types` — assert 200, items array
4. `GET /companies` — assert 200, items array
5. `GET /currencies` — assert 200, items array

## Expected Results
- All five return 200 OK with non-empty items arrays

## Coverage Notes
Covers reference data endpoints for ED-009 (Allocation Methods), ED-010 (Source Documents), ED-011 (Journal Entry Types), ED-012 (Companies), ED-013 (Currencies). RC-009 through RC-013 stubs.
