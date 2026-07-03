# Briefing: T-003b -- UI Component Inventory (A-03b)
# Sprint: sprint-01 | Prepared by: A-00 | Date: 2026-05-21

## Task
Produce one CI-###.md component inventory per RC card (RC-001 through RC-017).
Each CI documents component decomposition, props, states, validation, accessibility,
and token references. No implementation code. No style tokens.

## Prerequisite status
- T-GATE [x] Complete (A-03b signed off RC-001--RC-017 at gate with 0 CNC concerns)
- T-003a [x] Complete (tokens.json, tailwind.theme.json, style-system.md, components.css produced)
- T-003b [ ] Ready -- UNBLOCKED

## Input files
- RC-001 through RC-017 in sprints/sprint-01/req-outputs/
- Style outputs in sprints/sprint-01/ui-style-outputs/ (tokens.json, style-system.md)

## Output location
sprints/sprint-01/component-inventory/
One CI-###.md per RC. Required sections per file:
- Components (heading must contain "Component")
- States (heading must contain "State")
- Accessibility (heading must contain "Accessib", "a11y", or "wcag")
- RC reference in body
- No TBD placeholders

## Hook
Run agentic-pipeline/hooks/H-03b-ui-component-inventory.ps1 -Sprint sprint-01 first.
Honour PROCEED / NO_CHANGE / BLOCKED.

## Post-completion validators
V-03b-ci-schema.ps1: each CI has Components + States + Accessibility sections, RC ref, no TBD
V-shared-rc-ci-coverage.ps1: every RC-001--RC-017 has at least one CI referencing it

## Orchestrator notes
T-004 (A-04 Frontend Developer) is blocked on T-002 [x] + T-003b [x].
T-002 is already [x]. After T-003b validates, T-004 is fully unblocked.
