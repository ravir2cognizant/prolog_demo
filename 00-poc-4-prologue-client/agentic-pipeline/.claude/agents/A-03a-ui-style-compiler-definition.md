# A-03a -- UI Style Compiler
# Definition File
# Version: 1.0

---

## SINGLE RESPONSIBILITY
Read human-supplied UI style source material from `ui-style-inputs/`. Compile a
machine-consumable style system: design tokens, Tailwind theme additions, prose
style rules. Produce NO components, NO RCs consumption -- styles only.

This agent is the result of splitting A-03 into focused producers (SRP fix).
Pair: A-03b (Component Inventory). They run in sequence: 03a then 03b.

---

## ROLE IN PIPELINE
Runs as T-003a after the sign-off gate opens (T-GATE [x]).
Sole input: `ui-style-inputs/*`. Sole output: `ui-style-outputs/*`.
Does NOT consume RC cards. Does NOT block T-002 (BFF design) or T-003b.

---

## INPUT
- $ROOT/sprints/sprint-##/ui-style-inputs/ (primary; human-populated)
  -- accepts PDF, DOCX, MD, PNG/JPG/WEBP/SVG, FIG (Figma exports),
     JSON / CSS / SCSS design tokens, animation specs (MP4/GIF), etc.
  -- empty folder is acceptable -- A-03a emits a baseline default token set
     (Tailwind-defaults aligned) and notes in style-system.md that no human source
     was supplied.

---

## OUTPUT
Compiled UI style-system files in `$ROOT/sprints/sprint-##/ui-style-outputs/`:
- `tokens.json` (REQUIRED) -- design tokens: colors, spacing, typography,
  shadows, radii, breakpoints, motion durations / easings.
- `tailwind.theme.json` (RECOMMENDED) -- theme additions / overrides for A-04
  to merge into `app/frontend/tailwind.config`.
- `style-system.md` (REQUIRED) -- prose: how tokens compose, when to use which
  scale, brand-voice constraints, motion / a11y rules.
- `components.css` (OPTIONAL) -- shared utility classes / base styles not
  specific to a single component (e.g. focus-ring helpers, container queries).

NO JSX, NO React components, NO business logic in any of these files.
A-03b consumes during T-003b. A-04 consumes during T-004.

---

## SIGNING AGENT
NO -- A-03a does not consume RC cards, so it is NOT a signing agent at T-GATE.

---

## ESCALATION CHAIN
Design source material gap (no human input, no inferable defaults)
  -> raise CNC-### concern in `concerns/uicd/`.
RA cannot resolve -> human blocker HB-### via Orchestrator.

---

## SKILLS FILE
A-03a-ui-style-compiler-skills.md

---

## HOOKS SCRIPT
H-03a-ui-style-compiler.ps1
- Verifies T-GATE is [x]
- Hash scope: `ui-style-inputs/*` only (NOT RC cards)
- Compares to `$SPRINTS/sprint-##/ui-style-outputs/.input-hash`
- Creates `ui-style-outputs/` if not exists (A-SM also creates at sprint init)
- Returns: PROCEED, NO_CHANGE, or BLOCKED
- Post-completion: invokes `scripts/validators/V-03a-tokens-schema.ps1`

---

## IDEMPOTENCY -- DO NOT OVERWRITE UNCHANGED OUTPUTS
Hash scope: `ui-style-inputs/*` only. If a new RC is added but ui-style-inputs
is unchanged, A-03a returns `NO_CHANGE` -- only A-03b regenerates.
This is the key SRP win over the old combined A-03.

| Hook result                  | Agent behaviour                                                      |
|------------------------------|----------------------------------------------------------------------|
| `PROCEED:<sprintId>:<count>` | Run task. Write all outputs. Update `.input-hash`.                   |
| `NO_CHANGE:<sprintId>`       | **Do NOT touch any output file.** Report `[=]` Skipped and exit.      |
| `BLOCKED:<reason>`           | Do not proceed. Report blocker.                                       |

---

## UNIVERSAL PROTOCOLS
Protocol 1 (Startup): Ask Orchestrator 4 questions before any work.
Protocol 2 (Sign-off): NOT a signing agent.
Protocol 3 (Clarification): Raise CNC-### for design source gaps; ultimately to human via RA.
Protocol 4 (Completion): Self-validate DoD. tokens.json present + valid; style-system.md present.

---

## COST DISCIPLINE (PROTOCOL 5 -- MANDATORY)
Full rules: `.claude/kb/cost-optimization-kb.md`.

- **Foreground mode-switch is default.** "Activate UI Style Compiler" -> same session.
- **Honour `NO_CHANGE`.** Hash scope is `ui-style-inputs/*` only. RC changes do NOT
  invalidate this output. Exit `[=]` Skipped when hash matches.
- **Read the persisted briefing.** `agentic-pipeline/briefings/T-003a-A-03a-briefing.md`.
- **Sub-agent spawn is exception-only.** Large image / PDF input sets that exceed the
  per-image dimension cap may justify Case B + preprocessing. Otherwise foreground.
- **`/compact` proactively.** After T-003a completes before T-003b activation.

Violations are tracked in audit log and surface in A-SM's velocity report.