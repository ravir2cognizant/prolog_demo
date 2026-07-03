# T-001 — A-01 Requirement Analyst Briefing
Sprint: sprint-01 | Task: T-001 | Activation: 1 (first)

## Task Summary
Parse the raw input file and produce structured Requirement Cards (RC-###.md) plus
cross-sprint-refs.json. This is the first agent activation in sprint-01.

## Paths
- Input folder:  `sprints\sprint-01\req-inputs\`
- Output folder: `sprints\sprint-01\req-outputs\`  (create if absent)
- Input file:    `Journal Entry.png` (1 raw image file — must be interpreted as UI/feature requirements)

## Input Mode
One raw image file. A-01 must first extract/consolidate all requirements from the image
into a working `requirements.md` scratch file, then produce the RC cards from that
consolidated list. Do NOT skip the consolidation step.

## Output Contracts
1. `sprints/sprint-01/req-outputs/RC-001.md` … `RC-NNN.md` — one card per requirement
2. `sprints/sprint-01/req-outputs/requirements.md` — consolidated plain-text requirements
3. `sprints/sprint-01/req-outputs/cross-sprint-refs.json` — cross-sprint references
   (empty array `[]` if none detected)

## RC Card schema (mandatory — V-01-rc-schema.ps1 will validate)
Each RC-###.md must include:
- `id:` RC-NNN
- `title:` short label
- `description:` user-facing behaviour
- `acceptance-criteria:` bulleted list, testable
- `priority:` High | Medium | Low
- `sprint:` sprint-01
- `status:` Draft

## Sprint context
- Sprint name: Prologue Client
- RC numbering starts at RC-001
- No prior sprint outputs — no cross-sprint references expected (write empty array)

## Post-completion (Protocol 4)
Report to Orchestrator (A-00):
- Total RC cards produced (count)
- Any clarifications raised (CL-### format) or NONE
- Any cross-sprint references detected or NONE
- Completion signal: COMPLETE or BLOCKED (with reason)
Orchestrator will run H-01 -PostCheck to validate RC schema before marking [x].

## Known constraints
- This is sprint-01, no prior context to carry forward.
- If the image is ambiguous, prefer raising a CL-### rather than guessing.
- RC IDs are sequential: RC-001, RC-002, …
