# UI Style Outputs -- sprint-01

A-03 (UI Component Designer) writes the COMPILED UI style system here during
T-003. A-04 (Frontend Developer) reads from here during T-004 to scaffold
app\frontend\ styling (Tailwind config, CSS variables, design tokens, etc.).

## Expected contents (written by A-03)
- `tokens.json` (or `.css`) -- design tokens: colour scales, spacing, typography,
  shadows, radii, breakpoints, motion durations / easings.
- `style-system.md` -- prose description of style-system rules: how tokens
  compose, when to use which scale, brand-voice constraints, motion / a11y rules.
- `tailwind.theme.json` (or partial config) -- proposed Tailwind theme additions
  / overrides for A-04 to merge into app\frontend\tailwind.config.
- `components.css` (optional) -- shared utility classes / base styles that are
  not component-specific (e.g. focus-ring helpers, container queries).

## Read-only contract for A-04
A-04 READS from here; it does not write. Frontend code generation consumes
the tokens / theme / utility files and the style-system.md rules.

## Design data, not implementation code
This folder holds design data only: tokens, theme config, utility CSS, prose
style rules. No JSX, no React components, no business logic. Component
implementation lives in app\frontend\ and is owned by A-04.

## Source -- inputs that feed this output
A-03 produces ui-style-outputs by reading:
- sprints\sprint-01\ui-style-inputs\ (human-populated; brand guidelines, wireframes,
  CSS/SCSS/JSON tokens, etc.)
- sprints\sprint-01\req-outputs\ (component-level usage signals)
- sprints\sprint-01\req-inputs\ (source mockups)
