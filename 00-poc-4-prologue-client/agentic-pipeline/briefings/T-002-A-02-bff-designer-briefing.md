# T-002 — A-02 BFF Designer Briefing
Prepared by: A-00 Orchestrator
Date: 2026-05-23
Sprint: sprint-01

## Gate Status
T-GATE: COMPLETE
RC-001 through RC-008: OPEN (all 6 agents signed off)
RC-009 and RC-010: PARTIAL (excluded from this task scope — see below)

## Task Assignment
Task: T-002
Agent: A-02 BFF Endpoint Designer
Input path: sprints\sprint-01\req-outputs\
Output path: sprints\sprint-01\endpoint-design\
In-scope RC cards: RC-001, RC-002, RC-003, RC-004, RC-005, RC-006, RC-007, RC-008

## Excluded Cards (do NOT design endpoints for these)
- RC-009 (Source Document Attachment): excluded — pending OQ-011 (file upload vs reference vs link — type completely undefined)
- RC-010 (GL Import): excluded — pending OQ-012 (import mechanism, format, sync/async — completely undefined)
These will be handled in a subsequent design iteration once OQ-011 and OQ-012 are resolved.

## Resolved Blockers (apply to your designs)
- HB-001 RESOLVED: "Balanced" field on RC-005 is a **system-calculated flag**, NOT user-settable.
  The BFF must NOT expose any endpoint that allows user modification of the Balanced flag.
  Recalculation trigger (on save vs on line edit) is pending OQ-001b — design conservatively:
  the flag should be recalculated and returned by the server on every GET and every save response.

- HB-002 PARTIALLY RESOLVED: The chartfield account code (RC-004) is a **5-segment structured code**
  in the format `S1-S2-S3-S4-S5`. Segment 1 = Country code (confirmed). Segments 2–5 business
  meanings are pending OQ-006 but are confirmed to be distinct business identifiers.
  Design the account lookup endpoint to accept the full 5-segment string as a single parameter.

## Endpoint Summary by RC Card (from RC.md BFF Endpoints Needed sections)
This is a starting summary — your design must expand each endpoint with full request/response models.

| RC Card | Endpoints Listed in RC |
|---------|------------------------|
| RC-001  | GET /navigation/menu |
| RC-002  | GET /journal-entries/{journalId} |
| RC-003  | POST /journal-entries; PUT /journal-entries/{journalId}; GET /reference/companies; GET /reference/journal-entry-types |
| RC-004  | GET /journal-entries/{journalId}/lines; POST /journal-entries/{journalId}/lines; PUT /journal-entries/{journalId}/lines/{lineId}; DELETE /journal-entries/{journalId}/lines/{lineId}; GET /accounts/{accountCode} |
| RC-005  | None (client-side calculation) |
| RC-006  | No new endpoint — covered by GET /journal-entries/{journalId}; posting action endpoint pending OQ-009 |
| RC-007  | GET /journal-entries/{journalId}/navigation |
| RC-008  | GET /reference/companies (shared with RC-003) |

## Design Notes
1. RC-005 has no BFF endpoints — produce an ED-005.md that documents this explicitly (client-side calc)
   and confirms the server returns balance fields in the GET /journal-entries/{journalId} response.
2. RC-006 shares the GET /journal-entries/{journalId} endpoint with RC-002 — the response model
   must include all audit fields. Design ED-006.md to reference ED-002 and document audit field behaviour.
3. RC-008 shares GET /reference/companies with RC-003 — document it in both ED files; mark as shared.
4. Open question OQ-009 (additional lifecycle statuses) — design conservatively with a
   POST /journal-entries/{journalId}/post endpoint as a placeholder; mark it as pending OQ-009.
5. Open question OQ-010 (navigation ordering) — design GET /journal-entries/{journalId}/navigation
   with query params for sort field and direction; mark defaults as pending OQ-010.
6. All endpoints require Bearer JWT authentication EXCEPT where the RC explicitly states otherwise.
7. No TBD fields allowed in ED files — if something is genuinely unknown, use a descriptive
   note ("pending OQ-NNN resolution") inline in the table cell, not "TBD".

## DoD Checklist (must be met before T-002 is marked complete)
- [ ] ED-001.md through ED-008.md exist in sprints\sprint-01\endpoint-design\
- [ ] Every RC card has at least one ED file (ED-005, ED-006 may have no new endpoints but must exist)
- [ ] Every endpoint has: HTTP method, URL path, request model, response model, all error responses, auth
- [ ] No "TBD" or "[TBD]" in any ED file
- [ ] ED-005.md explicitly confirms balance fields are client-side calculated
- [ ] ED-006.md references ED-002 for shared endpoint
- [ ] Shared endpoints (GET /reference/companies) noted in both ED-003 and ED-008
