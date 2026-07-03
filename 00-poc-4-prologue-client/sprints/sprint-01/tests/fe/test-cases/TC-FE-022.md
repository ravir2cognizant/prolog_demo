---
id: TC-FE-022
rc-ref: RC-005
ci-ref: CI-005
type: a11y
priority: P1
automated: yes
---

# TC-FE-022 — Difference Row Has aria-live; Announces "Unbalanced" to Screen Readers

## Scenario
The DifferenceRow element uses `aria-live="polite"` so that screen readers announce changes to the balance state. When unbalanced, a visually-hidden "unbalanced" text is also present.

## Preconditions
- LineItemsGridFooter rendered

## Steps
### Unbalanced state:
1. Render `<LineItemsGridFooter totalDebits={1500} totalCredits={1435} />`
2. Assert DifferenceRow element has `aria-live="polite"` attribute
3. Assert a `.sr-only` (visually hidden) element with text "unbalanced" is present

### Balanced state:
4. Render `<LineItemsGridFooter totalDebits={1435} totalCredits={1435} />`
5. Assert `aria-live="polite"` still present (always live, not added conditionally)
6. Assert no "unbalanced" sr-only text

## Expected Result
- `aria-live="polite"` always present on DifferenceRow
- `sr-only` "unbalanced" text present only when unbalanced

## Test Data
- Balanced: totalDebits=1435, totalCredits=1435
- Unbalanced: totalDebits=1500, totalCredits=1435
