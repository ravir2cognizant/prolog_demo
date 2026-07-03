---
id: TC-FE-013
rc-ref: RC-003
ci-ref: CI-003
type: a11y
priority: P2
automated: yes
---

# TC-FE-013 — Inline Validation Errors Are Accessible; Focus Moves to First Error

## Scenario
When the create form is submitted with missing required fields, inline errors are associated with their inputs via `aria-describedby`; focus moves to the first errored field.

## Preconditions
- JournalEntryForm in create mode; all fields empty

## Steps
1. Render `<JournalEntryForm mode="create" />`
2. Click Save button
3. Assert focus moves to the Company ID field (first required field)
4. Assert Company ID input has `aria-invalid="true"`
5. Assert error message element has an `id` that matches the input's `aria-describedby`
6. Run axe-core scan on the form with errors displayed
7. Assert zero axe-core violations

## Expected Result
- Focus lands on first invalid field after failed submit
- `aria-invalid="true"` on each invalid input
- Each error message linked via `aria-describedby`
- Zero axe-core violations (AA)

## Test Data
- Standard mock companies and types reference data
