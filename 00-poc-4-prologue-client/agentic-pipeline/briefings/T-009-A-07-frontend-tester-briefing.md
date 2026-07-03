# T-009 Briefing — A-07 Frontend Test Agent
Sprint: sprint-01 | Task: T-009 | Phase: Test Plan
Date: 2026-05-23 | Hook result: PROCEED

## Paths
- Input RC: `sprints\sprint-01\req-outputs\` (RC-001..010)
- Input CI: `sprints\sprint-01\component-inventory\` (CI-001..010)
- Input style: `sprints\sprint-01\ui-style-outputs\tokens.json`
- Output test cases: `sprints\sprint-01\tests\fe\test-cases\` (TC-FE-*.md)
- Output spec draft: `sprints\sprint-01\tests\fe\t009.spec.ts`

## Scope
**In scope:** RC-001..RC-008 (all OPEN — 6/6 sign-off). Produce TC-FE-### cards for each.
**Out of scope:** RC-009 (OQ-011 pending — Source Document type), RC-010 (OQ-012 pending — GL Import). CI-009/010 are deferred stubs; do not produce TCs for them.

## RC Summary (in-scope)
| RC | Title | Key Test Concerns |
|----|-------|-------------------|
| RC-001 | Navigation Menu | Nav tree renders; active state; alert dot; disabled items; keyboard nav |
| RC-002 | JE Header (read) | All 16 fields display; balanced indicator; status badge (unposted/posted) |
| RC-003 | JE Create/Edit | Create form fields + validation; Edit mode (company locked); save/cancel |
| RC-004 | Line Items | Account lookup (500ms NFR); debit/credit mutual exclusion; add/delete rows |
| RC-005 | Balance | Real-time client calc (100ms NFR); difference row red when unbalanced; totals sync on save |
| RC-006 | Status + Audit | Audit fields read-only; PostEntryButton disabled when unbalanced; hidden when Posted; post action |
| RC-007 | Record Navigation | First/Prev/Next/Last buttons; boundary disabling; keyboard accessible |
| RC-008 | Company Select | Display format "{id} - {name}"; loads within 500ms; disabled in edit mode |

## CI Design Decisions Relevant to Testing

### CI-004 Debit/Credit Mutual Exclusion
- When debitAmount > 0: creditAmount dims to 50% opacity, pointer-events: none
- When creditAmount > 0: debitAmount dims to 50% opacity, pointer-events: none
- Both empty: both active; enforced at UI level (prop) AND server validation
- Test: verify you cannot enter both debit and credit on same line

### CI-005 Balance Footer
- Client-side real-time recalculation within 100ms (RC-005 NFR)
- DifferenceRow turns red (`.data-grid-difference-row--unbalanced`) when totalDebits ≠ totalCredits
- `aria-live="polite"` on DifferenceRow; sr-only "unbalanced" text when applicable
- Server totals sync on save response (ED-002/ED-004 return `totals{}`)

### CI-006 Post Entry
- PostEntryButton: `disabled` when `isBalanced === false`
- PostEntryButton: `hidden` (display: none) when `status === "Posted"`
- Triggers POST /journal-entries/{journalId}/post; returns `{status, postedDateTime, posterUserId}`

### CI-003 Company Lock
- CompanyIdSelect defaults to `disabled` in edit mode (OQ-004b pending)
- Enabled in create mode; disabled on re-edit

### CI-008 Company Select
- Display format: `{companyId} - {companyName}` exactly (no variations)
- Loads company list within 500ms (RC-008 NFR)

### CI-002 Balanced Indicator
- Never directly editable (HB-001 resolved: system-calculated flag)
- Reflects server-returned `balanced` field from GET /journal-entries/{journalId}

### CI-007 Record Navigation
- Props: firstJournalId, previousJournalId, nextJournalId, lastJournalId (nullable)
- `isFirst` → First + Previous disabled; `isLast` → Next + Last disabled
- aria-labels must be descriptive (not just "First"/"Previous" etc.)

## Test Types Expected
- `unit` — isolated component logic (mutual exclusion, balance calc, button states)
- `integration` — component + API mocking via MSW (account lookup, company load, post action)
- `e2e` — full user flows (create JE, add lines, verify balance, post)
- `a11y` — axe-core via Playwright; focus management, aria-live, keyboard nav
- `visual` — token-based regression for badge colours, difference-row red, nav active state

## Output Format
Each TC-FE-###.md frontmatter:
```yaml
---
id: TC-FE-###
rc-ref: RC-00#
ci-ref: CI-00#
type: unit | integration | e2e | a11y | visual
priority: P1 | P2 | P3
automated: yes | no
---
```

## Spec Scaffolding (mandatory alongside TC-FE cards)
File: `sprints\sprint-01\tests\fe\t009.spec.ts`
- One `describe()` per RC/CI scope
- One `it()` stub per TC-FE card
- Stub body: arrange comment + act call + `expect(result).toBe(expectedValue)` (exact value from TC)
- Do NOT leave stubs empty

## Style Tokens (visual test references)
- Navy header: `#1A3A6B` (`.app-header`)
- Green CTA: `#2D6A2D` (`.btn-primary`)
- Blue active: `#2563EB` (`.nav-item--active` border, focus ring)
- Amber unposted badge: `.badge-unposted`
- Green posted badge: `.badge-posted`
- Unbalanced row: `.data-grid-difference-row--unbalanced` → red text (`#DC2626`)

## NFRs to Test
- Account lookup response < 500ms (RC-004)
- Balance recalculation < 100ms (RC-005)
- Company list load < 500ms (RC-008)

## DoD Checklist
- [ ] Every in-scope RC (RC-001..008) has ≥ 1 TC-FE card
- [ ] All 5 test types covered (unit, integration, e2e, a11y, visual) across the set
- [ ] P1 cases cover all acceptance criteria from every in-scope RC
- [ ] `t009.spec.ts` written with non-empty stubs
- [ ] Write `.input-hash` to `sprints\sprint-01\tests\fe\test-cases\` after writing TCs
- [ ] Report task-complete to A-00 with TC count and coverage table
