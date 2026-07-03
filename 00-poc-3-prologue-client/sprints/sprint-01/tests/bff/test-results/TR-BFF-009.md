---
id: TR-BFF-009
tc-ref: TC-BFF-009
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-009 -- GET /source-documents and /allocation-methods

## Verdict: PASS

## Evidence
```
✓ TC-BFF-009: GET /source-documents and /allocation-methods > source-documents returns code + name items
✓ TC-BFF-009: GET /source-documents and /allocation-methods > allocation-methods returns id + name items
```
Both endpoints returned 200. source-documents: `code` + `name`. allocation-methods: `id` + `name`.

## Notes
Public endpoints. Both have seed data present.
