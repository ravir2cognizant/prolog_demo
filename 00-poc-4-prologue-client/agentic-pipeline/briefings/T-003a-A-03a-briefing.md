# T-003a — A-03a UI Style Compiler Briefing
Prepared by: A-00 Orchestrator
Date: 2026-05-23
Sprint: sprint-01

## Gate Status
T-GATE: COMPLETE — T-003a is cleared to proceed.
H-03a hook result: PROCEED

## Task Assignment
Task: T-003a
Agent: A-03a UI Style Compiler
Input path: sprints\sprint-01\ui-style-inputs\
Output path: sprints\sprint-01\ui-style-outputs\
Concerns path: sprints\sprint-01\concerns\uicd\

## Input Files Available
- Journal.png — full Fiserv Admin Tool screen (Marketing / Create Campaign form)
- sidebar.png — isolated left navigation sidebar
- README.md — excluded from hash (folder readme only)

## UI Style Observations from Source Images
The following observations are provided to guide token extraction. A-03a should validate against
the images independently.

### Application: Fiserv Admin Tool
The images show a Fiserv internal Admin Tool, NOT the Prologue GL module directly.
However, they represent the design language that the Prologue Client POC should adopt.

### Color System
- **App header bar:** Deep navy blue (approx #1A3A6B or Fiserv dark blue — the exact shade from images)
- **Primary action (buttons, active steps, accents):** A dual-color brand system:
  - Blue primary: Medium-to-bright blue for step indicators (#2563EB approx)
  - Green primary: Dark forest/Fiserv green for CTAs like the "Next" button, calendar icons, and selected card borders
- **Sidebar background:** Very light grey (approx #F2F2F2 to #F8F9FA)
- **Main content background:** Off-white/light grey (approx #F5F5F5 to #FAFAFA)
- **Card/panel background:** White (#FFFFFF)
- **Form field border:** Light grey (approx #D1D5DB)
- **Text primary:** Near-black charcoal (approx #111827 to #1F2937)
- **Text secondary:** Medium grey (approx #6B7280)
- **Text placeholder:** Lighter grey (approx #9CA3AF)
- **Selected/active indicator:** Green border + green checkbox (same green as CTA)

### Typography
- **Font family:** Clean sans-serif — appears to be Inter or a similar neutral system font
- **Page title:** Bold, ~24-28px
- **Section heading ("Campaign details"):** Semibold, ~20px
- **Nav item (top-level):** Semibold/bold, ~14-16px
- **Nav item (sub-level):** Regular, ~14px
- **Form labels:** Regular, ~12px
- **Form input text:** Regular, ~14px
- **Button text:** Semibold, ~14-16px

### Spacing
- Sidebar width: ~280px
- Content area padding: ~24-32px
- Form field height: ~44-48px
- Form group vertical spacing: ~16-20px
- Nav item vertical padding: ~12px
- Card border-radius: ~8-12px
- Form field border-radius: ~6-8px
- Button border-radius: ~6-8px

### Component States
- Form focus: Blue border highlight
- Checkbox selected: Green (matches primary green)
- Button hover: Darker shade of green
- Step indicator active: Blue filled circle, bold blue label
- Step indicator inactive: Grey filled circle, grey label

## Required Outputs (validator-enforced)
1. `tokens.json` — REQUIRED — must contain: `colors`, `spacing`, `typography` categories (valid JSON)
2. `style-system.md` — REQUIRED — prose documentation of the style system
3. `tailwind.theme.json` — RECOMMENDED (warning if absent, not failure)
4. `components.css` — OPTIONAL (shared utility classes)

## DoD Checklist
- [ ] tokens.json present in ui-style-outputs/ with colors, spacing, typography keys
- [ ] style-system.md present in ui-style-outputs/
- [ ] tailwind.theme.json present in ui-style-outputs/
- [ ] No JSX, no React components, no business logic in any output file
- [ ] V-03a-tokens-schema.ps1 post-check passes

## Notes
- This is a POC environment — the style system should be practical and not over-engineered.
- If a value is not directly extractable from the source images, use a Tailwind default
  that closely matches the observed visual and note it in style-system.md.
- Prologue GL module will use a similar but distinct screen — the Journal Entry form
  uses a two-column header layout with a data grid. The style system should be general
  enough to support both admin/CTA-heavy and data-grid-heavy layouts.
