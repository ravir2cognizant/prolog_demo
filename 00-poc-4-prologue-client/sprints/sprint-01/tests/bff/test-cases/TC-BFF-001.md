---
id: TC-BFF-001
ed-ref: ED-001
rc-ref: RC-001
type: integration
priority: P1
automated: yes
---

# TC-BFF-001 — GET /navigation/menu Returns NavItem Array with Required Fields

## Scenario
Authenticated GET /navigation/menu returns HTTP 200 with a flat array of NavItem objects containing all required fields.

## Preconditions
- BFF running; user authenticated
- Seeded nav items in the database (or stub data in service layer)

## Steps
1. `GET /navigation/menu` with valid Bearer token
2. Assert status 200
3. Assert response body has `items` array with at least 1 element
4. Assert first item has all required fields: `id`, `label`, `route`, `level` (0 or 1), `parentId`, `alertState`, `enabled`
5. Assert no item is missing any required field

## Expected Result
- `200 OK`
- `items[0].level` is `0` or `1`
- `items[0].alertState` is boolean
- `items[0].enabled` is boolean

## Test Data
- seed.ts pending — A-05 writes factory; use direct db seed or stub
