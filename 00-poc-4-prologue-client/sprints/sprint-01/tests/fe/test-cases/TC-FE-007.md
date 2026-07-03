---
id: TC-FE-007
rc-ref: RC-002
ci-ref: CI-002
type: a11y
priority: P2
automated: yes
---

# TC-FE-007 — JE Header Read-Only Fields Have Accessible Labels

## Scenario
All ReadOnlyField components in the JE header use accessible `<dt>/<dd>` or `<label>` markup so screen readers can announce field names alongside values.

## Preconditions
- JournalEntryHeader rendered with a complete JE data object

## Steps
1. Render `<JournalEntryHeader journalEntry={completeJE} />`
2. Run axe-core scan on the rendered header
3. Verify each field value is associated with its label (via `<dl>/<dt>/<dd>` pattern or `aria-labelledby`)
4. Verify no axe-core violations (level AA)

## Expected Result
- Zero axe-core violations at WCAG AA level
- Every field label is programmatically associated with its value
- Status badge communicates status as text (not only as colour)

## Test Data
- `completeJE`: all 16 fields populated
