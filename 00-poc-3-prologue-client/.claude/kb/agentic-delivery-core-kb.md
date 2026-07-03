# AGENTIC DELIVERY -- CORE KNOWLEDGE BASE
# Master reusable KB for multi-agent software delivery pipelines
# Version: 2.0.1 -- 2026-05-15
# Scope: Generic -- project-agnostic. No tech-stack or domain dependencies.
# Usage: Load alongside a project-specific KB (and cost-optimization-kb.md) in any AI co-worker artefact.
#
# What changed in v2.0 vs v1.3:
# - Pipeline expanded from 8 to 12 agents (A-01r resolver split; A-03 split into A-03a + A-03b;
#   A-07 + A-08 test agents added; A-09 + A-10 reserved).
# - Sign-off gate composition expanded from 4 to 6 signing agents.
# - File + ID naming convention overhauled (A-/H-/V-/T- prefixes with descriptive fullnames).
# - Tier-1 hook validators (V-*.ps1) introduced; mechanical schema checks moved out of agents.
# - JSON routing summaries introduced (review-summary, defect-summary-*, dispute-summary,
#   cross-sprint-refs, routing-plan). Orchestrator reads JSON for routing decisions, not Markdown.
# - Test agent pattern documented: planning + execution + dispute resolution.
# - T-007 rework consolidated (code-review CRs + test defects in one rework pass).
# - Helper scripts catalogued (manifest-writer, route-defects, build-velocity-report, select-model,
#   build-review-report).
# - Protocol 5 (cost discipline) referenced; full rules live in cost-optimization-kb.md.
# - SRP discipline rules formalised (mechanical work in hooks; mode-switch over spawn).
# - NOTIFICATIONS.md formalised as single-writer (Orchestrator only).
# - New decisions D-023..D-030 covering the above.
#
# What changed in v2.0.1 vs v2.0 (2026-05-15 design-audit closures):
# - Dispute authoring contract documented producer-side in A-04/A-05 skills files (D-035, Section 6.7).
# - `-PostCheck` switch wired into 7 producer hooks; A-00 invokes it after each completion before
#   marking the task [x] (D-036, Sections 8.3 + 10.6).
# - manifest-writer.ps1 trigger events documented in A-00 definition's "Manifest log triggers"
#   subsection so downstream manifest sections stay populated (D-037, Section 8.6).
# - No structural changes -- v2.0.1 closes operational gaps in the v2.0 pipeline; agent count,
#   gate composition, naming convention, and validators are unchanged.

---

## SECTION 1 -- PHILOSOPHY AND CORE PRINCIPLES

### 1.1 The Agentic Delivery Philosophy

Agentic delivery is the practice of decomposing a software delivery pipeline into a network of
specialist AI agents, each with a single clearly defined responsibility, coordinated by a central
Orchestrator. The goal is not to automate everything -- it is to make every step explicit, auditable,
and reliably reproducible.

**The four pillars:**

Single Responsibility -- every agent does one thing and does it well. An agent that does two things
does neither as well as two dedicated agents would. Single-responsibility agents are predictable,
replaceable, independently improvable, and easy to reason about when something goes wrong.

Centralised Coordination -- one Orchestrator holds all state. It knows every path, every dependency,
every task status, every clarification in flight, every blocker raised. Agents do not know about each
other. They know only their job, their input, and their output -- and they ask the Orchestrator for
all of that. Centralised state makes debugging trivial and makes the pipeline easy to modify.

Explicit over Implicit -- nothing in a well-designed agentic pipeline is assumed, guessed, or inferred
silently. Every ambiguity is raised as a clarification. Every completion is validated against a
Definition of Done. Every decision is logged in an audit trail. Implicit behaviour is the enemy of
reliable delivery.

Cost Discipline -- every token spent on coordination is a token not spent on delivery. The pipeline
defaults to the cheapest activation mechanism that achieves the outcome (foreground mode-switch
over sub-agent spawn; hash-skip over re-execution; persisted briefings over re-derivation). Full
rules live in `.claude/kb/cost-optimization-kb.md` as Protocol 5.

### 1.2 Design Principles

- An agent must never contact another agent directly. All communication routes through the Orchestrator.
- An agent must never guess or proceed on an assumption. Uncertainty is always raised explicitly.
- An agent must never overwrite output when input has not changed. Idempotency is a first-class property.
- An agent must never report complete without passing its Definition of Done checklist.
- The Orchestrator must never produce business output. Its single responsibility is coordination.
- Paths, dependencies, and context are provided by the Orchestrator -- never hardcoded in agent prompts.
- Mechanical work (schema validation, hash computation, folder creation, alignment checks) belongs
  in hook scripts, NOT in agent prompts. Agents focus on semantic judgement.
- Every significant decision is documented with its rationale. Undocumented decisions become mysteries.
- Human involvement is minimised but never eliminated. The human is the final escalation path.
- The pipeline never starts autonomously. Every sprint begins with a deliberate human signal.

### 1.3 When to Use Agentic Delivery

Agentic delivery works well when:
- The delivery pipeline has clearly separable phases with defined inputs and outputs between them
- Quality gates between phases are important (a misunderstood requirement is expensive to fix later)
- The team wants an auditable, reproducible process that new members can follow without tribal knowledge
- Multiple specialists (design, backend, frontend, test, review) work on the same requirements

Agentic delivery is not the right tool when:
- The work is exploratory or research-oriented with no clear input/output structure
- The team is one person doing everything -- the coordination overhead exceeds the benefit
- Requirements change so rapidly that a structured pipeline cannot keep up

---

## SECTION 2 -- AGENT DESIGN

### 2.1 The Single Responsibility Rule

The most important rule in agent design is single responsibility. Before creating an agent, answer
these three questions:

1. What is the one thing this agent produces?
2. What does it read to produce that thing?
3. Who consumes what it produces?

If you cannot answer all three cleanly, the agent's responsibility is not yet well-defined.
If the answer to question 1 contains "and", the agent has two responsibilities -- split it.

**Good agent definitions:**
- "Parse raw requirements and produce structured requirement cards" -- one thing, clear input, clear output
- "Compile a machine-consumable style system from style-source material" -- one thing, clear scope
- "Review all implementation code and produce a findings table" -- one thing, clear input, clear output

**Bad agent definitions:**
- "Design endpoints and also write the implementation" -- two things, split into two agents
- "Parse requirements and coordinate the team" -- mixing domain work with coordination, wrong
- "Compile style tokens AND map components to them" -- two responsibilities, split (see A-03a/A-03b)
- "Produce RC cards AND resolve clarifications on those cards" -- two responsibilities, split (see A-01/A-01r)

### 2.2 The Canonical Twelve-Agent Pipeline

A reference agentic pipeline ships with twelve agents -- two coordinators, eight specialists, and
two reserved slots for additional test layers. Projects may add more agents but the twelve below
are the minimum a non-trivial delivery pipeline tends to need when end-to-end test coverage
matters.

