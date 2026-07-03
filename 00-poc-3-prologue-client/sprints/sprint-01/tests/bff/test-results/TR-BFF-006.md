---
id: TR-BFF-006
tc-ref: TC-BFF-006
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
---

# TR-BFF-006 -- PUT on Posted Entry Returns 409

## Verdict: PASS

## Evidence
```
✓ TC-BFF-006: PUT on posted entry returns 409 > returns 409 ENTRY_POSTED when trying to update a Posted entry
```
Created + posted entry, then attempted PUT. Response 409, body `code` = "ENTRY_POSTED".

## Notes
Uses seed je-seed-001 (Posted status). Business rule enforced at route layer.
