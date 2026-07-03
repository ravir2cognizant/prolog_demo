---
id: TC-FE-020
rc-ref: RC-001
type: a11y
priority: P2
automated: yes
---

# TC-FE-020 -- JournalEntryPage Accessibility: Labels and Keyboard Navigation

## Test Objective
Verify that all interactive form fields on JournalEntryPage have visible labels, all buttons have accessible names, and the form is navigable by keyboard (tab order). Uses axe-core / Playwright accessibility scan.

## Preconditions
- Playwright browser environment
- App running at http://localhost:5173
- Navigate to /journal-entries/new

## Test Steps
1. Navigate to /journal-entries/new
2. Run `axe.run()` on the page (or use @axe-core/playwright)
3. Assert zero `critical` or `serious` violations
4. Assert all `<select>`, `<input>`, `<textarea>` elements have associated `<label>` or `aria-label`
5. Press Tab from the page body and confirm focus moves through form fields in logical order
6. Assert all action buttons (Save, Cancel, Add Line) have discernible accessible names

## Expected Results
- axe-core reports 0 critical/serious violations
- All form fields labelled
- Tab order is logical (Company → Type → Date → Description → Lines → actions)
- No elements with empty accessible names

## Coverage Notes
Covers RC-001 NFR Accessibility ("all form fields must have visible labels; form must be keyboard-navigable"). Also covers RC-002 NFR Accessibility ("grid must be navigable by keyboard").
