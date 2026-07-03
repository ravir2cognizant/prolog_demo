---
id: TC-FE-025
rc-ref: RC-006
ci-ref: CI-006
type: unit
priority: P1
automated: yes
---

# TC-FE-025 — Audit Fields Are Read-Only and Cannot Be Edited

## Scenario
The four audit fields (Edit Date/Time, Edit User ID, Posted Date/Time, Poster User ID) render as read-only and cannot be modified by the user.

## Preconditions
- AuditFieldGroup rendered with a posted JE

## Steps
1. Render `<AuditFieldGroup editDateTime="2026-05-23T10:00:00Z" editUserId="User1" postedDateTime="2026-05-23T12:00:00Z" posterUserId="Supervisor1" />`
2. Assert all 4 field elements have `readonly` or `disabled` attribute (or are rendered as `<dd>` text, not `<input>`)
3. Attempt to type into Edit Date/Time field
4. Assert the value does not change

## Expected Result
- All 4 audit fields are non-editable
- Values display correctly from props
- No `<input>` without readonly/disabled for audit fields

## Test Data
- editDateTime: "2026-05-23T10:00:00Z"
- editUserId: "User1"
- postedDateTime: "2026-05-23T12:00:00Z"
- posterUserId: "Supervisor1"
