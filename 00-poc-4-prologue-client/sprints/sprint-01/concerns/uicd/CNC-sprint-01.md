# CNC — UI Component Design Concerns
Sprint: sprint-01
Agent: A-03b
Date: 2026-05-23

## No Blocking Concerns

No new design-blocking CNC concerns were raised during T-003b component inventory production.

## Deferred Items (tracked via open questions, not CNC)

The following items affect CI-009 and CI-010 but are already tracked as open questions
in the orchestrator manifest. They do not block the design of CI-001..CI-008.

| Item | Tracked As | Impact |
|------|-----------|--------|
| Source Document field type | OQ-011 | CI-009 deferred; no components defined |
| GL Import mechanism | OQ-012 | CI-010 deferred; no components defined |

## Non-blocking Design Notes

1. **OQ-004b (Company ID lock):** CompanyIdSelect (CI-008) defaults to `disabled` in edit mode
   as the conservative choice. If OQ-004b resolves to "mutable", enable the field.

2. **OQ-007 (Multi-currency):** CurrencySelect (CI-004) is present per line but currently
   treated as single-currency (all lines default to entry base currency). If multi-currency
   is confirmed, a currency fetch endpoint will be needed and a CurrencySelect options list
   will require a reference endpoint (not yet in ED-004).

3. **OQ-001b (Balanced flag recalculation trigger):** BalancedIndicator (CI-002) is designed
   to refresh on save response. If the server recalculates on every line edit, it will simply
   refresh more frequently — no component change required.
