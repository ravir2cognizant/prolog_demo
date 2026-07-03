# A-03b -- UI Component Inventory -- Skills
# Version: 1.0 (stub -- expand later)

## Component Decomposition Approach
1. For each RC-###.md, identify all UI surfaces (screens, modals, side panels, banners).
2. Decompose each surface into composable React-component candidates: containers, controls,
   feedback, navigation, layout.
3. Tag each component with `kind` = atom | molecule | organism | template | page (loose
   atomic-design taxonomy -- a coordination aid, not a strict rule).

## Required fields per component (CI-###.md)
- name -- PascalCase
- kind -- atom | molecule | organism | template | page
- purpose -- one-line
- props -- table of name / type / required / default / description
- states -- default, hover, focus, active, disabled, loading, error (omit if N/A)
- events -- onClick, onChange, onSubmit, etc.
- validation rules -- per field, if a form component
- accessibility -- WCAG AA: keyboard nav, ARIA roles, focus order, contrast ratio,
  screen-reader announcements, motion-reduction
- token references -- which tokens.json keys it consumes
- RC traceability -- list of RC-### IDs this component services

## Verification gate before reporting complete
- Every RC has at least one CI mentioning it
- Every CI has Components, States, Accessibility sections
- All listed token references exist in `ui-style-outputs/tokens.json`
- No TBD placeholders left
