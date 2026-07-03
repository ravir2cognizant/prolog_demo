---
id: TC-FE-003
rc-ref: RC-001
ci-ref: CI-001
type: e2e
priority: P1
automated: yes
---

# TC-FE-003 — Nav Section Expand/Collapse and Item Click Navigation

## Scenario
Clicking a collapsed top-level nav section reveals its sub-items (expand); clicking again hides them (collapse). Clicking a sub-item navigates the main content area without full page reload.

## Preconditions
- Application loaded; GL module active
- "Journal Entry Processing" section is collapsed by default

## Steps
1. Navigate to app root in Playwright
2. Verify "Journal Entry Processing" sub-items are not visible
3. Click "Journal Entry Processing" section header
4. Verify sub-items ("Journal Entry Routing Process", "GL Control") become visible
5. Verify expand animation completes within 200ms (RC-001 NFR)
6. Click "Journal Entry Routing Process" sub-item
7. Verify main content area URL changes to the corresponding route without full page reload
8. Click "Journal Entry Processing" section header again
9. Verify sub-items are hidden

## Expected Result
- Sub-items toggle visibility on section header click
- Expand/collapse completes within 200ms (measured via `performance.now()`)
- Clicking sub-item updates main content; no full page reload (document does not reload)

## Test Data
- App with seeded nav data including "Journal Entry Processing" parent with 2 sub-items
