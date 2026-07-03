---
id: CR-FE-004
category: code-review
owner: A-04
severity: low
location: app/frontend/src/features/journal-entry/JEListPage.tsx:62
reviewer: "A-06"
date: 2026-05-24
---

## Comment

`JEListPage.tsx:62` renders `Total: {ctx.totalCount}` with a hardcoded "Total: " prefix. This violates the "all user-facing text uses i18next" rule (same category as CR-FE-003) and is specifically called out as a separate finding because it's a display label rather than an error message.

```tsx
<p className="text-sm text-text-secondary mb-2">
  Total: {ctx.totalCount}   // ← hardcoded label
</p>
```

## Suggested fix

Add a key to `en.json`:
```json
"je": {
  ...
  "list": {
    "totalCount": "Total: {{count}}"
  }
}
```

Replace with:
```tsx
<p className="text-sm text-text-secondary mb-2">
  {t('je.list.totalCount', { count: ctx.totalCount })}
</p>
```
