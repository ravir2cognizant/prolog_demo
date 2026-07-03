---
id: TR-BFF-026
tc-ref: TC-BFF-026
executed: 2026-05-21
runner: vitest+supertest
verdict: PASS
defect-ref: DEF-BFF-002
---

# TR-BFF-026 -- POST /accounts Create Returns 201

## Verdict: PASS (after test correction)

## Evidence
```
✓ TC-BFF-026: POST /accounts create > returns 201 with id and code
```
POST /accounts with companyId='comp-001', code='1-100-0001-001-01', description, type='asset', active=true returned 201 with `id` (string) and `code`.

## Notes
**Test correction applied:** Original test used code='1-TEST-0001-000-01' which contains non-digit characters and fails the account code validation pattern `/^\d+-\d+-\d+-\d+-\d+$/`. Updated to code='1-100-0001-001-01'. The TC-BFF-026 spec example code was not format-compliant.
