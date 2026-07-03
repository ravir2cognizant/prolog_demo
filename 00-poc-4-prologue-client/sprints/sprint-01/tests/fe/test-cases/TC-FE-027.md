---
id: TC-FE-027
rc-ref: RC-006
ci-ref: CI-006
type: a11y
priority: P2
automated: yes
---

# TC-FE-027 — Status Badge Communicated to Screen Readers (Not Only Visual)

## Scenario
The StatusBadge communicates its value to screen readers as text, not only through colour, so users with visual impairments understand the entry status.

## Preconditions
- StatusBadge rendered with both "Unposted" and "Posted" variants

## Steps
1. Render `<StatusBadge status="Unposted" />`
2. Assert badge element contains visible or screen-reader text "Unposted" (not aria-hidden)
3. Assert badge does NOT rely solely on background colour for meaning
4. Run axe-core scan on badge element
5. Assert zero violations

### Posted variant:
6. Render `<StatusBadge status="Posted" />`
7. Assert text "Posted" is present and not aria-hidden
8. Run axe-core; assert zero violations

## Expected Result
- Status text is always present (not just colour)
- Zero axe-core violations for either variant

## Test Data
- StatusBadge with `status="Unposted"` and `status="Posted"`
