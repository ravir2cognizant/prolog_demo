---
id: TC-FE-008
rc-ref: RC-002
ci-ref: CI-002
type: visual
priority: P2
automated: yes
---

# TC-FE-008 — Status Badge Visual Token Regression

## Scenario
The Unposted badge uses the amber token and the Posted badge uses the green token. Visual regression catches any colour drift from the design token spec.

## Preconditions
- Playwright visual comparison baseline established
- Tokens: `.badge-unposted` → amber (`#D97706`); `.badge-posted` → green (`#16A34A`)

## Steps
1. Navigate to a page rendering an Unposted JE header in Playwright
2. Take screenshot of the status badge element
3. Compare against baseline (Playwright `toMatchSnapshot`)
4. Navigate to a Posted JE header
5. Take screenshot of status badge element
6. Compare against baseline

## Expected Result
- Unposted badge pixel-matches baseline (amber colouring)
- Posted badge pixel-matches baseline (green colouring)
- Any colour token change will cause the snapshot diff to fail, alerting to a regression

## Test Data
- Two seeded JE records: one Unposted, one Posted
