# Briefing: T-003a -- UI Style Compiler (A-03a)
# Sprint: sprint-01 | Prepared by: A-00 | Date: 2026-05-21

## Task
Compile the Fiserv Admin Tool design system from the two reference images in
`sprints/sprint-01/ui-style-inputs/` into machine-consumable style outputs.

## Prerequisite status
- T-GATE [x] Complete (all 6 agents signed off)
- T-002 [x] Complete (BFF endpoints designed)
- T-003a [ ] Ready -- UNBLOCKED

## Input files
- `sprints/sprint-01/ui-style-inputs/Journal.png`
  Full Fiserv Admin Tool screen: header, left nav, main content form, step wizard.
- `sprints/sprint-01/ui-style-inputs/sidebar.png`
  Close-up of the left sidebar navigation.

## What to extract
Both images are from the same Fiserv Admin Tool application.
Extract colour, typography, spacing, shadow, radius, motion tokens from them.
No additional brand guidelines were supplied -- use the images as the sole source.

## Output location
`sprints/sprint-01/ui-style-outputs/`
Required: tokens.json, tailwind.theme.json, style-system.md
Optional: components.css

## Hook
Run `agentic-pipeline/hooks/H-03a-ui-style-compiler.ps1 -Sprint sprint-01` first.
Honour PROCEED / NO_CHANGE / BLOCKED without deviation.

## Orchestrator notes
T-003b (UI Component Inventory, A-03b) is blocked on T-003a [x].
After T-003a completes and is validated, signal Orchestrator to unblock T-003b.
