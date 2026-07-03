---
id: TR-BFF-030
tc-ref: TC-BFF-030
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-030 -- Malformed Payloads Return 400, Not 500

## Verdict: PASS

## Evidence
```
✓ TC-BFF-030: Malformed payloads are handled gracefully > POST /journal-entries with wrong type on companyId returns 400
✓ TC-BFF-030: Malformed payloads are handled gracefully > POST /accounts with invalid type enum returns 400
✓ TC-BFF-030: Malformed payloads are handled gracefully > POST /journal-entries with oversized description returns 400
```
Three fuzz scenarios all returned 400, not 500:
- `companyId: 12345` (number instead of string) → 400
- accounts `type: 'unknown-type'` (invalid enum) → 400
- description of 501 chars → 400

## Notes
asyncHandler + Zod error boundary confirmed. No unhandled 500s from malformed input.
