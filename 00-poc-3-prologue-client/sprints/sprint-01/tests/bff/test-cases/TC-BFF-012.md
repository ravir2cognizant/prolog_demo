---
id: TC-BFF-012
ed-ref: ED-002
rc-ref: RC-002
type: integration
priority: P2
automated: yes
---

# TC-BFF-012 -- GET /currencies Returns Items with code, name, isBase

## Test Objective
Verify that `GET /currencies` returns 200 with items containing `code`, `name`, and `isBase` per ED-002 response model.

## Preconditions
- seedStore() loaded with currencies
- AUTH_DEV_BYPASS=1

## Test Steps
1. `GET /currencies`
2. Assert `res.status === 200`
3. Assert `res.body.items` length > 0
4. Assert each item has `code`, `name`, `isBase`
5. Assert at least one item has `isBase: true`

## Expected Results
- 200 OK with currency list
- At least one base currency present

## Coverage Notes
Covers ED-002 List Currencies, RC-002 FR-7 (currency per line), FR-1 (Currency ID dropdown).
