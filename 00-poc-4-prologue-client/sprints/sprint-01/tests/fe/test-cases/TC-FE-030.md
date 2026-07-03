---
id: TC-FE-030
rc-ref: RC-007
ci-ref: CI-007
type: a11y
priority: P1
automated: yes
---

# TC-FE-030 — Navigation Buttons Have Descriptive Accessible Labels

## Scenario
The four navigation buttons (First, Previous, Next, Last) have descriptive `aria-label` attributes so screen readers convey their purpose, not just the icon.

## Preconditions
- RecordNavigationToolbar rendered with standard props

## Steps
1. Render RecordNavigationToolbar
2. Find "First" button; assert `aria-label` contains "First journal entry" or similar descriptive text
3. Find "Previous" button; assert `aria-label` contains "Previous journal entry"
4. Find "Next" button; assert `aria-label` contains "Next journal entry"
5. Find "Last" button; assert `aria-label` contains "Last journal entry"
6. Run axe-core on toolbar; assert zero violations

## Expected Result
- All 4 buttons have descriptive `aria-label` values (not empty; not just "←" characters)
- Zero axe-core violations

## Test Data
- Standard RecordNavigationToolbar with all 4 IDs populated and isFirst=false, isLast=false
