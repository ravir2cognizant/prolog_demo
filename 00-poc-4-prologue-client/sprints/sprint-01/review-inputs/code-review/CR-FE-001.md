---
id: CR-FE-001
category: code-review
owner: A-04
severity: high
location: app/frontend/src/features/journal-entry/JEHeaderPage.tsx:30, JEListPage.tsx:19, JEFormPage.tsx:79-95
reviewer: "A-06"
date: 2026-05-24
---

## Comment

Route-level page components (`JEHeaderPage`, `JEListPage`, `JEFormPage`) load their initial data using `useEffect` + `apiClient` calls instead of React Router 7 loaders. The frontend checklist explicitly requires: "All data fetching uses React Router loaders — no useEffect + fetch pattern."

**JEHeaderPage.tsx:30** — `useEffect(() => { apiClient.getJournalEntry(id).then(...) }, [params.journalId, reloadKey])`
**JEListPage.tsx:19** — `useEffect(() => { apiClient.getNavigationContext(1).then(...) }, [])`
**JEFormPage.tsx:79-95** — Two `useEffect` hooks: one for companies+types, one for existing JE on edit.

This pattern bypasses React Router's built-in data lifecycle (cancellation, deduplication, streaming). On slow connections it causes a blank initial render (loading spinner) instead of a deferred render that React Router loaders enable.

Note: Sub-component level fetches (`RecordNavToolbar`, `LineItemsGrid` CRUD) are legitimately outside the loader pattern and are not flagged.

## Suggested fix

Move initial data loading to route loaders in `routes.tsx`:

```tsx
// routes.tsx
{
  path: 'gl/journal-entries/:journalId',
  loader: async ({ params }) =>
    apiClient.getJournalEntry(Number(params.journalId)),
  element: <JEHeaderPage />,
}
```

In `JEHeaderPage`, replace `useEffect` + `useState` with `useLoaderData<JournalEntryFull>()`.
For post-save re-validation, use `useRevalidator()` from React Router instead of `reloadKey` state.

Apply the same pattern to `JEListPage` (loader fetches navigation context) and `JEFormPage` (loader fetches companies + types; edit loader also fetches existing JE).
