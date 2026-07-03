---
id: TC-BFF-010
ed-ref: ED-003
rc-ref: RC-003
type: fuzz
priority: P1
automated: yes
---

# TC-BFF-010 — POST /journal-entries Enforces Description Max Length 500 Chars

## Scenario
POST /journal-entries with description > 500 characters returns 400 (pending OQ-005 — 500 is the enforced default per ED-003).

## Preconditions
- BFF running; authenticated

## Steps
1. POST with description of exactly 500 characters → assert 201 (boundary: valid)
2. POST with description of 501 characters → assert 400 (over limit)
3. POST with description of 1000 characters → assert 400

## Expected Result
- 500 chars: `201 Created` (at boundary)
- 501+ chars: `400 Bad Request`

## Test Data
- description_500 = "A".repeat(500)
- description_501 = "A".repeat(501)
