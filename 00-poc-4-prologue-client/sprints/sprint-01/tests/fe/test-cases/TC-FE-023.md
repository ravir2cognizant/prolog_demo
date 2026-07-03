---
id: TC-FE-023
rc-ref: RC-006
ci-ref: CI-006
type: unit
priority: P1
automated: yes
---

# TC-FE-023 — PostEntryButton Disabled When isBalanced = false

## Scenario
The PostEntryButton is rendered as disabled when `isBalanced` prop is false, preventing accidental posting of an unbalanced journal entry.

## Preconditions
- PostEntryButton component

## Steps
1. Render `<PostEntryButton isBalanced={false} status="Unposted" onPost={mockPost} />`
2. Assert button is in the DOM (not hidden)
3. Assert button has `disabled` attribute
4. Click the button
5. Assert `mockPost` was NOT called

### When balanced:
6. Render `<PostEntryButton isBalanced={true} status="Unposted" onPost={mockPost} />`
7. Assert button does NOT have `disabled` attribute
8. Click the button
9. Assert `mockPost` was called

## Expected Result
- `isBalanced=false`: button present but disabled; click does nothing
- `isBalanced=true`: button enabled; click triggers `onPost`

## Test Data
- mockPost: vi.fn()
