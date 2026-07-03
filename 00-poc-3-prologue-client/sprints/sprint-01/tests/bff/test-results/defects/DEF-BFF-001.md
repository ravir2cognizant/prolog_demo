---
id: DEF-BFF-001
test-case: TC-BFF-017
owner: A-05
severity: medium
location: app/backend/src/routes/journalEntries.routes.ts, app/backend/src/services/journalEntries.service.ts
reporter: A-08
date: 2026-05-21
status: open
---

# DEF-BFF-001 -- POST /reverse Response Does Not Conform to ED-005 Contract

## Summary
The `POST /journal-entries/{id}/reverse` endpoint returns the raw reversal `JournalEntry` object instead of the wrapper response specified in ED-005.

## ED-005 Specified Response (200 OK)
| Field               | Type   | Description                               |
|---------------------|--------|-------------------------------------------|
| reversalEntryId     | string | ID of newly created reversal entry        |
| reversalEntryStatus | string | Always "Unposted"                         |
| reversalDate        | string | Transaction date used for reversal        |
| originatingEntryId  | string | ID of the original entry that was reversed |

## Actual Response
The route returns the full `JournalEntry` object (with `id`, `status`, `transactionDate`, `entryType`, etc.) — not the four-field wrapper.

## Impact
- Consumers expecting the ED-005 response shape (e.g., the UI) will fail to find `reversalEntryId` and `originatingEntryId` in the response.
- The reversal is created correctly in the store; this is a response shape issue only.

## Reproduction
```typescript
POST /journal-entries/{posted-entry-id}/reverse
Body: { "reversalDate": "2026-06-01" }
Response body.reversalEntryId  // undefined — should be string
Response body.originatingEntryId  // undefined — should be the originating JE id
```

## Recommended Fix
In `journalEntries.routes.ts`, the reverse route handler should map the returned JE to the ED-005 contract:
```typescript
ah(async (req) => {
  const body = ReverseSchema.parse(req.body);
  const p = principal(req);
  const reversal = reverseJournalEntry(req.params['id']!, body.reversalDate, p.sub);
  return {
    reversalEntryId: reversal.id,
    reversalEntryStatus: reversal.status,
    reversalDate: reversal.transactionDate,
    originatingEntryId: req.params['id']!,
  };
}),
```
