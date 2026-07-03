---
id: CR-FE-002
category: code-review
owner: A-04
severity: high
location: app/frontend/src/features/journal-entry/JEFormPage.tsx:121-153, StatusAuditPanel.tsx:27-38
reviewer: "A-06"
date: 2026-05-24
---

## Comment

Mutations (create/update journal entry, post journal entry) are invoked directly from event handlers via `apiClient` calls, not through React Router Form+action pattern. The frontend checklist requires: "All mutations use React Router actions — no direct API calls from click handlers."

**JEFormPage.tsx:121** — `handleSubmit(async (values) => { await apiClient.createJournalEntry(...) })` — direct call in submit handler.
**JEFormPage.tsx:136** — `await apiClient.updateJournalEntry(...)` — direct call in submit handler.
**StatusAuditPanel.tsx:31** — `await apiClient.postJournalEntry(entry.journalId)` — direct call in click handler.

Direct handler mutations bypass React Router's action lifecycle: pending UI state (`useNavigation().state === 'submitting'`), revalidation, and optimistic UI updates.

## Suggested fix

Define route actions alongside loaders:

```tsx
// routes.tsx
{
  path: 'gl/journal-entries/new',
  action: async ({ request }) => {
    const formData = await request.formData();
    return apiClient.createJournalEntry(Object.fromEntries(formData));
  },
  element: <JEFormPage mode="create" />,
}
```

In `JEFormPage`, replace `useForm` + custom submit with React Router `<Form method="post">` and `useActionData()` for error display. Use `useNavigation().state` for the submitting-disabled state.

For `StatusAuditPanel`, use a `useFetcher()` fetcher with a dedicated `POST /journal-entries/:id/post` action on the parent route or a sub-route.
