# RC-[###] â€” [Short descriptive title]
# Requirement Card Template â€” copy this file, rename to RC-###.md, fill in all fields
# Produced by: A-01 Requirement Analyst
# Version: 1.0

---

## Metadata
| Field           | Value                                         |
|-----------------|-----------------------------------------------|
| ID              | RC-[###]                                      |
| Sprint          | sprint-[##]                                   |
| Version         | v1.0                                          |
| Status          | Draft                                         |
| Source          | [filename or URL the requirement came from]   |
| Created         | [YYYY-MM-DD]                                  |
| Last updated    | [YYYY-MM-DD]                                  |
| Updated reason  | â€” (blank for v1.0)                            |

---

## User Story
As a [user type],
I want to [action / capability],
So that [benefit / outcome].

---

## Functional Requirements
Each item must be specific and testable. Avoid vague language.
Example: "The system must redirect unauthenticated users to the login page when
they attempt to access any protected route." NOT "The system should handle authentication."

1. [Specific, testable behaviour]
2. [Specific, testable behaviour]
3. [Specific, testable behaviour]

---

## Acceptance Criteria
Each item must be binary pass/fail and written in Given/When/Then format.

1. Given [context], when [action], then [observable outcome].
2. Given [context], when [action], then [observable outcome].
3. Given [context], when [action], then [observable outcome].

---

## Non-Functional Requirements
| Category      | Requirement                                   |
|---------------|-----------------------------------------------|
| Performance   | [latency / throughput target â€” or TBD]        |
| Security      | [auth requirement, data classification]       |
| Accessibility | [WCAG AA mandatory â€” any additional detail]   |
| Usability     | [specific UX constraints if any]              |
| Other         | [any other NFR]                               |

---

## UI Components Affected
Brief list. UI Component Designer enriches this during sign-off review.
- [UI area or component name]
- [UI area or component name]

---

## BFF Endpoints Needed
Brief list. BFF Endpoint Designer enriches this during sign-off review.
- [HTTP method] /[resource]/[path] â€” [brief description]

---

## Intra-sprint Dependencies
List any other RC-###.md in this sprint that must be designed before this card.
Enter "None" if no dependencies.
- Depends on: RC-[###] â€” [reason why this must be designed first]

---

## Open Questions
Document every ambiguity or missing piece of information identified in the source material.
Each question must have a unique ID within this card.

| ID      | Question                           | Status          | Resolution    |
|---------|------------------------------------|-----------------|---------------|
| OQ-001  | [Specific question]                | Open / Resolved | [answer here] |

---

## Change Log
| Version | Date       | Changed By | What Changed        |
|---------|------------|------------|---------------------|
| v1.0    | [date]     | A-01     | Initial creation    |

---
<!-- NOTES FOR REQUIREMENT ANALYST:
  - One user story per card â€” never combine multiple stories
  - Every field is mandatory â€” use "TBD â€” see Open Questions" if unknown
  - Functional requirements must be specific and testable (not vague)
  - Acceptance criteria must be Given/When/Then and binary pass/fail
  - No implementation decisions (no React, no framework names, no code)
  - Every ambiguity goes in Open Questions â€” never guess
-->
