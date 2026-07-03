# T-003b — A-03b UI Component Inventory Briefing
Prepared by: A-00 Orchestrator
Date: 2026-05-23
Sprint: sprint-01

## Gate Status
T-GATE: COMPLETE. T-003a: COMPLETE. T-003b is cleared to proceed.
H-03b hook result: PROCEED

## Task Assignment
Task: T-003b
Agent: A-03b UI Component Inventory
RC input path:     sprints\sprint-01\req-outputs\        (RC-001..RC-010)
Style input path:  sprints\sprint-01\ui-style-outputs\  (tokens.json, tailwind.theme.json, style-system.md, components.css)
Output path:       sprints\sprint-01\component-inventory\
Concerns path:     sprints\sprint-01\concerns\uicd\
In-scope RC cards: RC-001..RC-008 (full inventory)
Deferred cards:    RC-009, RC-010 (stub-only — pending OQ-011, OQ-012)

## Validator Requirements
Each CI-###.md MUST contain:
- A section heading with "Component" (case-insensitive)
- A section heading with "State" (case-insensitive)
- A section heading with "Accessibility", "a11y", or "WCAG" (case-insensitive)
- At least one RC-### reference in the body
- NO word "TBD" anywhere in the body (use "pending OQ-NNN" instead)

## Style System Available (A-03a outputs)
Key token namespaces to reference in CI files:
- colors: brand.navy, brand.green, brand.blue, brand.blueActive, neutral.grey*, semantic.*
- spacing: layout.*, component.inputHeight (44px), component.navItemPaddingY (10px)
- typography: fontFamily.sans/mono, fontSize.sm/base/xl/2xl, fontWeight.semibold/bold
- borderRadius: sm(4px), md(6px), lg(8px), xl(12px), full(9999px)
- shadows: card (md), modal (lg)
- motion: duration.fast(150ms), duration.normal(200ms), easing.ease
- Data grid styles: defined in components.css (.data-grid, .data-grid tfoot, .data-grid-difference-row--unbalanced)
- Form styles: .form-input, .form-input--readonly, .form-input--error, .form-label, .form-group

## Key Design Decisions from T-002 (BFF endpoints, for component prop typing)
- GET /journal-entries/{journalId} returns: header fields + lines[] array + totals{totalDebits, totalCredits, difference} + balanced boolean
- LineItem shape: lineId, lineNumber, accountCode(string), accountDescription(string), currencyId, debitAmount, creditAmount, description, referenceNumber
- NavItem shape: id, label, route, level(0|1), parentId, alertState(boolean), enabled(boolean)
- Company shape: companyId, companyName, displayLabel
- Navigation context: firstJournalId, previousJournalId, nextJournalId, lastJournalId, isFirst, isLast
- POST /journal-entries/{journalId}/post transitions Unposted→Posted; validation: must be balanced
- Account lookup: GET /accounts/{accountCode} returns accountDescription + isValid + segment1..5

## Resolved Items Relevant to Components
- HB-001 (Balanced field): system-calculated, NOT user-editable → render as read-only badge, not input
- HB-002 (Chartfield): 5-segment code S1-S2-S3-S4-S5 (S1=Country); monospace font for account code display
- RC-005: balance totals are client-side real-time calculation; Difference row turns red when non-zero
- RC-006: audit fields (editDateTime, editUserId, postedDateTime, posterUserId) are read-only

## Open Questions Affecting Component Design
- OQ-001b: Balanced flag recalculation trigger → design Balanced indicator as server-refreshed-on-save
- OQ-004: Which fields lock after initial save (e.g. Company ID) → make Company ID read-only after creation
- OQ-007: Multi-currency per line → currencyId field present per line but enforcement TBD (note as pending, no "TBD" word)
- OQ-008: Line number renumbering after delete → lineNumber is display-only, auto-assigned
- OQ-010: Navigation ordering → expose sortField/sortOrder as optional params on navigation component

## DoD Checklist
- [ ] CI-001.md through CI-010.md present in component-inventory/
- [ ] Each CI-001..008 has Components + States + Accessibility sections
- [ ] Each CI file references its corresponding RC-###
- [ ] No "TBD" anywhere in any CI body
- [ ] CI-009, CI-010 are deferred stubs (valid structure, deferred status noted)
- [ ] CNC-sprint-01.md written in concerns/uicd/ if any concerns raised
- [ ] V-03b-ci-schema + V-shared-rc-ci-coverage post-check passes
