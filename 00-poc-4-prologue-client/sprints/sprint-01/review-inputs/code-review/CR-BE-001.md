---
id: CR-BE-001
category: code-review
owner: A-05
severity: medium
location: app/backend/src/services/journal-entry.service.ts:155-157
reviewer: "A-06"
date: 2026-05-24
---

## Comment

`postJournalEntry` throws `badRequest` (HTTP 400) when the journal entry is already posted. ED-006 and the route's documented responses both declare HTTP 409 Conflict for this scenario (`409: conflict`). A "resource already in a terminal state" is a semantic conflict, not a bad request.

```ts
// journal-entry.service.ts:155-157
if (je.status === 'Posted') {
  throw badRequest('Journal entry is already posted');  // ← wrong: should be conflict()
}
```

The `conflict()` factory already exists in `util/errors.ts:22`:
```ts
export const conflict = (msg: string): AppError => new AppError(409, msg);
```

This discrepancy means a client that expects 409 to distinguish "already posted" from "validation error" (400) will not be able to tell them apart. TC-BFF test cases covering ED-006 will test for 409 and may fail.

## Suggested fix

```ts
// journal-entry.service.ts:155-157
if (je.status === 'Posted') {
  throw conflict('Journal entry is already posted');  // 409 — matches ED-006
}
```

One-line change. Import `conflict` alongside the existing imports at the top of `journal-entry.service.ts`.
