---
id: CR-BE-002
category: code-review
owner: A-05
severity: info
location: app/backend/src/controllers/asyncHandler.ts:19-22
reviewer: "A-06"
date: 2026-05-24
---

## Comment

`asyncHandler.ts:19-22` has a redundant if/else structure where both branches execute identical code (`res.json(result)`):

```ts
if (!res.statusCode || res.statusCode === 200) {
  res.json(result);
} else {
  res.json(result);   // ← identical — dead code
}
```

No behavioral impact. The intent was likely to handle 201 Created differently (e.g. `res.status(201).json(result)`), but since route handlers call `res.status(201)` before returning the result, `res.json()` correctly preserves the already-set status code. The condition is therefore unnecessary.

## Suggested fix

Simplify to a single call:
```ts
.then((result) => {
  if (res.headersSent) return;
  if (result === undefined) return;
  res.json(result);
})
```

This is Info — no rework required. Address opportunistically if the file is touched in T-007.
