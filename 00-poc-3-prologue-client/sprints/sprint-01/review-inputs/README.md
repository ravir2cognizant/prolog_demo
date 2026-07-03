# Review Inputs -- sprint-01

Drop review comments here for A-04 (Frontend) and A-05 (Backend) to
process during a T-007 Rework cycle.

## Folder layout
- `code-review\`  -- code-review comments (line-level nits to cross-cutting
  refactors). Authored by humans or by A-06 (Code Reviewer).
- `arch-review\`  -- architecture-review comments (layering, contracts,
  cross-service concerns, security model). Authored by humans.

## Comment file format
One comment per .md file. Filename = comment id (e.g. CR-001.md, AR-001.md).
Frontmatter + free-form markdown body.

---
id: CR-001
category: code-review            # or arch-review
owner: A-05                    # A-04 | A-05 | shared | other  (used for routing)
severity: critical|high|medium|low|info
location: app/backend/src/middleware/auth.ts:43
reviewer: "Jane Doe"
date: 2026-05-13
---

## Comment
The comment text in markdown.

## Suggested fix (optional)
A suggested fix in plain prose or a code snippet.

## Ownership routing
The `owner` field tells A-04 and A-05 which comments belong to whom:
  - `owner: A-04`   -> Frontend Developer only (app/frontend/...).
  - `owner: A-05`   -> Backend Developer only (app/backend/...).
  - `owner: shared`   -> Both agents log it; each implements its layer's
                          part and cross-references the other in the ledger.
  - `owner: A-06`   -> Code Reviewer item; not a code-agent deliverable.

If `owner` is omitted, agents fall back to inferring from the `location`
path prefix (`app/frontend/...` -> A-04, `app/backend/...` -> A-05,
anything else -> not-applicable for both, follow-up flag set). When in
doubt, set `owner:` explicitly.

## Read-only contract
A-04 and A-05 READ from here; they do not write. They write their
implementation report + ledger to sprints\sprint-01\review-outputs\.

## Empty is OK
An empty review-inputs folder is acceptable -- no review cycle pending.