| ID    | Name                   | One-line responsibility                                          | Signs off? |
|-------|------------------------|------------------------------------------------------------------|------------|
| A-00  | Orchestrator           | Coordinate everything. Hold all state. Produce no business output. | --       |
| A-SM  | Sprint Manager         | Detect sprint start, register sprint, produce velocity report.   | --         |
| A-01  | Requirement Analyst    | Read raw inputs, produce structured requirement cards (RC-###).  | No (split) |
| A-01r | Requirement Resolver   | Resolve routed clarifications + concerns; emit verdicts.         | No         |
| A-02  | BFF Endpoint Designer  | Design API endpoint contracts (ED-###) from RC cards.            | Yes        |
| A-03a | UI Style Compiler      | Compile design tokens + theme + style-system docs.               | No (no RC) |
| A-03b | UI Component Inventory | Produce component inventory (CI-###) from RC + style-system.     | Yes        |
| A-04  | Frontend Developer     | Implement the UI from RC + CI + style-system.                    | Yes        |
| A-05  | Backend Developer      | Implement the API layer from RC + ED.                            | Yes        |
| A-06  | Code Reviewer          | Review implementation, produce findings + JSON routing summary.  | No         |
| A-07  | Frontend Tester        | Plan + execute FE tests; emit defects + JSON routing summary.    | Yes        |
| A-08  | API/BFF Tester         | Plan + execute API tests; emit defects + JSON routing summary.   | Yes        |

Reserved IDs for additional test layers:
- **A-09** -- microservice tester (when the project layer extends below the BFF)
- **A-10** -- database tester (when persistent storage needs schema + data testing)

**Sign-off gate composition.** Six signing agents (A-02, A-03b, A-04, A-05, A-07, A-08). A-01r is
not a signing agent (its role is resolution, not consumption). A-03a does not consume RC cards so
it is not a signing agent.

### 2.3 Agent Anatomy

Every specialist agent has exactly six components:

**Definition file (`A-<id>-<fullname>-definition.md`):**
- Agent ID and fullname
- Single responsibility statement (one sentence)
- Input: exactly what the agent reads and from where
- Output: exactly what the agent produces and where it writes it
- Escalation chain: who the agent asks via the Orchestrator
- Which universal protocols apply (always all five)

**Skills file (`A-<id>-<fullname>-skills.md`):**
- Domain knowledge required to do the job
- Output format specification (exact structure of what the agent produces)
- Quality standards and constraints
- Definition of Done checklist (every item must pass before reporting complete)
- Examples of good and bad output

**Activation file (`agentic-pipeline/agents/CLAUDE-A-<id>-<fullname>.md`):**
- The file the human activates by saying "Activate [agent name]" or by being asked to read it
- Short -- points the runtime at the definition + skills + briefing for that agent
- Carries a `## Default model tier` section naming the agent's declared model (haiku|sonnet|opus)
- Contains the step-by-step run book the agent follows after Protocol 1

**Hooks script (`H-<id>-<fullname>.ps1` or `.sh`):**
- Dependency check (are upstream outputs present and complete?)
- Input hash computation and comparison (no-overwrite rule)
- Path resolution (reads from manifest, returns concrete paths)
- Pre-activation validators (cross-cutting alignment checks where relevant)
- Output directory creation
- Partial output detection and cleanup
- Secret and credential loading
- Returns: PROCEED, NO_CHANGE, BLOCKED, PARTIAL_RECOVERY, ALIGNMENT_CONFLICT, or ERROR

**Definition of Done checklist:** specific to the agent. Defined in the skills file. Every item
must pass before the agent reports completion to the Orchestrator. The hook may invoke a
post-completion validator (Section 8.3) that mechanically re-checks DoD items the agent claims to
have satisfied.

**Escalation chain:** who the agent asks first when it cannot resolve an ambiguity, and what
happens if the primary upstream cannot resolve it either. Defined in the definition file. Routes
through the Orchestrator.

### 2.4 The Orchestrator (A-00)

The Orchestrator is a special agent with a fundamentally different character from all others.
Where specialist agents produce business output, the Orchestrator produces only coordination.

**Responsibilities:**
- Maintain the manifest (single source of truth for all pipeline state)
- Create the workspace folder skeleton at startup
- Activate agents in the correct order based on dependency graph
- Prepare and persist context briefings (see Section 6.8) at activation time
- Route clarification requests between agents (via A-01r for requirement-level questions)
- Track sign-off gate status across six signing agents
- Manage human blockers (log, notify human via NOTIFICATIONS.md, resume when resolved)
- Sole writer of `NOTIFICATIONS.md` (other agents emit signals; A-00 appends)
- Update task status codes
- Detect and flag timeouts
- Write to the audit log on every significant event
- Read producer JSON summaries (`review-summary.json`, `defect-summary-*.json`,
  `dispute-summary.json`, `cross-sprint-refs.json`) for routing decisions, NOT Markdown content
- Pick model tier for sub-agent spawns by invoking `scripts/select-model.ps1`
- Notify the human when human attention is required

**The Orchestrator must NOT:**
- Produce business output (requirement cards, designs, code, reviews, test cases, defects)
- Make design decisions on behalf of agents
- Resolve clarifications itself -- it routes them to the appropriate agent
- Parse Markdown artefact bodies for routing decisions -- always read JSON summaries
- Decide whether a defect is valid -- routes to test agent / developer / human
- Start a new sprint autonomously -- sprint start is always a deliberate human action

### 2.5 The Sprint Manager (A-SM)

The Sprint Manager sits between the human and the Orchestrator. It manages the sprint lifecycle --
detecting sprint starts, registering sprints in the manifest, and triggering the velocity-report
generator on completion.

**Responsibilities:**
- Detect the START_SPRINT signal file created by the human via `start-sprint.ps1`
- Validate that at least one input file (any type) exists in the sprint folder
- **Create the sprint folder skeleton** (req-inputs/, req-outputs/, ui-style-inputs/,
  ui-style-outputs/, endpoint-design/, component-inventory/, review/, review-inputs/,
  review-outputs/, concerns/uicd/, concerns/resolutions/, tests/{fe,bff,microservice,db}/...)
- Determine next RC start number from previous sprint (continuous sequence)
- Read `cross-sprint-refs.json` (emitted by A-01 during T-001) to populate the Cross-Sprint Log
- Register sprint in manifest (ID, status, input count, RC range, dates)
- Signal the Orchestrator: sprint initialised, N inputs, RC-### onward, proceed
- On sprint completion: invoke `scripts/build-velocity-report.ps1` (does NOT hand-craft the report)
- Mark sprint complete; archive task registry
- Prevent duplicate sprint starts (return SPRINT_ALREADY_ACTIVE if already running)

**Permitted manifest writes (carve-out to the single-writer rule):**
A-SM is permitted to write **two specific regions** of the manifest:
- The Sprint Registry rows (add new row on init, mark Complete on end)
- The ACTIVE SPRINT block (set on init, clear on end)

It must not touch any other region. All other writes remain Orchestrator-only.

**A-SM does NOT do:**
- Semantic input analysis (cross-sprint references) -- that belongs to A-01
- Velocity report content generation -- that's a deterministic script
- NOTIFICATIONS.md writes -- emit signals to Orchestrator instead

### 2.6 The Requirement Analyst / Resolver Split (A-01 + A-01r)

The Requirement domain has two distinct responsibilities that share a domain but differ in scope:

**A-01 (Requirement Analyst) -- producer.** Runs as T-001. Reads ALL input files in `req-inputs/`
regardless of format. Consolidates into `requirements.md`. Produces RC-###.md cards (one per user
story). Emits `cross-sprint-refs.json` listing references in the input material to prior-sprint
RC IDs. Also runs on demand when the resolver returns `NEEDS_RC_UPDATE` -- A-01 executes the RC
version bump.

**A-01r (Requirement Resolver) -- resolver.** On-demand sub-routine. Receives a single routed
clarification (CL) or concern (CNC). Reads the routed question + the one affected RC + targeted
source slices. Returns one of three verdicts:
- `RESOLVED_FROM_SOURCE` -- resolution exists in source; A-01r writes a resolution document; no RC change needed
- `NEEDS_RC_UPDATE` -- resolution implies RC text change; Orchestrator routes to A-01 (producer) for version bump
- `HUMAN_BLOCKER` -- source insufficient; Orchestrator raises HB-###

The split exists because resolver mode has a small focused context (one question + one RC + targeted
source) while producer mode is the heaviest task in the pipeline (full input set + multi-image
reasoning). Cost discipline keeps these separate.

A-01r writes ONLY to `concerns/resolutions/`. RC write authority stays with A-01.

### 2.7 The UI Design Split (A-03a + A-03b)

The UI design domain has two outputs that change for different reasons:

**A-03a (UI Style Compiler).** Reads `ui-style-inputs/*` only (NOT RC cards). Emits the compiled
style system: `tokens.json`, `theme.json` (named for the project's CSS framework, e.g.
`tailwind.theme.json` for a Tailwind project), `style-system.md`, optional `components.css`.
Hash scope: `ui-style-inputs/*` only.

**A-03b (UI Component Inventory).** Reads RC-###.md cards + A-03a's outputs. Emits CI-###.md
(one per RC). Hash scope: RC + A-03a outputs. Signs RC cards at T-GATE.

The split lets the two outputs fail/skip independently. A new RC card invalidates CI but NOT
tokens. A re-style invalidates CI references but not RC mapping. A-03b is a signing agent;
A-03a is not (it does not consume RCs).

### 2.8 Test Agents (A-07, A-08, and reserved A-09, A-10)

Test agents are dual-phase: a **test plan** phase that runs alongside design, and a **test
execution** phase that runs after implementation. Each test agent owns one application layer.

| Agent | Layer | Test plan task | Test exec task | Test re-exec task |
|-------|-------|----------------|----------------|-------------------|
| A-07  | Frontend (UI) | T-009 | T-011 | T-013 |
| A-08  | BFF / API     | T-010 | T-012 | T-014 |
| A-09  | Microservice  | reserved | reserved | reserved |
| A-10  | Database      | reserved | reserved | reserved |

**Test plan phase (e.g. T-009).** Reads RC + CI (for FE) or RC + ED (for BFF). Produces `TC-*.md`
test case specs in `tests/<layer>/test-cases/`. Signs RC cards at T-GATE.

**Test execution phase (e.g. T-011).** Reads the implemented application code + the test cases.
Produces `TR-*.md` per case + framework-native HTML reports + `DEF-*.md` defect files. **Mandatory
output: `defect-summary-<layer>.json`** -- the JSON routing contract the Orchestrator reads.

**Test re-execution phase (e.g. T-013).** Re-runs after T-007 rework. Always PROCEED (no hash-skip).

**Defects route by `owner:` tag.** Each DEF-*.md frontmatter carries `owner: A-04 | A-05 | shared
| test-case-bug`. The owner tag drives T-007 rework routing. `test-case-bug` routes back to the
test agent (NOT a developer task).

**Disputes** -- when a developer disagrees with a defect, they write `DSP-*.md` in
`tests/<layer>/test-results/disputes/` with a verdict (`not-a-defect | test-case-incorrect |
requirement-mismatch | valid-defect`). The originating test agent re-judges and writes the
final verdict into the DSP body. `requirement-mismatch` escalates to A-01r.

**Tech-stack choice.** Each test agent declares its preferred testing libraries in its skills file.
The pipeline does not prescribe a stack -- the project's KB does.

### 2.9 The START_SPRINT Trigger

The Sprint Manager only starts a sprint when a START_SPRINT file exists in the sprint folder. The
human creates this file by running `start-sprint.ps1`. The pipeline never starts autonomously.
This prevents the pipeline from running on incomplete or partially written input.

---

## SECTION 3 -- WORKSPACE DESIGN

### 3.1 The Three-Folder Workspace

The workspace uses a three-folder separation at the root level. Each folder has a distinct
character and access pattern. Never mix content between them.

**Path variables -- used consistently across all artefacts:**

| Variable    | Value                          | Character                              |
|-------------|--------------------------------|----------------------------------------|
| `$ROOT`     | the workspace root             | workspace root                         |
| `$APP`      | `$ROOT/app/`                   | application code (persists across sprints) |
| `$SPRINTS`  | `$ROOT/sprints/`               | all sprint artefacts (sprint-scoped)   |
| `$PIPELINE` | `$ROOT/agentic-pipeline/`      | agent infrastructure (stable, reusable)|

**app/** -- application code produced by developer agents. Persists across all sprints. Not
sprint-scoped. Sprint N and Sprint N+1 both write to the same `app/<layer>/`. Hash files for
`app/` are sprint-scoped (`.input-hash-sprint-##`).

**sprints/** -- all sprint artefacts. Every folder under `sprints/` is sprint-scoped -- Sprint N
artefacts are never touched by Sprint N+1.

| Folder                                                    | Owner            | Purpose |
|-----------------------------------------------------------|------------------|---------|
| `$SPRINTS/sprint-##/req-inputs/`                          | Human            | Raw inputs (any format) + START_SPRINT signal |
| `$SPRINTS/sprint-##/req-outputs/`                         | A-01             | RC-###.md cards + cross-sprint-refs.json |
| `$SPRINTS/sprint-##/ui-style-inputs/`                     | Human (optional) | Human-supplied design source material |
| `$SPRINTS/sprint-##/ui-style-outputs/`                    | A-03a            | tokens.json + theme.json (framework-specific) + style-system.md |
| `$SPRINTS/sprint-##/endpoint-design/`                     | A-02             | ED-###.md endpoint designs |
| `$SPRINTS/sprint-##/component-inventory/`                 | A-03b            | CI-###.md component inventories |
| `$SPRINTS/sprint-##/concerns/uicd/`                       | A-03b            | CNC-###.md concerns raised by UI designer |
| `$SPRINTS/sprint-##/concerns/resolutions/`                | A-01r            | Concern + clarification resolutions |
| `$SPRINTS/sprint-##/review/`                              | A-06             | review-report.md + review-summary.json |
| `$SPRINTS/sprint-##/review-inputs/{code-review,arch-review}/` | A-06 + Human | Per-finding CR-*.md / AR-*.md files |
| `$SPRINTS/sprint-##/review-outputs/`                      | A-04 + A-05      | rework ledgers + Excel reports |
| `$SPRINTS/sprint-##/tests/fe/{test-cases,test-results/{defects,disputes}}/`   | A-07 (+A-04 writes DSPs) | FE test artefacts |
| `$SPRINTS/sprint-##/tests/bff/{test-cases,test-results/{defects,disputes}}/`  | A-08 (+A-05 writes DSPs) | BFF test artefacts |
| `$SPRINTS/sprint-##/tests/microservice/`                  | reserved (A-09)  | future microservice test artefacts |
| `$SPRINTS/sprint-##/tests/db/`                            | reserved (A-10)  | future DB test artefacts |

**agentic-pipeline/** -- agent infrastructure. Rarely changes. Reusable across projects.

| Path                                          | Purpose |
|-----------------------------------------------|---------|
| `$PIPELINE/orchestrator-manifest.md`          | Orchestrator's single source of truth |
| `$PIPELINE/audit-log.md`                      | Append-only event log |
| `$PIPELINE/NOTIFICATIONS.md`                  | Human notification file (Orchestrator is sole writer) |
| `$PIPELINE/agents/CLAUDE-A-<id>-<fullname>.md` | Per-agent activation files |
| `$PIPELINE/.claude/agents/A-<id>-<fullname>-{definition,skills}.md` | Per-agent definition + skills |
| `$PIPELINE/hooks/H-<id>-<fullname>.ps1`       | Per-agent hooks scripts |
| `$PIPELINE/briefings/T-###-A-<id>-<fullname>-briefing.md` | Persisted context briefings |
| `$PIPELINE/scripts/`                          | Pipeline utilities (see Section 10.5) |
| `$PIPELINE/scripts/validators/V-<scope>-<topic>.ps1` | Tier-1 schema validators |

**Why this separation matters:**
A new team member opening the workspace immediately understands what each folder is for.
`app/` = what was built. `sprints/` = the history of design decisions. `agentic-pipeline/` = how the
pipeline runs. The `agentic-pipeline/` folder can be version-controlled and reused across different
projects without carrying along delivery artefacts from a specific project.

**Lazy creation -- a brand-new workspace has only `agentic-pipeline/` at the root.** `app/` and
`sprints/` are NOT pre-created by `workspace-setup.ps1`. They appear as a side-effect of the first
activation that needs them:

| Folder              | Created by                                       | When                                  |
|---------------------|--------------------------------------------------|---------------------------------------|
| `sprints/`          | `start-sprint.ps1` (idempotent `New-Item -Force`)| First sprint start                    |
| `sprints/sprint-##/`| `start-sprint.ps1`                               | Each sprint start                     |
| `app/frontend/`     | `H-04-frontend-developer.ps1`                    | First frontend developer activation   |
| `app/backend/`      | `H-05-backend-developer.ps1`                     | First backend developer activation    |

Why this rule:
- An empty `app/` or `sprints/` at the workspace root is visually indistinguishable from a workspace
  that has run a sprint. Lazy creation makes the "infrastructure only" state unambiguous.
- Empty placeholder directories often end up tracked in git (via `.gitkeep`) and produce noisy diffs
  the first time the pipeline runs.
- The Orchestrator's pre-activation hook (`H-00`) validates `agentic-pipeline/` only -- the absence
  of `app/` and `sprints/` is the correct state for a fresh workspace, not an error.
- New projects start from a clean infrastructure-only state; no manual cleanup is required when the
  pipeline is templated into a new repository.

The downstream hooks (`H-04`, `H-05`, `start-sprint`) already use `New-Item -ItemType Directory -Force`
which creates parent paths recursively, so first-activation creation is automatic and idempotent.

### 3.2 The Input Hash Rule

An agent must not overwrite its output if the input has not changed since the output was last
produced.

Implementation:
1. When an agent produces output, its hook records an MD5 hash of all input files in a `.input-hash`
   file alongside the output.
2. Before the next run, the hook computes a fresh hash of the current input.
3. If hashes match -> hook returns NO_CHANGE -> Orchestrator marks task `[=]` Skipped -> moves on.
4. If hashes differ -> hook returns PROCEED -> agent runs -> new hash stored on completion.

**What to hash per agent type:**
- A-01 (RA): hash all files in `req-inputs/` (excluding START_SPRINT)
- A-02 (BFF Designer): hash RC cards
- A-03a (Style Compiler): hash `ui-style-inputs/*` only (NOT RC cards)
- A-03b (Component Inventory): hash RC cards + A-03a outputs
- A-04 / A-05 (developers): sprint-scoped hash file in `app/<layer>/.input-hash-sprint-##`
- A-06 (Code Reviewer): hash all files in `app/frontend/` + `app/backend/`
- A-07 / A-08 (test agents) -- planning phase: hash RC + CI (or RC + ED) -- execution phase: hash test-cases + app code

### 3.3 Partial Output Recovery

If an agent is interrupted mid-run, it may leave partial output -- some files written but not all,
and no `.input-hash` file (because hashing happens on completion). The hooks script detects this
state and cleans up before a fresh run:

Detection: output files exist in the sprint output folder but no `.input-hash` file is present.
For `app/` folders: output files exist but no `.input-hash-sprint-##` file for the current sprint.
Action: remove all partial output files, log the cleanup in the audit log, return PARTIAL_RECOVERY
(then PROCEED).

### 3.4 Secret Handling

Hooks scripts must never contain hardcoded credentials, tokens, or passwords. All secrets are
loaded from environment variables at runtime. A `setup-secrets.ps1` script guides first-time
credential setup. `.gitignore` must explicitly exclude any file matching `*-secrets.*`, `.env`,
`*.key`, `*.pem`, `*-credentials.*`.

For enterprise environments with a vault:
```powershell
$secret = az keyvault secret show --vault-name $vaultName --name $secretName --query value -o tsv
```

---

## SECTION 4 -- ARTEFACT-ID AND FILENAME CONVENTIONS

All artefact IDs and pipeline filenames follow a consistent prefix convention.

### 4.1 Pipeline Infrastructure Filenames

| Prefix         | Used for                                | Example                                                    |
|----------------|-----------------------------------------|------------------------------------------------------------|
| `A-`           | Agent definition + skills files         | `A-04-frontend-developer-definition.md`                    |
| `CLAUDE-A-`    | Agent activation files (Claude entrypoint) | `CLAUDE-A-04-frontend-developer.md`                     |
| `H-`           | Hook scripts                            | `H-04-frontend-developer.ps1` (no `-hooks` suffix)         |
| `V-<id>-`      | Per-producer validator                  | `V-01-rc-schema.ps1` (validates A-01 output)               |
| `V-shared-`    | Cross-cutting validator                 | `V-shared-defect-schema.ps1` (used by multiple agents)     |
| `T-`           | Task IDs (in manifest + briefings)      | `T-001`, `T-GATE`, `T-007b`                                |
| `T-<###>-A-`   | Briefing files                          | `T-007-A-04-frontend-developer-briefing.md`                |

**Naming rules:**
- `<id>` is the agent ID without its prefix (e.g. `00`, `SM`, `01`, `01r`, `02`, `03a`, `03b`, `04`..`08`)
- `<fullname>` is lowercase, hyphenated, descriptive (e.g. `requirement-analyst`, `bff-designer`)
- All filenames are lowercase to avoid filesystem case-sensitivity issues across platforms

### 4.2 Per-Sprint Domain Artefacts (sequential across all sprints)

| Prefix       | Meaning                                          | Example          | Owner   |
|--------------|--------------------------------------------------|------------------|---------|
| `RC-###`     | Requirement card -- one per user story           | RC-001..RC-NNN   | A-01    |
| `ED-###`     | Endpoint design (number matches RC)              | ED-011 for RC-011 | A-02   |
| `CI-###`     | Component inventory (number matches RC)          | CI-011 for RC-011 | A-03b  |
| `TC-FE-###`  | FE test case                                     | TC-FE-001        | A-07    |
| `TC-BFF-###` | API test case                                    | TC-BFF-001       | A-08    |
| `TR-FE-###`  | FE test result (per case)                        | TR-FE-001        | A-07    |
| `TR-BFF-###` | API test result (per case)                       | TR-BFF-001       | A-08    |
| `DEF-FE-###` | FE defect (test-found bug)                       | DEF-FE-001       | A-07    |
| `DEF-BFF-###`| API defect (test-found bug)                      | DEF-BFF-001      | A-08    |
| `DSP-FE-###` | Defect dispute (developer rejects)               | DSP-FE-001       | A-04 writes; A-07 verdicts |
| `DSP-BFF-###`| Defect dispute (developer rejects)               | DSP-BFF-001      | A-05 writes; A-08 verdicts |
| `CR-###`     | Code review finding (first pass)                 | CR-FE-001        | A-06    |
| `CR2-###`    | Code review finding (re-review pass)             | CR2-FE-001       | A-06    |
| `AR-###`     | Architecture review finding (human-authored)     | AR-FE-001        | Human   |

Numbering is sequential **across all sprints** (Sprint 2 continues from where Sprint 1 ended).

### 4.3 Coordination Artefacts (per agent or per task)

| Prefix          | Meaning                  | Example       | Owner               |
|-----------------|--------------------------|---------------|---------------------|
| `T-###`         | Task in current sprint   | T-001, T-GATE | Manifest            |
| `T-###<letter>` | Rework iteration         | T-007b, T-007c | Manifest           |
| `CL-A##-###`    | Clarification request    | CL-A02-001    | Raised by A-##      |
| `CNC-A##-###`   | Concern (source-gap)     | CNC-A03b-001  | Raised by A-##      |
| `HB-###`        | Human blocker            | HB-003        | A-00 logs           |

**Why the agent ID is embedded in CL/CNC:** at scale you cannot tell who raised which clarification
from a flat sequence. `CL-A04-001` makes the raiser obvious.

**CL vs CNC vs HB -- the distinction that matters:**

- **CL (Clarification)** -- an agent has a *question about the requirement or about an upstream
  output*. The answer should exist somewhere (in source material, in an upstream agent's output).
  Routed via the escalation chain (typically to A-01r). Resolved within the pipeline if possible.
- **CNC (Concern)** -- an agent has identified a *gap in the source material itself*. There is
  nothing to ask -- the input is missing or insufficient. Logged to the agent's concerns folder
  for A-01r to address. CNCs typically result in either an updated RC card or a documented exception.
- **HB (Human Blocker)** -- a clarification or concern has been escalated all the way to the
  human because no agent in the pipeline can answer it. Requires a business decision, new
  information, or stakeholder input.

### 4.4 Producer JSON Routing Summaries

Every producer that creates routable output emits a JSON summary file alongside the verbose
Markdown artefacts. The Orchestrator reads ONLY these JSON files for routing decisions -- never
the Markdown bodies. This decouples routing logic from artefact format.

| File                                     | Producer | Consumer | Shape (summary) |
|------------------------------------------|----------|----------|-----------------|
| `review/review-summary.json`             | A-06     | A-00     | `{ totalFindings, byOwner, byCriticality, reworkRequired, verdict }` |
| `tests/fe/test-results/defect-summary-fe.json`   | A-07 | A-00 | `{ totalDefects, byOwner, byCriticality, reworkRequired }` |
| `tests/bff/test-results/defect-summary-bff.json` | A-08 | A-00 | `{ totalDefects, byOwner, byCriticality, reworkRequired }` |
| `tests/<layer>/test-results/dispute-summary.json` | A-04/A-05 | A-00 | `[{ id, verdict, defectRef, disputer }]` |
| `req-outputs/cross-sprint-refs.json`     | A-01     | A-SM, A-00 | `[{ rcRef, fromSprint, action, context }]` |
| `briefings/T-007-routing-plan.json`      | `route-defects.ps1` | A-00 | `{ perAgent: { activate, codeReviewCount, testDefectCount, inputs } }` |

**`byOwner` values:** `A-04 | A-05 | shared | test-case-bug | A-06 | other` (depending on context).
**`byCriticality` values:** `critical | high | medium | low | info`.

### 4.5 Sprint and File Naming

- Sprint folders: `sprint-##` (zero-padded -- `sprint-01`, `sprint-02`)
- Hash files (per-sprint outputs): `.input-hash`
- Hash files (`app/` outputs): `.input-hash-sprint-##`
- Briefing files: `T-###-A-<id>-<fullname>-briefing.md` (in `$PIPELINE/briefings/`)

### 4.6 RC Card Versioning

Every RC-###.md carries a version field (`v1.0`, `v1.1`...). When a card is updated (resolved
clarification, blocker resolution, concern resolution, change request) the version is bumped and
the change is documented in the card body.

**Batch bumps:** when one human blocker resolves multiple decisions affecting multiple cards
(Section 9.4 composite HB), all affected cards bump in the same batch. Agents that signed off on
the previous versions are notified once and asked to re-confirm at the new version.

---

## SECTION 5 -- THE FIVE UNIVERSAL PROTOCOLS

Every agent -- regardless of which one -- follows exactly these five protocols. They are defined
once and referenced in every agent definition file. No agent deviates from these protocols.

### Protocol 1 -- Startup

Before doing ANY work, every agent asks the Orchestrator four questions. The agent does not
proceed until all four are answered with explicit confirmation.

- Q1: "What is my input path for task [TASK-ID]?"
- Q2: "What is my output path for task [TASK-ID]?"
- Q3: "Are all my dependencies complete and the gate open?"
- Q4: "Is there a context briefing for me?"

The context briefing (Q4) contains:
- Any clarifications resolved since the last time this agent ran
- Any requirement card version updates affecting this agent's work
- Any known open issues the agent should be aware of
- Any decisions made by upstream agents that affect this agent's output

The Orchestrator responds with all four answers before the agent begins work. The briefing is also
**persisted** as `agentic-pipeline/briefings/T-###-A-<id>-<fullname>-briefing.md` (Section 6.8).

### Protocol 2 -- Sign-off (Gate Phase Only)

During the requirement sign-off gate, the six signing agents (A-02, A-03b, A-04, A-05, A-07, A-08)
switch to READ-ONLY review mode. They review requirement cards and either sign off or raise
clarifications/concerns. They must NOT begin design, implementation, or test-planning work during
sign-off review.

Sign-off message format:
```
Orchestrator: sign-off complete for [card list]. Requirements are clear and sufficient.
Ready to proceed when gate opens.
```

Clarification during sign-off:
```
Orchestrator: clarification required during sign-off on [RC-###].
Question: [specific question].
Cannot sign off until resolved.
```

An agent's sign-off is held -- not applied -- until all clarifications on the same card from all
other signing agents are resolved. This prevents partial gate-opens on cards with outstanding
questions.

### Protocol 3 -- Clarification

Agents must never guess or proceed on assumptions. Every ambiguity is raised explicitly. Partial
work on unblocked items continues while the blocked item awaits clarification.

```
Orchestrator: clarification request on task [TASK-ID].
ID: CL-A##-###
Routing to: [upstream agent name].
Question: [specific question -- be precise].
Blocking: [what cannot be done without this answer].
Continuing: [what other items are unblocked and being worked on].
```

The Orchestrator routes the question via the escalation chain. Requirement-level questions land
on A-01r (the resolver). See Section 9.

### Protocol 4 -- Completion

An agent must self-validate against its Definition of Done checklist before reporting completion.
Partial completion must never be reported as complete.

```
Orchestrator: task [TASK-ID] complete.
Output at: [path].
Files produced: [list].
JSON summaries emitted: [list, where applicable].
Definition of Done: all items passed.
Open clarifications: [none / list any outstanding].
```

If any DoD item fails: raise a blocker rather than reporting partial work as complete. The
Orchestrator validates the completion message and updates the manifest. The hook may invoke a
post-completion validator (Section 8.3) that mechanically re-checks structural DoD items.

### Protocol 5 -- Cost Discipline

Every agent inherits five cost-discipline rules. Full rules live in
`.claude/kb/cost-optimization-kb.md`. Summary:

1. **Foreground mode-switch is the default.** Sub-agent spawn is the exception. Every agent
   activation assumes the receiving session adopts the agent role via mode-switch.
2. **Trust `NO_CHANGE`.** If a hook returns NO_CHANGE, exit immediately and report `[=]` Skipped.
   Do not re-read inputs or regenerate output.
3. **Read the persisted briefing.** The briefing is authoritative. Do not re-derive context that
   already exists on disk.
4. **Sub-agent budget: 2 spawns per sprint.** Permitted only for Case A (true parallelism),
   Case B (heavy context isolation), or Case C (truncation-risk payload). Document the case in
   the audit log.
5. **`/compact` proactively.** After 3-4 mode switches OR > 60% context use, compact before
   context bloat forces an expensive fresh-session reload.

Model tier discipline: the activation file declares a `model:` tier (`haiku | sonnet | opus`).
For sub-agent spawns the Orchestrator invokes `scripts/select-model.ps1` which reads the declared
tier and applies dynamic overrides. Mode-switch inherits the session model unconditionally.

---

## SECTION 6 -- COORDINATION PATTERNS

### 6.1 Task Status Codes

| Code | Meaning                                                                    |
|------|----------------------------------------------------------------------------|
| `[ ]` | Not started. Task created but not yet activated.                          |
| `[~]` | In progress. Agent is actively working.                                   |
| `[?]` | Awaiting clarification. Paused while a clarification is being resolved.   |
| `[!]` | Blocked. Human input required.                                            |
| `[x]` | Complete. Output produced. DoD checklist passed.                          |
| `[>]` | Resumed. Task restarted after clarification or blocker was resolved.      |
| `[=]` | Skipped. Input hash matches previous run. Output preserved.               |
| `[T]` | Timed out. Task exceeded timeout threshold. Human attention required.     |
| `[V]` | Validation failed. Post-completion validator reported VALIDATION_FAIL.    |

### 6.2 The Requirement Sign-off Gate (Six Signing Agents)

The sign-off gate is a formal checkpoint between the requirements phase and the design phase.
No design, implementation, test-planning, or test-execution agent starts work until all six
signing agents have reviewed and signed off every requirement card.

**Why it exists:** fixing a misunderstood requirement after design or implementation has started
costs 5-10x more than catching it before any work begins.

**Six signing agents** (consumers of requirement cards):
- A-02 (BFF Designer)
- A-03b (UI Component Inventory)
- A-04 (Frontend Developer)
- A-05 (Backend Developer)
- A-07 (Frontend Tester)
- A-08 (BFF/API Tester)

**Non-signing agents:** A-00 (Orchestrator), A-SM (Sprint Manager), A-01 (RA producer), A-01r
(resolver), A-03a (Style Compiler -- no RC consumption), A-06 (Reviewer -- consumes implementation,
not requirements).

**Gate flow:**
1. A-01 (T-001) completes and reports to Orchestrator.
2. Orchestrator activates all six signing agents in READ-ONLY review mode.
3. Each agent reviews all RC-###.md files and responds: sign-off, clarification (CL-A##-###),
   or concern (CNC-A##-###).
4. Orchestrator routes clarifications via the escalation chain (typically to A-01r).
5. Gate remains CLOSED until ALL six agents show `[x]` signed off on all cards.
6. Orchestrator opens gate and activates the design + test-planning phase in parallel.

**Partial gate opening:** for large sprints, the Orchestrator may open the gate for individual
cards that are fully signed off while other cards remain in clarification. Tracked at the
requirement card level in the manifest.

**Sign-off status hints in the gate table:**

| Hint                     | Meaning |
|--------------------------|---------|
| `ALL_CLEAR`              | Agent has signed off and has no outstanding clarifications/concerns. |
| `ALL_CLEAR (re-review)`  | Agent re-signed after RC version bump. |
| `MIXED`                  | Some cards signed off, others held pending clarification. |
| `HELD`                   | Sign-off held pending another agent's clarification on the same card. |

**Gate cross-card notes:** a free-form "Cross-card notes for downstream tasks" block captures
decisions or constraints that came out of the gate review (e.g. library additions, documented
exceptions, deferred RCs). This is a structured communication channel from gate review to
downstream agents -- it surfaces in their context briefings.

### 6.3 The Clarification Loop

The clarification loop is not a failure mode -- it is the system working correctly. An agent
raising a clarification is doing its job properly.

Three resolution outcomes:
1. **Primary upstream resolves** -> upstream updates its output, bumps version, reports to
   Orchestrator -> Orchestrator sends resolution + context briefing -> task resumes `[>]`.
2. **A-01r resolves from source** -> A-01r writes resolution document, returns
   `RESOLVED_FROM_SOURCE` -> Orchestrator forwards to requesting agent. If verdict is
   `NEEDS_RC_UPDATE`, Orchestrator routes to A-01 to bump the affected RC.
3. **A-01r cannot resolve** -> verdict `HUMAN_BLOCKER` -> Orchestrator raises HB-### -> task
   marked `[!]` -> human resolves -> Orchestrator sends resolution -> task resumes.

The Clarification Log in the manifest is **never deleted** -- it is the institutional memory of
why decisions were made.

### 6.4 Human Blockers

A human blocker is raised when a clarification cannot be resolved from existing source material.
It requires new information, a business decision, or a stakeholder clarification.

Standard format in manifest:
```
| HB-001 | T-002 | A-02 | Which fields are mandatory? | [ ] Open | -- |
```

**Resolution:**
1. Human reviews `NOTIFICATIONS.md` (Orchestrator-written) or receives toast notification.
2. Human writes an answer into the Resolution column and flips status to `[x] Resolved`.
3. Orchestrator detects resolution, updates RC-###.md (bumping version) if needed.
4. Orchestrator resumes blocked task with context briefing.

**Composite HB (multiple decisions in one blocker):** a single HB may bundle N related decisions
when they were raised together and resolving them piecemeal would create churn. The resolution
column lists decisions as `D1`, `D2`, `D3`, ... and a single batch RC version bump cascades.

**Non-blocking HB:** an HB may be raised with `Task Blocked: None` when the question is for
human review/awareness but doesn't actually stop any task. The task continues in `[~]` rather
than moving to `[!]`.

### 6.5 The Rework Loop (Consolidated: Code Review + Test Defects)

After code review AND test execution, if Critical or High items exist on either side, a single
consolidated rework loop activates:

- **T-006 (Code Review)** completes -> emits `review-summary.json`.
- **T-011 + T-012 (Test Execution)** complete in parallel -> each emits `defect-summary-<layer>.json`.
- Orchestrator invokes `scripts/route-defects.ps1` which reads all three JSON summaries and emits
  `briefings/T-007-routing-plan.json` (Section 4.4).
- **T-007 (Consolidated Rework)** -- affected developers (A-04, A-05) fix BOTH code-review findings
  AND test defects in a single pass. The routing plan tells each developer which CR-*.md and
  DEF-*.md files they own (filtered by `owner:` tag).
- **T-008 (Re-review)** + **T-013/T-014 (Test re-execution)** -- A-06 re-reviews changed code,
  test agents re-run tests. Both run in parallel.
- If T-008 OR test re-execution finds new Critical/High -> T-007b (iterative rework) -> repeat.
- If all clean -> sprint pipeline complete.

The rework loop is only activated for Critical and High items. Medium and Low are documented but
do not trigger rework in the same sprint.

**Iterative rework (T-007b and beyond).** A real rework cycle frequently introduces *new* findings
of its own -- particularly when parallel rework agents make independent decisions about a contract
that spans them. The Orchestrator does NOT re-run T-007 identically. It spawns T-007b with a
tighter, finding-specific briefing AND a binding canonical decision for any cross-agent finding
(see canonical source-of-truth rule below). T-008 + T-013/T-014 then run another pass focused on
verifying the new findings closed. The cycle can continue (T-007c, T-007d, ...) but each iteration
must close strictly more findings than it introduces, or the team escalates the pattern as an HB.

**Canonical source-of-truth rule for cross-agent findings.** When a finding's `owner:` is `shared`
(spans two parallel agents), the activating agent MUST decide which side is the source of truth
BEFORE spawning the parallel rework agents -- and communicate that decision in BOTH briefings
verbatim. Letting each agent decide independently produces near-certain contract drift. The
conventional defaults:

- For data-shape findings on a server-side aggregate, **the server is canonical**: server-side
  schema is authoritative, client adapts.
- For UI-component contract findings (props, callbacks, slots), **the component owner is canonical**.
- For protocol/middleware findings (auth header shape, error envelope), **the producer is canonical**
  (server for response envelopes, client for request headers).

Document the decision inline in the manifest and quote it verbatim in each rework briefing.

**Owner-tag routing on per-finding files.** Each `CR-*.md` / `DEF-*.md` carries an `owner:`
frontmatter field with values `A-04 | A-05 | shared | other | test-case-bug` (DEFs only).
Rework agents filter the inbox by owner:

- A-04 picks up `A-04` + `shared`.
- A-05 picks up `A-05` + `shared`.
- `other` (findings about scripts, sprint artefacts, generic infra) is logged but not acted on in
  T-007. Picked up in a follow-up sprint.
- `test-case-bug` (DEFs only) routes back to the originating test agent -- NOT a developer task.

When a `shared` finding lands in two inboxes, the canonical-source-of-truth decision determines
which side does the structural work and which side adapts.

**Rework agent output artefacts.** Each rework agent produces TWO artefacts in
`review-outputs/`:

1. `A-##-ledger.json` -- machine-readable record of every finding the agent processed.
2. `A-##-rework-report.xlsx` -- human-readable Excel generated from the ledger by
   `scripts/build-review-report.mjs --sprint sprint-## --agent A-##`. The script extends to also
   include test defects (category `test-defect`) when present.

The ledger MUST be emitted before substantive file writes (see Section 11.5) so the "what was
done" record survives if the agent's output is truncated mid-stream.

**CR-* / CR2-* / CR3-* and DEF-* / DEF2-* prefix convention.** Per-finding file IDs are versioned
by the review pass that introduced them. Initial findings use `CR-` / `DEF-`. New findings raised
by re-review use `CR2-` / `DEF2-`. Keeps historical IDs stable as the codebase evolves.

**Verification gates before "complete".** A rework agent MUST run verification gates (lint + tests)
and confirm they exit 0 BEFORE reporting complete. A rework agent that reports complete with red
gates is producing a false completion (Section 12.2). The activating agent records the gate output
(exit codes) in the agent's completion report.

### 6.6 Test Sign-off Currency (D-034)

A test agent's PASS verdict is only valid against the application code + test-case state that was
current at the moment of sign-off. Any subsequent change to that state -- whether from a T-007
rework cycle, an iterative T-007b/T-007c, a mid-sprint code edit outside any rework path, or a
scope change that triggers re-implementation -- invalidates the sign-off.

Without this rule, the pipeline can complete a sprint with a stale "PASS" against an obsolete
build. With the rule, every code change is automatically re-tested.

**The mechanism (three small pieces, no test-agent skill change required):**

**1. Sign-off-hash file (written by the hook on PASS).**
When a test agent reports `verdict: PASS`, the Orchestrator invokes the test hook with
`-CommitSignoff`. The hook computes the current execution-phase hash (app code under test +
test-case folder) and writes it to `tests/<layer>/test-results/.signoff-hash`. This is the
durable record of "what state this sign-off was valid against".

**2. Generalised re-execution trigger (in the test hook).**
The T-013 / T-014 re-execution task no longer keys off "T-007 [x]". It keys off hash divergence:
- If `.signoff-hash` does not exist -> BLOCKED:NO_PRIOR_SIGNOFF (misroute -- nothing to re-run).
- If current hash matches `.signoff-hash` -> NO_CHANGE -> task marked `[=]`, zero LLM cost.
- If current hash differs from `.signoff-hash` -> PROCEED -> full regression re-run.

This generalisation lets one mechanism cover every drift trigger (rework cycle, mid-sprint touch,
scope change) without separate task IDs per cause.

**3. Re-evaluate on every developer completion (Orchestrator rule).**
After any A-04 or A-05 completion report (T-004, T-005, T-007, T-007b, mid-sprint, ...), the
Orchestrator invokes the corresponding test hook in re-execution mode. The hook either returns
NO_CHANGE (no work needed) or PROCEED (re-test required). The Orchestrator activates the test
agent only on PROCEED. This catches every code-change pathway with one routine call.

**Regression semantics.** When re-test fires, the agent runs the full TC set in its test-cases
folder. There is no "delta-only" mode at the agent level. Test frameworks (Vitest, Playwright,
supertest, etc.) handle their own internal caching of unchanged unit results -- that's a framework
concern, not a coordination concern. The agent's job is "run everything and report".

**New test cases.** If T-009 / T-010 was re-run because a new RC arrived (RC version bump,
cross-sprint modification, scope change), new TC-*.md files now exist in the test-cases folder.
The hash includes the test-cases folder, so the trigger fires; the agent picks up the new TCs by
folder scan automatically. No special "new vs existing" logic.

**What stays out of the test agent's skill file.** The test agent does NOT decide when to re-test,
which files changed, or whether sign-off is stale. Those are deterministic hook + Orchestrator
concerns. The agent's responsibility starts when activated and ends when it reports complete.

**Cost.** Each Orchestrator re-evaluation call is a hook invocation only -- no LLM tokens, no
agent activation, ~100 ms of PowerShell. On a stable sprint where most dev-agent touches don't
change tested code, NO_CHANGE dominates and the cost is negligible.

### 6.7 Defect Dispute Mechanism

When a developer disagrees with a test-found defect, the developer writes a `DSP-*.md` file in
`tests/<layer>/test-results/disputes/` (rather than silently rejecting the defect or arguing in
prose). The DSP carries a verdict from the developer's perspective:

| Verdict                  | Meaning |
|--------------------------|---------|
| `not-a-defect`           | The observed behaviour is correct per the requirement. |
| `test-case-incorrect`    | The test case has a bug; the implementation is correct. |
| `requirement-mismatch`   | The requirement itself is ambiguous; needs RA clarification. |
| `valid-defect`           | (Reserved) Developer agrees on second look; rare but valid. |

The originating test agent reads the DSP, re-judges the case, and writes the final verdict into
the DSP body:

- **Test agent accepts the dispute** -> DEF status `closed`; rework not required.
- **Test agent rejects the dispute** -> DEF status remains `open`; escalate to A-01r if the dispute
  was `requirement-mismatch` or if the test agent cannot resolve.

The dispute mechanism is a formal channel that prevents dev-vs-test silent disagreement and gives
the audit trail a clean record of contested defects.

**Producer-side authoring contract** (added 2026-05-15 -- D-035). The DSP authoring rules --
when to fix vs dispute, the DSP-*.md frontmatter schema (validated by `V-shared-dispute-schema.ps1`),
the `dispute-summary.json` shape, and the re-judgement handshake -- live in the producer agents'
own skills files, not only in this KB:

- A-04 -> `SKILL -- Defect Dispute Authoring (DSP-FE)` in
  `agentic-pipeline/.claude/agents/A-04-frontend-developer-skills.md`
- A-05 -> `SKILL -- Defect Dispute Authoring (DSP-BFF)` in
  `agentic-pipeline/.claude/agents/A-05-backend-developer-skills.md`

The contract emitted in the producer's `OUTPUT` section is: one `DSP-<layer>-###.md` per
disputed defect, plus exactly one `dispute-summary.json` in the same `tests/<layer>/test-results/`
folder. The summary file is the routing contract A-00 watches; missing it stalls the loop.

### 6.8 Parallel Agent Activation

The Orchestrator can activate multiple agents simultaneously when they have no dependency on each
other's output. Common parallel patterns:

- After sign-off gate opens: A-02 (T-002) + A-03a (T-003a) + A-07 (T-009) + A-08 (T-010) in parallel.
- After A-03a completes: A-03b (T-003b) starts.
- After design phase: A-04 (T-004) + A-05 (T-005) in parallel.
- After code review: A-07 (T-011) + A-08 (T-012) in parallel.
- After T-007 rework: A-06 (T-008) + A-07 (T-013) + A-08 (T-014) in parallel.

Two agents may run in parallel only if neither depends on the other's output. The manifest
dependency graph is the authoritative source for what can run in parallel.

**Cost note:** activating two agents in parallel via a sub-agent spawn counts as ONE Case-A spawn
under the Protocol 5 budget, not two.

### 6.9 Context Briefings -- Persisted, Not Ephemeral

Every time an agent is activated, the Orchestrator prepares a context briefing. Because each agent
session in the runtime is stateless -- it has no memory of previous sessions -- the briefing is
the only durable handoff.

Briefings are persisted as files in `$PIPELINE/briefings/`:

```
$PIPELINE/briefings/T-001-A-01-requirement-analyst-briefing.md
$PIPELINE/briefings/T-007-A-04-frontend-developer-briefing.md
```

The same content is also embedded in the activation prompt. **The file is the durable record;**
the prompt-embedded copy is the working copy.

Why persist briefings:
- Pause/resume across sessions: the human can stop the pipeline and resume tomorrow by re-spawning
  the agent with the existing briefing rather than rebuilding context from scratch.
- Audit and replay: every agent activation has a recoverable record of exactly what context it was
  given.
- Debugging: when an agent's output is surprising, the briefing is the first place to look.

Briefing contents:
- Task ID and sprint ID
- Protocol 1 answers (input path, output path, dependency status, briefing pointer)
- Resolved clarifications since this agent last ran
- RC version updates since this agent last ran
- Known issues, constraints, decisions from upstream agents
- For T-007 briefings: the routing plan slice + canonical source-of-truth decision for any
  `shared` finding
- Prior-attempt history (if the task was paused / retried) and what was learned

---

## SECTION 7 -- SPRINT LIFECYCLE

### 7.1 Sprint Initialisation

A sprint starts only when the human explicitly triggers it via `start-sprint.ps1`. The pipeline
never starts autonomously.

Sequence:
1. Human drops input files into `$SPRINTS/sprint-##/req-inputs/` (and optionally
   `$SPRINTS/sprint-##/ui-style-inputs/`).
2. Human runs: `start-sprint.ps1 -SprintId ## -Name "Sprint N" -Description "..."`.
3. Script creates the sprint folder skeleton (if not pre-existing) and the START_SPRINT signal file.
4. A-SM detects START_SPRINT.
5. A-SM validates at least one input file is present.
6. A-SM creates the full sprint folder tree (including `tests/{fe,bff,microservice,db}/`).
7. A-SM registers sprint in the manifest Sprint Registry + sets ACTIVE SPRINT block.
8. A-SM signals Orchestrator: proceed with T-001.
9. Orchestrator activates A-01 with briefing.
10. After A-01 completes, Orchestrator reads `cross-sprint-refs.json` and appends rows to the
    Cross-Sprint Log.

### 7.2 Sprint Isolation

Sprint N outputs never affect Sprint N+1 processing.
- Every sprint output folder uses `sprint-##` subfolders.
- Input hash files are scoped per sprint.
- Task registries are fresh per sprint (previous sprints archived, not deleted).
- Requirement card numbering is sequential across sprints.

### 7.3 Sprint Phases (After Gate Opens)

| Phase             | Tasks                       | Parallel? |
|-------------------|-----------------------------|-----------|
| Design            | T-002, T-003a then T-003b   | T-002 with T-003a; T-003b sequential after T-003a |
| Test Planning     | T-009, T-010                | Yes (parallel with design) |
| Implementation    | T-004, T-005                | Yes |
| Review            | T-006                       | Sequential (consumes T-004 + T-005) |
| Test Execution    | T-011, T-012                | Yes (parallel with each other; after T-004/T-005 + T-006) |
| Rework (consol.)  | T-007 (covers CR + DEF)     | A-04 + A-05 in parallel |
| Code Re-review    | T-008                       | Parallel with test re-execution |
| Test Re-execution | T-013, T-014                | Yes (parallel) |

### 7.4 Sprint Completion

Sprint completes when all tasks are `[x]` or `[=]`. Orchestrator signals A-SM. A-SM:
- Marks sprint Complete and records end date in Sprint Registry
- Archives the task registry
- Deletes the START_SPRINT file
- Invokes `scripts/build-velocity-report.ps1 -SprintId sprint-##` (does NOT hand-craft the report)
- Signals Orchestrator that report is written; Orchestrator appends to NOTIFICATIONS.md
- Waits for the next `start-sprint.ps1` invocation

### 7.5 Cross-sprint Modifications (Sprint N+1 changes a Sprint N card)

If Sprint N+1's input material references RC IDs from a prior sprint, A-01 detects this during
input parsing and emits `cross-sprint-refs.json` listing the affected RCs and intent
(`modify | reference | supersede`). A-SM reads the JSON during sprint registration and populates
the manifest Cross-Sprint Log. The Orchestrator then routes the modifications to A-01:
- RA updates the RC-###.md in the original sprint's folder with a version bump.
- Orchestrator notifies all agents that signed off on the previous version.
- Affected agents re-review the changed card before Sprint N+1 design work begins.

### 7.6 Mid-Sprint Deferral (Sprint N ejects work to Sprint N+1)

If during sign-off review (or later) the team decides a card cannot ship in the current sprint:
- A CL or CNC surfaces the issue; resolution is "defer to next sprint".
- The affected RC card is bumped with `Status: DEFERRED to sprint-N+1`.
- The gate's Cross-card notes section records the deferral.
- The card itself stays in the current sprint's `req-outputs/` (history is preserved).
- A-SM picks up the deferred card when initialising the next sprint.

---

## SECTION 8 -- QUALITY AND VALIDATION

### 8.1 The Definition of Done

Every agent must define a specific DoD checklist in its skills file. The checklist must be concrete
and binary -- every item is either clearly passed or clearly failed. Vague items like "output is
good quality" are not acceptable.

Standard DoD template structure:
- **Completeness:** every input item has a corresponding output item
- **Format:** every output item contains all required fields with no TBD values
- **Constraints:** all project-specific constraints respected
- **JSON summary emitted** (where applicable): the routing-contract JSON file is present
- **Open items:** no open clarification or concern outstanding (or all open items are explicitly
  documented exceptions, see 8.5)

### 8.2 Output Quality Self-Validation

Before reporting completion, every agent self-validates its own output against its DoD checklist.
This is the agent's own quality gate -- before the Orchestrator's.

If any DoD item fails:
- The agent does NOT mark itself complete.
- The agent raises a blocker.
- The Orchestrator updates the task to `[!]` Blocked and notifies the human.

### 8.3 Tier-1 Hook Validators (Mechanical Schema Checks)

Mechanical schema and structural checks live in hook-invoked PowerShell validators, NOT inside the
agent's reasoning. Validators are deterministic, parse-checked, and cost zero LLM tokens.

**Validator naming** (Section 4.1): `V-<id>-<topic>.ps1` (per-producer) or `V-shared-<topic>.ps1`
(cross-cutting).

**Per-producer validators** -- one per agent whose output has a structural contract:

| Validator                       | Validates             | Invoked by       |
|---------------------------------|-----------------------|------------------|
| `V-01-rc-schema.ps1`            | RC-*.md frontmatter   | H-01 post-completion |
| `V-02-ed-schema.ps1`            | ED-*.md schema        | H-02 post-completion |
| `V-03a-tokens-schema.ps1`       | tokens.json + style-system.md | H-03a post-completion |
| `V-03b-ci-schema.ps1`           | CI-*.md schema        | H-03b post-completion |
| `V-06-finding-schema.ps1`       | CR-*.md / AR-*.md frontmatter | H-06 post-completion |

**Cross-cutting validators** -- shared logic invoked by multiple hooks or checking joint contracts:

| Validator                          | Validates                                 | Invoked by |
|------------------------------------|-------------------------------------------|------------|
| `V-shared-helpers.ps1`             | (helper module, dot-sourced by others)    | -- |
| `V-shared-defect-schema.ps1`       | DEF-*.md frontmatter (via -Layer param)   | H-07 + H-08 post-completion |
| `V-shared-dispute-schema.ps1`      | DSP-*.md frontmatter (via -Layer param)   | H-07 + H-08 post-completion |
| `V-shared-ci-ed-alignment.ps1`     | CI ↔ ED joint contract                    | H-04 pre-activation |
| `V-shared-rc-ci-coverage.ps1`      | Every RC has at least one CI              | H-03b post / H-04 pre |
| `V-shared-ed-rc-coverage.ps1`      | Every RC has at least one ED              | H-02 post / H-05 pre |

**Return codes:**
- `VALIDATION_PASS:<validator-name>:count=<n>` (exit 0)
- `VALIDATION_FAIL:<validator-name>:<code>:<target>:<detail>` (exit 1)
- `ALIGNMENT_CONFLICT` (cross-cutting validators when joint contract is broken)

**Post-completion invocation -- the `-PostCheck` switch** (added 2026-05-15 -- D-036). Every
producer hook (H-01, H-02, H-03a, H-03b, H-06, H-07, H-08) accepts a `[switch]$PostCheck`
parameter. When A-00 receives a completion report from one of these agents -- and BEFORE marking
the task `[x]` -- it invokes the hook with `-PostCheck`. The hook runs the declared Tier-1
validators for that agent and collapses their exits into a single `VALIDATION_PASS` /
`VALIDATION_FAIL` signal (exit 0 / exit 1). Symmetric with H-04's pre-activation alignment
pattern. A-04 and A-05 are deliberately NOT in this list -- their artefact is code, not a
schema-validated document; their structural gate is the existing pre-activation alignment check
on H-04. See Section 10.6 for the invocation example.

**Why this matters (SRP):** mechanical checks used to live inside agents' sign-off and DoD prose.
Every sign-off review burned LLM tokens re-checking frontmatter, missing fields, no-TBD, etc.
Moving these to deterministic scripts keeps agent prompts focused on **semantic** judgement
(can this be designed / implemented / tested?) instead of structural verification.

### 8.4 Cross-Output Alignment Check

Before activating an agent that consumes multiple upstream outputs, the consuming agent's hook
invokes the relevant `V-shared-*-alignment.ps1` validator. If misalignment is detected:

- Hook returns `ALIGNMENT_CONFLICT` instead of `PROCEED`
- Orchestrator marks the consuming task `[!]` and routes the conflict back to the producing agents
- The consuming agent never starts work on misaligned inputs

This replaces the older pattern where the consuming agent did its own pre-start alignment check in
its own prompt -- the check is now mechanical.

### 8.5 Documented Compliance Exceptions

Sometimes a card cannot meet every stated constraint within the current sprint. Rather than silently
shipping the gap, the team may **document the exception**:

- The exception is recorded in the RC card body and in the gate's Cross-card notes.
- The agent's DoD treats "documented exception present" as a passing condition for the affected
  rule.
- A follow-up item is logged (typically in the next sprint's inputs).

Documented exceptions are not failure modes -- they are deliberate trade-offs visible in the audit
trail.

### 8.6 Audit Trail

Every significant pipeline event is written to `audit-log.md`. The audit log is append-only --
entries are never edited or deleted.

Format: `| [timestamp] | [agent] | [event type] | [detail] |`

Standard event types:
- Sprint initialised / Sprint complete
- Task started / Task complete / Task skipped (no change) / Task blocked / Task timed out
- Clarification raised / Clarification resolved
- Concern raised / Concern resolved
- Human blocker raised / Human blocker resolved
- Sign-off received / Gate opened
- Rework activated (T-007, T-007b, ...)
- Validation pass / Validation fail / Alignment conflict
- Model selection (every sub-agent spawn, with reason)
- Dispute raised / Dispute resolved

Hook scripts that mechanically append to the audit log use the helper `scripts/manifest-writer.ps1`
function `Append-AuditLog` (Section 10.5).

**Manifest log trigger reference** (added 2026-05-15 -- D-037). `manifest-writer.ps1` exposes five
append helpers -- `Append-AuditLog`, `Append-TestDefect`, `Append-Dispute`, `Append-Validation`,
`Append-CrossSprint`. Each one corresponds to a specific manifest section, and each fires on a
specific pipeline event. The canonical event -> helper mapping lives in the A-00 definition's
"Manifest log triggers" subsection
(`agentic-pipeline/.claude/agents/A-00-orchestrator-definition.md`), not duplicated here, so the
trigger rules sit next to the Orchestrator behaviour that invokes them. Without these triggers,
the Test Defect Log / Dispute Log / Validation Log / Cross-Sprint Log stay empty even when the
underlying events fire -- the manifest stops being a live coordination record.

### 8.7 Timeout Detection

Every task in the manifest has a timeout threshold. If a task remains `[~]` In Progress for longer
than its threshold without a completion, clarification, or blocker signal, the Orchestrator marks
it `[T]` Timed Out and writes to NOTIFICATIONS.md (via the Orchestrator's single-writer rule).

Timeout thresholds are agent-and-sprint-specific. They should be set with enough headroom that
they catch genuine hangs but don't false-positive on legitimate long work.

---

## SECTION 9 -- ESCALATION AND BLOCKERS

### 9.1 The Escalation Chain

Every agent has a defined escalation chain -- who it asks first and who it escalates to. The chain
must be defined in the agent's definition file. The Orchestrator is the routing mechanism --
agents never call each other directly.

Standard escalation patterns:

| Agent type                       | Ask first         | Then escalate to  | Final escalation |
|----------------------------------|-------------------|-------------------|------------------|
| Design agent (consumes RC)       | A-01r             | --                | Human blocker    |
| UI Component Inventory (A-03b)   | A-03a, then A-01r | --                | Human blocker    |
| Implementation agent             | Their design agent | A-01r             | Human blocker    |
| Test agent (consumes RC + design)| Their design agent | A-01r             | Human blocker    |
| Code Reviewer (business intent)  | --                | --                | Human blocker    |

Multi-hop routing is rendered compactly in the manifest, e.g. `Routed To: A-01r -> A-01 -> human`.

### 9.2 Clarification vs Concern vs Human Blocker

See Section 4.3 for the high-level distinction. Operationally:

| Type | Raised when                                | Goes to                       | Resolved by                          |
|------|--------------------------------------------|-------------------------------|--------------------------------------|
| CL   | An answer should exist; the agent is unsure | Primary upstream via A-00     | Upstream agent or A-01r (resolver)   |
| CNC  | The source material itself is missing/gappy | Agent's concerns folder       | A-01r writes resolution (or doc exception) |
| HB   | No agent in the pipeline can answer         | Human via NOTIFICATIONS.md    | Human writes answer in Blocker List  |

A-01r is the resolver -- the last line of defence before a human blocker for requirement-level
questions.

### 9.3 Defect Dispute Routing (Test Defects)

Test defects (DEF-*.md) have an additional layer: developers can dispute them. See Section 6.6.

| Stage         | Actor          | Action                                                          |
|---------------|----------------|-----------------------------------------------------------------|
| Defect raised | Test agent     | Writes DEF-*.md with `owner:` tag                               |
| Dispute       | Developer      | Writes DSP-*.md with verdict                                    |
| Re-judgement  | Test agent     | Writes final verdict to DSP body; updates DEF status            |
| Escalation    | Orchestrator   | If verdict is `requirement-mismatch`, route to A-01r            |
| HB            | A-01r          | If A-01r cannot resolve, raise HB-### via Orchestrator          |

### 9.4 Composite Human Blockers

A single HB may bundle multiple related decisions when they emerged together and resolving them
piecemeal would create churn. Format:

```
| HB-003 | T-GATE (4 of N cards held) | A-00 | [multi-part question listing D1..D6] | RESOLVED -- D1: ... D2: ... D3: ... |
```

When the human resolves a composite HB:
- The resolution column lists each decision (D1, D2, ...).
- All affected RC cards are bumped to a new version in a **single batch** by A-01.
- All previously-signed agents are notified once and re-confirm via `ALL_CLEAR (re-review)`.

Soft cap of ~6 decisions per composite HB. If a single HB grows past that, split it.

### 9.5 Non-Blocking Human Blockers

Some HBs are raised purely to surface ambiguities to the human without halting work. The task does
NOT move to `[!]`. Timeout does not apply. The HB exists for human attention only and may be
resolved at the human's pace, possibly across multiple sprints.

### 9.6 The Human Notification Mechanism

When the Orchestrator requires human attention it writes to `NOTIFICATIONS.md`. The Orchestrator
is the **sole writer** of this file. Other agents (notably A-SM) emit structured signals to the
Orchestrator (`NOTIFY_REQUEST:<level>:<message>`); the Orchestrator appends the row.

`NOTIFICATIONS.md` structure:
- Top section: **Active notifications** (awaiting human action)
- Middle section: **Resolved (last 30 days)** (audit trail of recent items)
- Items older than 30 days are pruned from the file (they remain in the audit log).

For immediate attention items (blocking human blockers, timeouts) a desktop toast notification is
triggered alongside the file write.

### 9.7 Scope / Stack Expansion via Clarification

A signing agent during sign-off may discover that a card requires capabilities not present in the
mandated stack. The correct path is:

1. Agent raises a CL during sign-off naming the gap and the strong candidate(s).
2. Orchestrator routes to A-01r -> typically escalates to human (architecture decision).
3. Human resolves with the chosen library and any constraints.
4. RC card(s) bump to record the new dependency.
5. Implementation agent adds the library on activation.

Scope/stack expansion is a legitimate clarification, not a failure. The signing agent's job is to
surface gaps before implementation discovers them.

---

## SECTION 10 -- HOOKS SCRIPTS AND HELPER UTILITIES

### 10.1 Hook Responsibilities

Every agent has a dedicated hooks script (`H-<id>-<fullname>.ps1`). The hook is called by the
Orchestrator before the agent is activated. It returns a signal that tells the Orchestrator
whether to proceed.

Standard hook responsibilities (in execution order):
1. Receive parameters: sprint ID, task ID, workspace root path
2. Validate workspace root exists
3. Check all upstream dependency outputs exist and are complete (have `.input-hash` files)
4. Check for partial output (output files exist but no `.input-hash` -- interrupted run)
   - If partial: clean up and set state to PARTIAL_RECOVERY
5. **Pre-activation validators (where applicable)** -- invoke cross-cutting validators that gate
   activation (e.g. H-04 invokes V-shared-ci-ed-alignment.ps1 before returning PROCEED)
6. Compute MD5 hash of all input files
7. Compare to stored hash in `.input-hash`
   - If match: return NO_CHANGE
   - If mismatch or no prior hash: proceed to step 8
8. Create output directory if it does not exist
9. Load required secrets from environment variables
10. Return PROCEED with: input path, output path

**Post-completion (after agent reports complete):** the hook (or the Orchestrator on the hook's
behalf) invokes the relevant `V-<id>-*.ps1` validator. On VALIDATION_FAIL the task is marked
`[V]` and the agent is reactivated with the failure detail in the next briefing.

### 10.2 Hook Return Signals

| Signal                  | Meaning                                                                  |
|-------------------------|--------------------------------------------------------------------------|
| `PROCEED`               | All checks passed; activate agent                                        |
| `NO_CHANGE`             | Input hash matches; output current; skip activation                      |
| `BLOCKED`               | Upstream dependency incomplete; cannot proceed                           |
| `PARTIAL_RECOVERY`      | Partial output cleaned up; proceed with clean start                      |
| `ALIGNMENT_CONFLICT`    | Cross-cutting validator detected joint-contract conflict                 |
| `SPRINT_ALREADY_ACTIVE` | A-SM only: sprint with this ID is already running                        |
| `ERROR`                 | Unexpected state; details in return message; human attention required    |

### 10.3 Hook Script Template Structure

```powershell
param(
    [string]$SprintId = "sprint-01",
    [string]$TaskId = "T-XXX",
    [string]$WorkspaceRoot = "."
)

# 1. Validate workspace
# 2. Check upstream dependencies
# 3. Detect partial output
# 4. Pre-activation validators (where applicable)
# 5. Compute input hash
# 6. Compare hash
# 7. Create output directory
# 8. Load secrets
# 9. Return signal + paths
```

### 10.4 Secret Handling in Hooks

NEVER hardcode credentials in hook scripts. Load all secrets from environment variables:

```powershell
$apiKey = $env:VENDOR_API_KEY
$pat    = $env:GIT_PAT
```

For Azure Key Vault (enterprise):
```powershell
$secret = az keyvault secret show `
    --vault-name $env:KEY_VAULT_NAME `
    --name $secretName `
    --query value -o tsv
```

`setup-secrets.ps1` guides each developer through setting required environment variables on first
run. `.gitignore` must exclude: `*.env`, `*-secrets.*`, `.secrets`, `*.key`, `*.pem`,
`*-credentials.*`.

### 10.5 Helper Utility Scripts

The pipeline ships with reusable PowerShell + Node helpers in `agentic-pipeline/scripts/`. These
are infrastructure scripts that hooks and the Orchestrator invoke; they hold mechanical detail so
agent definitions stay narrative.

| Script                          | Purpose | Invoked by |
|---------------------------------|---------|------------|
| `start-sprint.ps1`              | Bootstrap a new sprint (creates sprint folder + START_SPRINT signal) | Human |
| `workspace-setup.ps1`           | First-time workspace bootstrap | Human (one-off) |
| `setup-secrets.ps1`             | First-time credential setup walkthrough | Human (one-off) |
| `manifest-writer.ps1`           | Helpers to append rows to manifest tables (Audit Log, Test Defect Log, Dispute Log, Validation Log, Cross-Sprint Log) | A-00 (via hooks) |
| `route-defects.ps1`             | Reads `review-summary.json` + `defect-summary-*.json` → emits `T-007-routing-plan.json` | A-00 before T-007 |
| `build-velocity-report.ps1`     | Generates `sprints/sprint-##/review/velocity-report.md` from manifest + audit-log + JSON summaries | A-SM at sprint completion |
| `build-review-report.mjs`       | Converts rework ledger JSON to xlsx Excel report | A-04 + A-05 in T-007 |
| `select-model.ps1`              | Picks model tier for a sub-agent spawn (reads agent's declared `model:`; applies dynamic rework rule) | A-00 before every sub-agent spawn |
| `check-scripts.ps1`             | Parse-checks all PowerShell scripts in the pipeline | Human / CI |
| `copy-definations.ps1`          | One-off copy helper for migrating agent definitions across workspaces | Human |

### 10.6 Validator Invocation Pattern

Validators are dot-sourced or invoked as one-shots:

```powershell
# Dot-source (in another PowerShell script):
. "$PSScriptRoot\..\scripts\validators\V-shared-helpers.ps1"
$fm = Read-Frontmatter -Path $someFile
Test-RequiredFrontmatter -Frontmatter $fm -RequiredKeys @("id","owner") -Path $someFile -Validator "my-check"

# One-shot (from a hook, pre-activation -- alignment check):
& "$PSScriptRoot\..\scripts\validators\V-shared-ci-ed-alignment.ps1" -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
if ($LASTEXITCODE -ne 0) { Write-Output "ALIGNMENT_CONFLICT"; exit 1 }
```

**Post-completion invocation via `-PostCheck` (D-036):** producer hooks expose a `-PostCheck`
switch that runs the declared Tier-1 validators and collapses their exits into a single
`VALIDATION_PASS` / `VALIDATION_FAIL` signal. A-00 calls each hook with `-PostCheck` immediately
after the corresponding agent reports complete, BEFORE marking the task `[x]`:

```powershell
# A-00 invokes after A-02 reports complete:
pwsh agentic-pipeline\hooks\H-02-bff-designer.ps1 -PostCheck `
     -SprintId sprint-01 -WorkspaceRoot . -TaskId T-002
# stdout: VALIDATION_PASS | VALIDATION_FAIL ; exit 0 | 1

# Then append to the manifest Validation Log via the helper:
pwsh agentic-pipeline\scripts\manifest-writer.ps1 -Action AppendValidation `
     -Fields @{ Validator="V-02-ed-schema+V-shared-ed-rc-coverage"; Target="sprints\sprint-01\endpoint-design"; Result="VALIDATION_PASS"; Detail="ed-cards=23" }
```

Inside the hook, the `-PostCheck` block sits before the dependency / hash logic so it never
touches manifest state -- it is pure validation:

```powershell
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-02-ed-schema.ps1"
    $v2 = Join-Path $ValidatorsRoot "V-shared-ed-rc-coverage.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    $exit1 = $LASTEXITCODE
    & $v2 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    $exit2 = $LASTEXITCODE
    if ($exit1 -eq 0 -and $exit2 -eq 0) { Write-Output "VALIDATION_PASS"; exit 0 }
    Write-Output "VALIDATION_FAIL"; exit 1
}
```

---

## SECTION 11 -- EXECUTION MODEL

This section describes the operational realities of running agents in a real runtime. These are
patterns the pipeline depends on but that are not visible in the agent definitions.

### 11.1 Foreground Mode-Switch vs Sub-Agent Spawn

The pipeline distinguishes two activation mechanisms:

**Foreground mode-switch (default, Tier 1 cost).** When the human says "Activate [agent name]",
the receiving Claude session BECOMES that agent by reading its definition + skills + briefing.
Same session, same model. State persists in files on disk between mode switches. This is the
cheapest activation mechanism and the default for ~85% of activations.

**Sub-agent spawn (exception, Tier 4 cost, 3-5x baseline).** A separate sub-agent is spawned in
isolated context. Permitted only for:
- **Case A: True parallelism.** Two agents must run simultaneously and the work is independent
  (e.g. A-04 + A-05 in T-007 rework).
- **Case B: Heavy context isolation.** A task needs Explore-style scanning that would bloat the
  parent session.
- **Case C: Truncation-risk payload.** A task's output forecast exceeds the ~80 KB transcript
  ceiling on inline returns; pre-emptively split into focused parallel sub-agents.

**Default budget: 2 spawns per sprint.** Any additional spawn requires audit-log justification.

**The historical sub-agent permission gap.** Some runtimes have a known gap where background
sub-agents may auto-deny write permission prompts even when an explicit allow rule exists. Two
working patterns:

1. **Foreground-write pattern (safest):** sub-agent reads + reasons + returns artefacts inline;
   the foreground agent parses and writes. Trade-off: inline return is subject to the truncation
   ceiling (Section 11.5).
2. **Direct-disk-write (preferred when truncation risk is high):** pre-authorise `Write` and
   `Edit` for the workspace path in settings before launching; sub-agent writes directly. Skip
   inline return except for a concise completion summary.

### 11.2 Model Tier Discipline

The activation file declares a `model:` tier (`haiku | sonnet | opus`). For sub-agent spawns the
Orchestrator invokes `scripts/select-model.ps1` which reads the declared tier and applies a
single dynamic override:

- A-04 or A-05 with `ReworkCycle >= 2` → force `opus` (rationale: second-pass rework hunts
  subtle bugs that benefit from stronger reasoning).

Adding a second dynamic rule requires an ADR. Path-A-by-accretion is a real risk -- keep the
override set to 1 rule.

For foreground mode-switch: the session model is used unconditionally; the declared tier is
advisory.

Full rules in `.claude/kb/cost-optimization-kb.md` Section 11A. Recommended session model:
`sonnet` (covers ~85% of pipeline work). Opus is declared on the three production agents
(A-01, A-04, A-05) so it activates only on Case A/B/C spawns.

### 11.3 Input Preprocessing

Some inputs cannot be consumed by the agent as-is. Common cases:

- **Image dimension caps:** vision APIs typically have a per-image dimension limit (e.g. 2000 px
  max edge). Inputs exceeding the limit must be resized before agent activation.
- **Context-window pressure:** loading too many images in a single context window can blow up the
  sub-agent even when each image is individually compliant.
- **File-format conversion:** some agents need text extraction from PDF or DOCX before they can
  reason about the content.

**The resize-with-backup pattern:**
- Originals are preserved in a `.originals/` subfolder (hidden -- agents must be told to ignore it).
- Working copies in the agent's input folder are the resized versions.
- Briefing must call out the rule: "ignore .originals/, treat the input folder as authoritative".
- Preserve aspect ratio; choose a target dimension with headroom under the runtime cap.

**The batch-processing pattern:**
- Group inputs by feature/topic first using cheap signals (filenames, folder structure).
- Process one batch at a time; write per-batch observation notes to a `.scratch/` folder.
- After all batches are observed, consolidate from the notes (not the originals) to produce final
  output.
- Keep any single context window to a small number of images.

Preprocessing should be done **outside** the agent's run (as a hook step or a one-off human
operation logged in the audit log), not interleaved with reasoning. The agent should always see
clean, normalised input.

### 11.4 Pause and Resume Across Sessions

The pipeline can be paused mid-task and resumed in a later session. The mechanism:

- Task status moves to `[~]` (in progress) when the run starts; if the human stops the session,
  the status remains `[~]` (or is updated to a deliberate paused state in the audit log).
- The persisted briefing in `agentic-pipeline/briefings/` carries all context.
- On resume, the human re-activates the agent. The Orchestrator updates the briefing if anything
  has changed (e.g. a clarification was resolved during the pause) and the agent re-reads it.
- Any partial output is detected by the hook (Section 10.1 step 4) and cleaned up before fresh
  work begins.

The audit log records pause and resume events.

### 11.5 Truncation Recovery for Sub-Agent Returns

Background sub-agent inline returns are subject to a transcript ceiling that has been observed at
**~80 KB of returned content** on current runtimes. Larger returns are truncated silently from
the tail. Common symptoms:

- The agent's "completion report" section is cut off mid-sentence or missing entirely.
- The last 1-3 file blocks in a `FILE_BEGIN/FILE_END` inline emission are partial or absent.
- The foreground agent sees a valid-looking response but only a subset of the promised files.

**Mitigation patterns:**

1. **Emit the ledger FIRST.** Whenever a sub-agent produces both a ledger and substantive files,
   the ledger MUST be the first artefact in the response. If truncation hits the tail, the
   "what was done" record survives and the foreground can spawn focused recovery sub-agents for
   the missing files.

2. **Split into focused parallel sub-agents BEFORE truncation hits.** When a task's output is
   forecast to exceed ~50 KB, pre-emptively split into 2-3 narrow-scope sub-agents that run in
   parallel. Each sub-agent's return then fits comfortably under the ceiling. The activating
   agent coordinates them via explicit briefings that describe the contract boundary.

3. **Direct-disk-write when payload is large AND verifiable.** When pre-auth is in place and the
   sub-agent's work is bounded to a known set of paths, prefer direct disk writes. The transcript
   ceiling does not apply to disk writes -- only to inline returns.

4. **Recovery from observed truncation.** Trust the ledger if it was emitted first; spawn focused
   recovery sub-agents for the missing files. Do NOT try to read the runtime's `<task-id>.output`
   temp file to recover the lost content -- those files are 0-byte placeholders on most runtimes.

5. **Verify what landed.** After truncation recovery, run lint + tests. A truncation that left
   half a feature on disk and half in the lost tail surfaces as a compile error.

---

## SECTION 12 -- COMMON FAILURE MODES

### 12.1 Agent Guessing Instead of Clarifying
Symptom: agent produces output that does not match the requirement; discovered late.
Cause: agent proceeded on an assumption rather than raising a clarification.
Prevention: Protocol 3 strictly enforced. Output produced on an assumption is suspect.
Detection: Code Reviewer findings referencing requirement mismatches.

### 12.2 False Completion Reports
Symptom: downstream agent discovers upstream output is incomplete or incorrect.
Cause: upstream agent reported complete without passing its DoD checklist; the post-completion
validator was skipped or its failure was not surfaced.
Prevention: Orchestrator validates the DoD checklist on every completion receipt; post-completion
validators (Section 8.3) mechanically re-check structural items.
Detection: downstream agent raises clarification on what should have been complete output, or
`[V]` Validation Failed appears in the manifest.

### 12.3 Hash File Corruption
Symptom: agent re-runs unnecessarily every time even though input has not changed.
Cause: `.input-hash` file is corrupted, empty, or contains an incorrect hash.
Fix: delete the `.input-hash` file -- the hook will recompute on the next run.

### 12.4 Pipeline Drift Across Sessions
Symptom: agent produces different output on re-run even with same input.
Cause: stateless agent sessions interpret instructions differently each time.
Prevention: the persisted context briefing makes drift visible. Agent definitions and skills must
be unambiguous -- every term defined, every output format specified in concrete detail.

### 12.5 Sign-off Gate Bypassed Under Time Pressure
Symptom: design or test misalignment discovered during implementation or execution.
Cause: sign-off gate was skipped to save time.
Prevention: enforce the gate as a hard rule -- no exceptions. The gate always costs less than the
rework it prevents.

### 12.6 Manifest State Corruption
Symptom: tasks reported as complete that were not, or tasks activated before dependencies were ready.
Cause: a non-Orchestrator agent wrote to the manifest outside its permitted region.
Prevention: only the Orchestrator writes to `orchestrator-manifest.md`, with the documented
carve-out for A-SM (Section 2.5). All other agents read via context briefings. NOTIFICATIONS.md
has the same single-writer rule (Orchestrator only).

### 12.7 Sprint Folders Not Isolated
Symptom: Sprint N+1 agent re-processes Sprint N requirement cards.
Cause: hooks script not using sprint-scoped paths.
Prevention: every hook script receives the active sprint ID as a parameter and uses it for all
path construction. Never construct paths without the sprint ID.

### 12.8 Sub-Agent Write Denial
Symptom: sub-agent appears to run, but no files appear on disk; no error surfaces.
Cause: background sub-agent permission propagation gap.
Prevention: pre-authorise Write/Edit in settings before launch; or use foreground-write pattern.

### 12.9 Sub-Agent Image-Dimension Failure
Symptom: sub-agent crashes early when reading many images; long run with zero output.
Cause: one or more images exceed the vision API per-image dimension cap.
Prevention: preprocess images (Section 11.3). Document the cap in the briefing.

### 12.10 Sub-Agent Context Blow-Up
Symptom: sub-agent runs longer than expected, produces partial output, then stops.
Cause: too many inputs loaded into a single context window even if individually compliant.
Prevention: batch-processing pattern (Section 11.3).

### 12.11 Cross-Agent Contract Drift in Parallel Rework
Symptom: T-008 (re-review) reports new Critical/High findings about contract mismatches between
artefacts produced by parallel rework agents in T-007 (e.g. one side names a field `segments[]`
while the other returns `segmentIds[]`).
Cause: parallel rework agents made independent decisions about a `shared`-owned finding because
the activating agent did not pre-decide the canonical source of truth (Section 6.5).
Prevention: for every `shared` finding, the activating agent decides the canonical side BEFORE
spawning rework, and quotes the decision verbatim in BOTH briefings.
Detection: T-008 critical/high findings whose `location:` straddles two agents' folders, or whose
`comment:` field describes a same-aggregate disagreement.
Recovery: spawn T-007b with the canonical decision and tightly-scoped per-side tasks.

### 12.12 Dev-Default Fragility (Ready-to-Run Failure)
Symptom: a freshly-cloned app fails on its dev-mode boot because a required env var has no usable
dev default. The user sees a runtime error unrelated to their actual change.
Cause: the agent that wrote the env-loading code chose strict defaults that match production but
not development.
Prevention: env-loading code must default to dev-safe values when not in production mode AND the
explicit env var is unset. Production gating is a separate concern.
Detection: add a boot-time smoke test to the verification gates.

### 12.13 Truncated Sub-Agent Return
Symptom: a background sub-agent's inline return is cut off mid-content.
Cause: ~80 KB transcript ceiling on inline returns (Section 11.5).
Prevention: split large work into focused parallel sub-agents BEFORE the ceiling hits; emit the
ledger FIRST; prefer direct disk writes when pre-auth is in place.
Recovery: trust the ledger as the "what was attempted" record; spawn focused recovery sub-agents
for the missing files.

### 12.14 Validator-Fail Loop
Symptom: an agent's post-completion validator keeps returning VALIDATION_FAIL; the agent
re-runs but the same structural defect persists.
Cause: the agent's prompt or skills file is missing the structural rule the validator enforces,
or the agent is interpreting a rule differently than the validator.
Prevention: the validator's error message must name the specific schema rule that failed and
point to a section of the skills file that documents it.
Detection: same `VALIDATION_FAIL:<code>` appearing 2+ times in the audit log for the same agent.
Recovery: surface as a non-blocking HB for human review -- the validator-vs-agent disagreement is
an artefact contract issue.

### 12.15 Dispute Deadlock (Test vs Developer)
Symptom: a defect bounces back and forth between test agent and developer via DSP files; no
resolution after 2 rounds.
Cause: the test agent and developer disagree about a requirement interpretation that needs
business clarification.
Prevention: the test agent's first response to a dispute must include the specific requirement
text it relied on. If that text is ambiguous, escalate to A-01r immediately rather than re-asserting.
Detection: DSP-*.md file with two consecutive rejection rounds.
Recovery: escalate to A-01r via Orchestrator; if A-01r returns NEEDS_RC_UPDATE or HUMAN_BLOCKER,
the originating requirement was ambiguous and needs human clarification.

### 12.16 Model Mis-Tier (Cost Overshoot or Quality Drop)
Symptom: a sprint costs noticeably more than projected (Opus when Sonnet was expected), OR
output quality drops noticeably on a typically-stable task.
Cause: model tier picked at spawn time is mis-set -- either the declared tier in the activation
file is wrong, or the dynamic rule fired when it shouldn't have (or vice versa).
Prevention: every sub-agent spawn writes a `model-selection` audit-log entry with the agent ID,
selected model, and reason. The velocity report surfaces tier distribution.
Detection: velocity report cost-multiplier column shows a tier outlier; audit-log shows an
unexpected `override:` reason firing repeatedly.
Recovery: adjust the declared tier in the activation file (`## Default model tier` section); if
the dynamic rule is mis-firing, review whether the rework-cycle counter in the manifest is correct.

---

## SECTION 13 -- SCALING GUIDANCE

### 13.1 Adding a New Specialist Agent

1. Define the agent's single responsibility -- answer the three questions in Section 2.1.
2. Pick the next sequential `<id>` (or a suffix like `01r` for a sibling split).
3. Pick a `<fullname>` (lowercase, hyphenated, descriptive, 1-3 words).
4. Identify its position in the dependency graph.
5. Create `A-<id>-<fullname>-definition.md` with all six required components.
6. Create `A-<id>-<fullname>-skills.md` with output format, quality standards, and DoD checklist.
7. Create `H-<id>-<fullname>.ps1` covering all standard hook responsibilities.
8. Create `CLAUDE-A-<id>-<fullname>.md` activation file with `## Default model tier` section.
9. Update the Orchestrator manifest: FOLDER REGISTRY, CLARIFICATION ESCALATION CHAIN, TASK REGISTRY.
10. If the new agent consumes requirement cards: add it to the sign-off gate.
11. If the new agent emits routable output: define the JSON summary contract + add to Section 4.4.
12. If the new agent has a schema-validatable output: create a `V-<id>-<topic>.ps1` validator.
13. Update `.claude/kb/cost-optimization-kb.md` Section 11A model-tier table.

### 13.2 Adding Test Agents for New Application Layers

A-09 (microservice) and A-10 (database) IDs are reserved. To activate:

1. Create the agent files following the test-agent pattern (planning + execution phases).
2. Use `tests/<layer>/{test-cases,test-results/{defects,disputes}}/` folder structure.
3. Emit `defect-summary-<layer>.json` per the contract in Section 4.4.
4. Add to sign-off gate as a signing agent.
5. Update T-007 routing-plan logic in `route-defects.ps1` to include the new layer.

### 13.3 Scaling to Larger Teams (Multiple Developers in Parallel)

- Create one dedicated hooks script per developer persona (e.g. `H-04a-frontend-developer-a.ps1`).
- Split the requirement card range -- A-04a handles RC-011..RC-015, A-04b handles RC-016..RC-020.
- Orchestrator activates both in parallel after the sign-off gate opens.
- Each developer agent writes to its own subdirectory within the sprint output folder.
- Code Reviewer receives all output combined.

### 13.4 Adding OpenAPI Spec Generation

- Add API Spec Writer agent between A-02 and A-04/A-05.
- Consumes ED-###.md, produces OpenAPI spec.
- DoD: zero linter errors, all endpoints documented, all schemas defined, error responses defined.
- A-04 generates a typed client from the OpenAPI spec.

### 13.5 Reducing to a Minimal Pipeline

For very small projects: Orchestrator + RA (no resolver split) + Developer + Reviewer (4 agents).
Sign-off gate simplified to one signing agent. No sprint structure. The five universal protocols
still apply.

---

## SECTION 14 -- DECISION REFERENCE

### 14.1 Core Design Decisions (v1.0)

- **D-001 -- Orchestrator is the single source of truth.**
  Centralised state makes debugging trivial. Carve-out: A-SM writes Sprint Registry rows + ACTIVE
  SPRINT block.

- **D-002 -- Single responsibility per agent.**
  Multi-responsibility agents produce inconsistent quality.

- **D-003 -- Agents never contact each other directly.**
  All communication routes through the Orchestrator for audit + logging.

- **D-004 -- Requirement sign-off gate before any design work.**
  Misunderstood requirements caught at design cost 5-10x less than at implementation.

- **D-005 -- Hooks scripts for dependency and path resolution.**
  Move environment resolution out of the agent prompt into a deterministic script.

- **D-006 -- Input hashing to prevent unnecessary re-runs.**
  Idempotency. The pipeline is safe to re-trigger at any point.

- **D-007 -- Sprint-scoped folder structure.**
  Prevents Sprint N+1 from accidentally overwriting Sprint N outputs.

- **D-008 -- START_SPRINT file as explicit sprint trigger.**
  Human control over sprint scope is preserved.

- **D-009 -- Clarification escalation chain per agent.**
  Routing every clarification directly to RA creates a bottleneck.

- **D-010 -- Context briefing at every agent activation.**
  Agent sessions are stateless. Briefings prevent re-raising already-resolved questions.

- **D-011 -- Three-folder workspace separation (app/ / sprints/ / agentic-pipeline/).**
  Different characteristics, different lifecycles, different ownership.

### 14.2 Decisions Added in v1.2 (briefings, carve-outs, concern artefact)

- **D-012 -- Briefings persisted as files.**
  Enables pause/resume across sessions, gives every activation a recoverable record.

- **D-013 -- Sprint Manager may write Sprint Registry + ACTIVE SPRINT.**
  A-SM owns the sprint lifecycle. Narrow, explicit carve-out.

- **D-014 -- Concern (CNC-###) is a distinct artefact from Clarification (CL).**
  CL is "I need an answer"; CNC is "the source material has a gap". They resolve differently.

- **D-015 -- Composite human blockers are permitted.**
  Resolving related decisions in batches avoids gate churn.

- **D-016 -- Non-blocking human blockers are permitted.**
  Some ambiguities deserve human attention without halting work.

- **D-017 -- Documented compliance exceptions are first-class.**
  A visible, documented exception beats a hidden gap.

- **D-018 -- Foreground-write pattern for sub-agents (with direct-disk-write update).**
  Default to foreground-write; use direct-disk-write when pre-auth verified and payload is large.

### 14.3 Decisions Added in v1.3 (rework loop, model tier, truncation)

- **D-019 -- Canonical source-of-truth decision before parallel rework.**
  Activating agent pre-decides canonical side for `shared` findings. Defaults: server for response
  shapes, producer for protocol/middleware, component-owner for UI contracts.

- **D-020 -- Rework agents emit ledger JSON + Excel report.**
  Single canonical record. Ledger emitted FIRST so it survives transcript truncation.

- **D-021 -- Iterative rework (T-007b, T-007c, ...) is permitted.**
  Real rework cycles introduce new findings; the iteration count is visible in IDs.

- **D-022 -- Verification gates (lint + tests) are preconditions to rework completion.**
  A rework agent reporting complete with red gates is producing a false completion.

### 14.4 Decisions Added in v2.0 (12-agent pipeline, validators, model tier, naming)

- **D-023 -- Protocol 5 (Cost Discipline) is mandatory.**
  Foreground mode-switch is default; sub-agent spawn is exception (Case A/B/C). Hash-skip,
  briefings, /compact discipline. Full rules in `.claude/kb/cost-optimization-kb.md`.

- **D-024 -- Mechanical schema checks belong in hook validators, not agent prompts.**
  Validators are deterministic and cost zero LLM tokens. Agents focus on semantic judgement.
  Per-producer (`V-<id>-`) and cross-cutting (`V-shared-`) validators per Section 8.3.

- **D-025 -- Producer JSON routing summaries.**
  Every producer emits a JSON summary alongside Markdown artefacts (`review-summary.json`,
  `defect-summary-<layer>.json`, `dispute-summary.json`, `cross-sprint-refs.json`). Orchestrator
  reads ONLY JSON for routing -- never parses Markdown content.

- **D-026 -- A-03 split into A-03a (Style Compiler) + A-03b (Component Inventory).**
  Independent hashes; styles can re-compile without invalidating components and vice versa.

- **D-027 -- A-01 split into A-01 (producer) + A-01r (resolver).**
  Producer is one of the heaviest agents; resolver has small focused context. Split keeps
  resolver-mode cheap.

- **D-028 -- Test agents are dual-phase (planning + execution) and use a defect dispute mechanism.**
  Test plan (TC-*) runs alongside design; execution (TR + DEF + JSON summary) runs after
  implementation. Disputes (DSP-*) provide a formal channel for dev-vs-test disagreement.

- **D-029 -- T-007 rework is consolidated (code-review + test defects in one pass).**
  Orchestrator reads `review-summary.json` + `defect-summary-*.json` and emits a unified
  `T-007-routing-plan.json`. Avoids two separate rework cycles.

- **D-030 -- Per-agent model tier declaration + one dynamic rework rule.**
  Activation file declares `model: haiku | sonnet | opus`. Sub-agent spawns use the declared
  tier via `scripts/select-model.ps1`. One dynamic override: A-04/A-05 at rework cycle ≥ 2
  → opus. Mode-switch inherits the session model.

- **D-031 -- Pipeline filename naming convention (A-/H-/V-/T- prefixes with fullname).**
  Pipeline infrastructure files use the prefix convention in Section 4.1. Sprint artefacts (RC,
  ED, CI, CR, DEF, etc.) keep their content-type prefixes.

- **D-032 -- NOTIFICATIONS.md is a single-writer file.**
  Orchestrator is the sole writer. Other agents emit signals; Orchestrator appends.

- **D-033 -- Velocity report and routing decisions are generated by deterministic scripts.**
  `build-velocity-report.ps1` and `route-defects.ps1` pull mechanical aggregation out of agent
  responsibility (R3 SRP fix).

- **D-034 -- Test sign-off currency is enforced by hook + Orchestrator, not by the test agent.**
  When A-07/A-08 reports `verdict: PASS`, the Orchestrator invokes the hook with
  `-CommitSignoff` which writes `.signoff-hash` capturing the app-code + test-case state at the
  moment of sign-off. After every A-04/A-05 completion, the Orchestrator re-invokes the test hook
  in re-execution mode. The hook returns NO_CHANGE if hashes match (zero LLM cost) or PROCEED if
  hashes differ (re-test the full TC set). This generalises T-013/T-014 to fire on any drift
  trigger (rework cycle, mid-sprint code edit, scope change), not just T-007 rework. The test
  agent's skills file is unchanged -- deciding *when* to re-test is a coordination concern, not a
  tester-skill concern. See Section 6.6.

- **D-035 -- Dispute authoring contract is producer-side documented (2026-05-15 audit closure).**
  The DSP decision logic, frontmatter schema, `dispute-summary.json` shape, A-07/A-08
  re-judgement handshake, and A-01r escalation on `requirement-mismatch` are documented in the
  producer agents' own skills files (`SKILL -- Defect Dispute Authoring (DSP-FE)` in A-04 skills;
  `SKILL -- Defect Dispute Authoring (DSP-BFF)` in A-05 skills) -- not only in this KB and the
  A-00 definition. Without producer-side documentation, the contract is invisible from where the
  artefact is actually authored. See Section 6.7.

- **D-036 -- Post-completion validators are invoked via a `-PostCheck` switch on each producer hook
  (2026-05-15 audit closure).**
  Seven producer hooks (H-01, H-02, H-03a, H-03b, H-06, H-07, H-08) accept `-PostCheck`. A-00
  invokes the hook with this switch immediately after the agent reports complete and BEFORE
  marking the task `[x]`. The hook runs the declared Tier-1 validators and emits a single
  `VALIDATION_PASS` / `VALIDATION_FAIL` signal. Symmetric with H-04's pre-activation alignment
  pattern. A-04/A-05 are excluded by design -- their artefact is code, not a schema-validated
  document. See Sections 8.3 and 10.6.

- **D-037 -- Manifest log triggers are documented in the A-00 definition (2026-05-15 audit closure).**
  `manifest-writer.ps1` exposes five append helpers; the event -> helper trigger mapping lives in
  A-00 definition's "Manifest log triggers" subsection so the rules sit next to the Orchestrator
  behaviour that invokes them. Without explicit triggers, downstream manifest sections (Test
  Defect Log, Dispute Log, Validation Log, Cross-Sprint Log) stay empty even when the underlying
  events fire and the manifest stops being a live coordination record. See Section 8.6.

### 14.5 Anti-patterns to Avoid

- **Combined agents:** never merge two specialist responsibilities into one agent to save "overhead".
- **Hardcoded paths:** never put filesystem paths in agent prompts or skill files.
- **Guessing:** never accept "I'll assume X" from an agent -- always raise a clarification.
- **Bypassed gates:** never skip the sign-off gate under time pressure.
- **Autonomous sprint starts:** never allow the pipeline to start without a human trigger.
- **Shared manifest writes:** never allow any agent other than A-00 (or A-SM within its carve-out)
  to write to the manifest. NOTIFICATIONS.md has the same single-writer rule.
- **Stale context:** never activate an agent without preparing and persisting a context briefing.
- **Silent gaps:** never ship a card that misses a stated constraint without a documented exception.
- **Sub-agent-only writes:** never rely on a background sub-agent to persist artefacts to disk
  unless write propagation has been explicitly verified.
- **Markdown content parsing for routing:** never parse `review-report.md` or `DEF-*.md` bodies
  in coordination logic -- read the JSON summaries.
- **Mechanical checks in agent prompts:** never burn LLM tokens on schema validation. Validators
  are deterministic.
- **Rule sprawl in select-model.ps1:** never add a second dynamic model-tier rule without an ADR.
  Path A by accretion is real.
- **Side-car patch files left un-merged:** when you write a `*-<topic>.md` patch intended for a
  parent file, merge it the same day or track it in a pending-merges list.

---

## SECTION 15 -- GLOSSARY

**Agent** -- a specialist AI process with a single defined responsibility, its own definition and
skills files, and its own hooks script.

**Audit log** -- an append-only record of every significant pipeline event. Never edited. Lives at
`agentic-pipeline/audit-log.md`. Helper: `scripts/manifest-writer.ps1` `Append-AuditLog`.

**Briefing** -- a context document prepared by the Orchestrator at agent activation time, persisted
to `agentic-pipeline/briefings/T-###-A-<id>-<fullname>-briefing.md` and embedded in the activation
prompt. Contains all relevant prior resolutions, card version updates, and decisions.

**Carve-out** -- a narrow, documented exception to a single-writer rule. Two exist: A-SM writing
Sprint Registry + ACTIVE SPRINT block; helper scripts writing audit log via manifest-writer.ps1.

**Clarification (CL-A##-###)** -- an ambiguity that can be resolved from existing source material
within the pipeline. Routed via the escalation chain, typically to A-01r.

**Composite human blocker** -- a single HB that bundles multiple related decisions. Resolution
lists D1, D2, ..., and cascades a batch of RC version bumps.

**Concern (CNC-A##-###)** -- a gap identified in the source material itself. Logged to the
agent's concerns folder; resolved by A-01r.

**Context briefing** -- see Briefing.

**Cross-sprint refs** -- `cross-sprint-refs.json` emitted by A-01 listing references in the
current sprint's input material to RC IDs from prior sprints.

**Defect (DEF-FE-### / DEF-BFF-###)** -- a test-found bug, emitted by a test agent with frontmatter
including `owner:` (drives T-007 routing) and `severity:`.

**Definition of Done (DoD)** -- a concrete checklist specific to each agent. Every item must pass
before reporting completion. Structural items may be re-checked by a post-completion validator.

**Dispute (DSP-FE-### / DSP-BFF-###)** -- a developer's formal rejection of a test-found defect,
with a verdict (`not-a-defect | test-case-incorrect | requirement-mismatch | valid-defect`).
Re-judged by the originating test agent.

**Documented exception** -- a deliberate, audited acknowledgement that a card cannot meet a stated
constraint in the current sprint. Recorded in the card and in the gate cross-card notes.

**Escalation chain** -- the defined sequence of agents an agent asks when it cannot resolve an
ambiguity. Defined in the agent's definition file.

**Foreground mode-switch** -- the default activation mechanism. The receiving session BECOMES the
agent by reading its definition + skills + briefing. Same session, same model, file-based state.

**Foreground-write pattern** -- a sub-agent strategy where a foreground agent persists artefacts
produced by a background sub-agent, used when sub-agent write permission may not propagate.

**Hash-skip (NO_CHANGE)** -- a hook's signal that input is unchanged since the last run; the
Orchestrator marks the task `[=]` and the agent does not run. Zero LLM cost.

**Hook script** -- `H-<id>-<fullname>.ps1`. Pre-activation script that handles dependency check,
hash compute, partial-output recovery, pre-activation validators, path resolution, and secret
loading. Returns PROCEED / NO_CHANGE / BLOCKED / PARTIAL_RECOVERY / ALIGNMENT_CONFLICT.

**Human blocker (HB-###)** -- an ambiguity that cannot be resolved from existing source material.
May be blocking (task moves to `[!]`) or non-blocking (task continues; HB is for human awareness).

**Input hash** -- an MD5 hash of all input files, stored as a `.input-hash` file alongside the
output. Used to detect whether input has changed between runs.

**JSON routing summary** -- a producer-emitted JSON file containing structured counts and routing
keys, read by the Orchestrator for routing decisions. Examples: `review-summary.json`,
`defect-summary-<layer>.json`, `dispute-summary.json`.

**Manifest** -- the Orchestrator's single source of truth. Contains Folder Registry, Task Registry,
Sign-off Gate, Blocker List, Clarification Log, Sprint Registry, Cross-Sprint Log, Test Defect Log,
Dispute Log, Validation Log, RC Version Log, Audit Log.

**Mid-sprint deferral** -- ejecting a card from the current sprint to a later sprint, typically
discovered during sign-off review. Distinct from cross-sprint modification (which edits a
previously-shipped card).

**Mode-switch** -- see Foreground mode-switch.

**Model tier** -- `haiku | sonnet | opus`. Declared per agent in the activation file's
`## Default model tier` section. Picked at sub-agent spawn time by `scripts/select-model.ps1`.

**NO_CHANGE** -- see Hash-skip.

**Owner tag** -- frontmatter field on CR-*.md / DEF-*.md files (`A-04 | A-05 | shared | other |
test-case-bug`). Drives T-007 routing.

**Protocol 5** -- the cost-discipline protocol. Five rules: foreground default, trust NO_CHANGE,
read briefings, sub-agent budget, /compact proactively. Full rules in
`.claude/kb/cost-optimization-kb.md`.

**Resolver (A-01r)** -- the focused-context split of A-01. Handles one routed CL/CNC at a time,
returns RESOLVED_FROM_SOURCE | NEEDS_RC_UPDATE | HUMAN_BLOCKER.

**Rework cycle** -- a T-007 iteration. First pass is T-007; iterative passes are T-007b, T-007c,
etc. Triggers Opus override on A-04/A-05 at cycle ≥ 2 (Section 11.2).

**Routing plan** -- `T-007-routing-plan.json` emitted by `route-defects.ps1`. Tells the
Orchestrator which developer agents to activate in T-007 and what to put in each briefing.

**Sign-off gate** -- the formal checkpoint between requirements and design phases. Six signing
agents must sign off on all RC cards before design starts.

**Sprint-scoped** -- a path or hash file that includes the sprint ID. Prevents Sprint N+1 from
overwriting Sprint N work.

**Sub-agent spawn** -- the non-default activation mechanism. Permitted only for Case A (true
parallelism), Case B (heavy context isolation), or Case C (truncation-risk payload). Costs
3-5x baseline.

**Test agent** -- a dual-phase agent (planning + execution). One per application layer (FE, BFF,
microservice, DB). Plans tests at T-009/T-010, executes at T-011/T-012, re-executes at
T-013/T-014.

**Validator (V-<scope>-<topic>.ps1)** -- a deterministic PowerShell script that checks a structural
contract on agent output. Per-producer validators check one agent's schema; cross-cutting
validators (`V-shared-`) check joint contracts. Costs zero LLM tokens.
