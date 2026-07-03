---
id: CR-FE-003
category: code-review
owner: A-04
severity: medium
location: app/frontend/src/features/journal-entry/JEHeaderPage.tsx:34,46 | JEListPage.tsx:39 | JEFormPage.tsx:114 | LineItemsGrid.tsx:57,101,120,132,146 | StatusAuditPanel.tsx:35
reviewer: "A-06"
date: 2026-05-24
---

## Comment

Multiple error and fallback strings are hardcoded in English instead of being routed through `i18next`. The frontend checklist requires: "All user-facing text uses i18next — no hardcoded strings."

Hardcoded strings found:
- `JEHeaderPage.tsx:34` — `'Invalid journal id'`
- `JEHeaderPage.tsx:46` — `'Failed to load entry'`
- `JEListPage.tsx:39` — `'Failed to load entries'`
- `JEFormPage.tsx:114` — `'Failed to load'`, `'Save failed'`
- `LineItemsGrid.tsx:57` — `'Failed to load lines'`
- `LineItemsGrid.tsx:101` — `'Lookup failed'`
- `LineItemsGrid.tsx:120` — `'Failed to save line'`
- `LineItemsGrid.tsx:132` — `'Failed to update line'`
- `LineItemsGrid.tsx:146` — `'Failed to delete line'`
- `StatusAuditPanel.tsx:35` — `'Post failed'`

The `en.json` file already contains `app.error.generic` ("Something went wrong. Please try again.") which could serve as the fallback for most of these. Specific error keys should be added for the others.

## Suggested fix

Add keys to `src/locales/en.json`:
```json
"errors": {
  "loadEntry": "Failed to load journal entry.",
  "loadList": "Failed to load journal entries.",
  "loadLines": "Failed to load line items.",
  "saveLine": "Failed to save line item.",
  "updateLine": "Failed to update line item.",
  "deleteLine": "Failed to delete line item.",
  "lookupAccount": "Account lookup failed.",
  "saveEntry": "Failed to save journal entry.",
  "postEntry": "Post failed. Please try again.",
  "invalidId": "Invalid journal entry ID."
}
```

Replace hardcoded strings with `t('errors.loadEntry')` etc. For server error messages returned by the API (e.g. `e.message`), use the API message when it exists and fall back to `t('app.error.generic')`.
