---
id: TC-FE-029
rc-ref: RC-001
type: visual
priority: P3
automated: no
---

# TC-FE-029 -- Visual Regression: JournalEntryPage Create Mode Layout

## Test Objective
Capture and compare a visual snapshot of the JournalEntryPage in create mode to detect unintended layout regressions in header fields, lines grid, and action bar.

## Preconditions
- Playwright visual regression setup (pixelmatch or @playwright/test screenshot)
- App running at http://localhost:5173/journal-entries/new
- MSW worker serving fixture companies and ref data
- Stable test data (no timestamps, no dynamic IDs)

## Test Steps
1. Navigate to /journal-entries/new
2. Await all dropdowns to populate (companies, types loaded)
3. Take full-page screenshot
4. Compare against baseline snapshot using pixelmatch (threshold: 0.01)

## Expected Results
- Screenshot matches baseline within threshold
- No layout shift, missing fields, or broken Tailwind classes

## Coverage Notes
Visual regression baseline for RC-001 (JE header form). Tokens validated against tokens.json from T-003a. Manual review required for baseline creation.
Note: `automated: no` — requires baseline snapshot establishment in first run.
