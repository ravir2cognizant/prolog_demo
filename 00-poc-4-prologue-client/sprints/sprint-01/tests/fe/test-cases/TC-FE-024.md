---
id: TC-FE-024
rc-ref: RC-006
ci-ref: CI-006
type: unit
priority: P1
automated: yes
---

# TC-FE-024 — PostEntryButton Hidden When status = "Posted"

## Scenario
The PostEntryButton is not rendered (display: none or null) when the journal entry status is "Posted", since there is nothing to post.

## Preconditions
- PostEntryButton component

## Steps
1. Render `<PostEntryButton isBalanced={true} status="Posted" onPost={mockPost} />`
2. Assert button is NOT present in the DOM (or has `display: none`)
3. Assert `mockPost` cannot be triggered

### Unposted:
4. Render `<PostEntryButton isBalanced={true} status="Unposted" onPost={mockPost} />`
5. Assert button IS present in the DOM

## Expected Result
- status="Posted": PostEntryButton not rendered
- status="Unposted": PostEntryButton rendered

## Test Data
- Two renders with different `status` prop values
