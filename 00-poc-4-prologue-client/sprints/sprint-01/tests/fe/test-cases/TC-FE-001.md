---
id: TC-FE-001
rc-ref: RC-001
ci-ref: CI-001
type: unit
priority: P1
automated: yes
---

# TC-FE-001 — Nav Menu Renders All Top-Level Sections with Active State

## Scenario
AppSidebar renders the full GL navigation tree; the active item is visually distinguished.

## Preconditions
- `navItems` prop includes all required top-level sections (as specified in RC-001 FR-3)
- `currentRoute` is set to `/journal-entry`

## Steps
1. Render `<AppSidebar navItems={mockNavItems} currentRoute="/journal-entry" />`
2. Check that all required top-level section labels are present in the DOM
3. Check that the "Journal Entry Financial & Statistical" item has the active CSS class (`.nav-item--active`)
4. Check that no other item has `.nav-item--active`

## Expected Result
- All 9 top-level sections from RC-001 FR-3 are rendered
- Exactly one item has `.nav-item--active` class (the current route item)
- Active item has a distinct visual indicator (green left border via CSS token)

## Test Data
```ts
const mockNavItems = [
  { id: '1', label: 'General Ledger', route: '/gl', level: 0, alertState: 'none', enabled: true },
  { id: '2', label: 'Chartfield Processing', route: '/chartfield', level: 0, alertState: 'none', enabled: true },
  { id: '3', label: 'Account Maintenance and Inquiry', route: '/accounts', level: 0, alertState: 'none', enabled: true },
  { id: '4', label: 'Journal Entry Financial & Statistical', route: '/journal-entry', level: 0, alertState: 'none', enabled: true },
  { id: '5', label: 'Journal Entry Processing', route: '/je-processing', level: 0, alertState: 'none', enabled: true },
  { id: '6', label: 'Accruals/Projects', route: '/accruals', level: 0, alertState: 'none', enabled: true },
  { id: '7', label: 'Financial Report Designer', route: '/reports', level: 0, alertState: 'none', enabled: true },
  { id: '8', label: 'Fiscal Year / Period Control', route: '/fiscal', level: 0, alertState: 'none', enabled: true },
  { id: '9', label: 'Import Transaction Download', route: '/import', level: 0, alertState: 'none', enabled: true },
]
```
