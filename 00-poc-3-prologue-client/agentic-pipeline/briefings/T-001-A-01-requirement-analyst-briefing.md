# Briefing: T-001 -- Requirement Analyst (A-01)
# Sprint: sprint-01
# Prepared by: A-00 Orchestrator
# Date: 2026-05-21
# Status: ACTIVE -- A-01 should read this before starting work

---

## Task
**T-001** -- Requirement parsing. Read all input files in `req-inputs/`, produce RC cards and `cross-sprint-refs.json`.

---

## Sprint Context
| Field         | Value                                |
|---------------|--------------------------------------|
| Sprint ID     | sprint-01                            |
| Sprint Name   | Sprint 1 -- Prologue Client MVP      |
| RC range      | RC-001 onwards (first sprint -- no prior cards) |
| Prior sprints | None (this is sprint-01, a fresh workspace) |

---

## Input
- **Folder:** `sprints\sprint-01\req-inputs\`
- **Files found (1):**
  - `Journal Entry.png` (image -- raw input, not requirements.md)
- **Input mode:** Raw file -- RA must read the image and consolidate into `requirements.md` first, then produce RC cards.

---

## Output (required)
1. `sprints\sprint-01\req-inputs\requirements.md` -- consolidated requirements derived from input files
2. `sprints\sprint-01\req-outputs\RC-001.md` ... `RC-NNN.md` -- one RC card per requirement
3. `sprints\sprint-01\req-outputs\cross-sprint-refs.json` -- any cross-sprint references detected (empty array `[]` is valid for sprint-01)

---

## RC Card Numbering
- First RC card: **RC-001**
- Increment sequentially: RC-002, RC-003, ...
- No prior sprint cards to avoid conflicting with.

---

## Dependency Status
| Dependency | Status |
|------------|--------|
| START_SPRINT signal | [x] Present |
| Input files         | [x] 1 file (Journal Entry.png) |
| Prior sprint RCs    | N/A -- sprint-01 |

---

## Known Constraints / Decisions
- This is the first sprint in this workspace. No cross-sprint references are expected, but emit `cross-sprint-refs.json` with `[]` if none are found.
- The input is a single image file (`Journal Entry.png`). A-01 must read this image to extract requirements before producing RC cards.
- No `requirements.md` exists yet -- A-01 creates it as part of T-001.

---

## Post-Completion
After completing T-001, A-01 must signal A-00 Orchestrator:
> "T-001 complete. [N] RC cards produced (RC-001 to RC-NNN). requirements.md written. cross-sprint-refs.json emitted. Ready for sign-off gate."

A-00 will then run `H-01-requirement-analyst.ps1 -PostCheck` before marking T-001 [x] and opening the sign-off gate.

---

## Protocol 1 -- Startup Questions (pre-answered)
1. **Task ID and sprint:** T-001, sprint-01
2. **Input path:** `sprints\sprint-01\req-inputs\` (1 file: Journal Entry.png)
3. **Output path:** `sprints\sprint-01\req-outputs\` (RC-NNN.md cards + cross-sprint-refs.json) and `sprints\sprint-01\req-inputs\requirements.md`
4. **Dependencies complete:** Yes -- START_SPRINT present, input file present, no prior dependencies.
