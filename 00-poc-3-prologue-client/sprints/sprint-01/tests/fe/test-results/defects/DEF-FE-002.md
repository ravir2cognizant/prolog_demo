---
id: DEF-FE-002
test-case: TC-FE-002
owner: test-case-bug
severity: info
location: app/frontend/src/test/ (test suite)
reporter: "A-07"
date: 2026-05-21
status: open
---

# DEF-FE-002 -- Test Coverage Gap: 22 of 30 TC-FE Cases Not Yet Automated

## Description
The T-009 test plan produced 30 TC-FE test case specifications. The current Vitest test suite in `app/frontend/src/test/` has 11 tests across 3 test files, covering only a subset of the plan:

**Covered (PASS):** TC-FE-001 (partial), TC-FE-003 (partial), TC-FE-005 (partial), TC-FE-007 (full)

**Not automated (NOT_RUN):** TC-FE-002, TC-FE-004, TC-FE-006, TC-FE-008 through TC-FE-024 (unit/integration), TC-FE-025, TC-FE-026 (e2e — requires Playwright), TC-FE-027, TC-FE-028

**Deferred (SKIPPED):** TC-FE-029, TC-FE-030 (visual, `automated: no`)

## High-Risk NOT_RUN Cases
- TC-FE-002 (POST save path for JE creation)
- TC-FE-023 (Post action endpoint + status update)
- TC-FE-018 (Account maintenance CRUD)
- TC-FE-025, TC-FE-026 (E2E happy paths — need Playwright)

## Owner Classification
`test-case-bug` — this is a test coverage gap in the test suite itself, not a defect in the application implementation. Tests need to be written.

## Rework Required
NO — test coverage expansion is a quality improvement, not a sprint blocker for POC. Manual smoke testing of high-risk paths is recommended before demo.
