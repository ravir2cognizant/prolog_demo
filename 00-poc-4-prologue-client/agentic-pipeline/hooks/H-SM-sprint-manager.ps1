# H-SM-sprint-manager.ps1 -- Sprint Manager Hooks
# Validates a new sprint is ready to start.
# requirements.md is NOT required -- A-01 (RA) will create it automatically.
# Accepted inputs: ANY file type -- images, documents, Excel, CSV, YAML,
#                  Markdown, text, Agile exports, PDFs, or requirements.md itself.
# Only requirement: at least one file (other than START_SPRINT) must exist.

param(
    [string]$SprintId      = "sprint-01",
    [string]$WorkspaceRoot = "",
    [string]$ManifestPath  = ""
)

if (-not $WorkspaceRoot) { $WorkspaceRoot = $env:POC_WORKSPACE_ROOT }
if (-not $WorkspaceRoot) {
    # Try workspace-config.json then workspace-config.sample.json before falling back
    # to directory walk. This allows standalone hook invocations (e.g. CI) to resolve
    # the correct root without requiring POC_WORKSPACE_ROOT to be set.
    $cfgPath    = Join-Path $PSScriptRoot "..\..\agentic-pipeline\workspace-config.json"
    $samplePath = Join-Path $PSScriptRoot "..\..\agentic-pipeline\workspace-config.sample.json"
    foreach ($p in @($cfgPath, $samplePath)) {
        $resolved = Resolve-Path $p -ErrorAction SilentlyContinue
        if ($resolved) {
            try {
                $cfg = Get-Content $resolved.Path -Raw | ConvertFrom-Json
                if ($cfg.workspaceRoot -and $cfg.workspaceRoot -notmatch 'path[\\/]to[\\/]your') {
                    $WorkspaceRoot = $cfg.workspaceRoot
                    break
                }
            } catch {}
        }
    }
}
if (-not $WorkspaceRoot) {
    $WorkspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
}

$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$manifest     = if ($ManifestPath) { $ManifestPath } else { Join-Path $PipelinePath "orchestrator-manifest.md" }
$inputsFolder = Join-Path $SprintsPath "$SprintId\req-inputs"
$startFile    = Join-Path $inputsFolder "START_SPRINT"

Write-Host "[A-SM] Sprint Manager hooks -- SprintId: $SprintId"
Write-Host "[A-SM] Workspace: $WorkspaceRoot"

# 1. Verify START_SPRINT signal exists
if (-not (Test-Path $startFile)) {
    Write-Host "[A-SM] ERROR: START_SPRINT not found at $startFile"
    Write-Host "[A-SM] Sprint Manager (A-SM) should have created this -- check activation sequence."
    Write-Output "ERROR:MISSING_START_SPRINT"
    exit 1
}

# 2. Verify req-inputs folder exists
if (-not (Test-Path $inputsFolder)) {
    Write-Host "[A-SM] ERROR: req-inputs folder not found: $inputsFolder"
    Write-Output "ERROR:MISSING_INPUTS_FOLDER"
    exit 1
}

# 2b. Ensure ui-style-outputs folder exists. A-03 (UICD) writes the compiled
#     UI style system here (CSS, design tokens, MD style spec). A-04 (FE) reads
#     from it during frontend code generation. Created empty at sprint init.
$uiStyleOutputsFolder = Join-Path $SprintsPath "$SprintId\ui-style-outputs"
if (-not (Test-Path $uiStyleOutputsFolder)) {
    New-Item -ItemType Directory -Path $uiStyleOutputsFolder -Force | Out-Null
    $usoReadmePath = Join-Path $uiStyleOutputsFolder "README.md"
    $usoReadme = @"
# UI Style Outputs -- $SprintId

A-03 (UI Component Designer) writes the COMPILED UI style system here during
T-003. A-04 (Frontend Developer) reads from here during T-004 to scaffold
app\frontend\ styling (Tailwind config, CSS variables, design tokens, etc.).

## Expected contents (written by A-03)
- ``tokens.json`` (or ``.css``) -- design tokens: colour scales, spacing, typography,
  shadows, radii, breakpoints, motion durations / easings.
- ``style-system.md`` -- prose description of style-system rules: how tokens
  compose, when to use which scale, brand-voice constraints, motion / a11y rules.
- ``tailwind.theme.json`` (or partial config) -- proposed Tailwind theme additions
  / overrides for A-04 to merge into app\frontend\tailwind.config.
- ``components.css`` (optional) -- shared utility classes / base styles that are
  not component-specific (e.g. focus-ring helpers, container queries).

## Read-only contract for A-04
A-04 READS from here; it does not write. Frontend code generation consumes
the tokens / theme / utility files and the style-system.md rules.

## Design data, not implementation code
This folder holds design data only: tokens, theme config, utility CSS, prose
style rules. No JSX, no React components, no business logic. Component
implementation lives in app\frontend\ and is owned by A-04.

## Source -- inputs that feed this output
A-03 produces ui-style-outputs by reading:
- sprints\$SprintId\ui-style-inputs\ (human-populated; brand guidelines, wireframes,
  CSS/SCSS/JSON tokens, etc.)
- sprints\$SprintId\req-outputs\ (component-level usage signals)
- sprints\$SprintId\req-inputs\ (source mockups)
"@
    Set-Content -Path $usoReadmePath -Value $usoReadme -Encoding ascii
    Write-Host "[A-SM] Created ui-style-outputs folder at $uiStyleOutputsFolder (with README)"
} else {
    Write-Host "[A-SM] ui-style-outputs folder already present at $uiStyleOutputsFolder"
}

# 2a. Ensure ui-style-inputs folder exists for UICD (A-03) and FE (A-04) to read.
#     Human drops brand guidelines, wireframes, screen prints, design tokens,
#     CSS, component specs, accessibility guidelines, animation specs, etc.
#     Empty is acceptable. A-03 / A-04 read; they do not write.
$uiStyleInputsFolder = Join-Path $SprintsPath "$SprintId\ui-style-inputs"
if (-not (Test-Path $uiStyleInputsFolder)) {
    New-Item -ItemType Directory -Path $uiStyleInputsFolder -Force | Out-Null
    $readmePath = Join-Path $uiStyleInputsFolder "README.md"
    $readme = @"
# UI Style Inputs -- $SprintId

Drop UI design source material here for A-03 (UI Component Designer)
and A-04 (Frontend Developer) to reference during T-003 and T-004.

## Accepted material (any format)
- Brand guidelines: PDF, DOCX, MD
- Wireframes / screen prints / mockups: PNG, JPG, WEBP, SVG, FIG (Figma exports)
- Design tokens: JSON, CSS, SCSS
- Component specs: MD, DOCX, PDF
- Accessibility guidelines: MD, PDF
- Animation specs: MD, MP4, GIF
- Anything else relevant to UI design / implementation

## Read-only contract
Human-populated. A-03 and A-04 READ from here; they do not write.
If a design gap exists (no source for a required component), A-03 raises
a CNC-### concern under sprints\$SprintId\concerns\uicd\.

## Empty is OK
An empty ui-style-inputs folder is acceptable -- A-03 will infer from RC cards
and source mockups in sprints\$SprintId\req-inputs\. But the more material lives
here, the more accurately components and implementation will match intent.
"@
    Set-Content -Path $readmePath -Value $readme -Encoding ascii
    Write-Host "[A-SM] Created ui-style-inputs folder at $uiStyleInputsFolder (with README)"
} else {
    Write-Host "[A-SM] ui-style-inputs folder already present at $uiStyleInputsFolder"
}

# 2c. Ensure review-inputs folder exists. Reviewers (human / Code Reviewer agent)
#     drop review comments here for A-04 + A-05 to act on during T-007 Rework.
#     Two sub-folders: code-review/ and arch-review/. Empty is acceptable.
$reviewInputsFolder = Join-Path $SprintsPath "$SprintId\review-inputs"
if (-not (Test-Path $reviewInputsFolder)) {
    New-Item -ItemType Directory -Path $reviewInputsFolder -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $reviewInputsFolder "code-review") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $reviewInputsFolder "arch-review") -Force | Out-Null
    $riReadme = @"
# Review Inputs -- $SprintId

Drop review comments here for A-04 (Frontend) and A-05 (Backend) to
process during a T-007 Rework cycle.

## Folder layout
- ``code-review\``  -- code-review comments (line-level nits to cross-cutting
  refactors). Authored by humans or by A-06 (Code Reviewer).
- ``arch-review\``  -- architecture-review comments (layering, contracts,
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
The ``owner`` field tells A-04 and A-05 which comments belong to whom:
  - ``owner: A-04``   -> Frontend Developer only (app/frontend/...).
  - ``owner: A-05``   -> Backend Developer only (app/backend/...).
  - ``owner: shared``   -> Both agents log it; each implements its layer's
                          part and cross-references the other in the ledger.
  - ``owner: A-06``   -> Code Reviewer item; not a code-agent deliverable.

If ``owner`` is omitted, agents fall back to inferring from the ``location``
path prefix (``app/frontend/...`` -> A-04, ``app/backend/...`` -> A-05,
anything else -> not-applicable for both, follow-up flag set). When in
doubt, set ``owner:`` explicitly.

## Read-only contract
A-04 and A-05 READ from here; they do not write. They write their
implementation report + ledger to sprints\$SprintId\review-outputs\.

## Empty is OK
An empty review-inputs folder is acceptable -- no review cycle pending.
"@
    Set-Content -Path (Join-Path $reviewInputsFolder "README.md") -Value $riReadme -Encoding ascii
    Write-Host "[A-SM] Created review-inputs folder at $reviewInputsFolder (with code-review/ + arch-review/ + README)"
} else {
    Write-Host "[A-SM] review-inputs folder already present at $reviewInputsFolder"
}

# 2d. Ensure review-outputs folder exists. A-04 / A-05 write their rework
#     ledger JSON + Excel report here at the end of a T-007 Rework cycle.
$reviewOutputsFolder = Join-Path $SprintsPath "$SprintId\review-outputs"
if (-not (Test-Path $reviewOutputsFolder)) {
    New-Item -ItemType Directory -Path $reviewOutputsFolder -Force | Out-Null
    $roReadme = @"
# Review Outputs -- $SprintId

A-04 and A-05 write their rework deliverables here at the end of a
T-007 Rework cycle (after consuming comments from
sprints\$SprintId\review-inputs\).

## Expected contents per agent (after a rework run)
- A-04-ledger.json         -- machine-readable status ledger.
- A-04-rework-report.xlsx  -- human-readable Excel report from the ledger.
- A-05-ledger.json         -- backend-side ledger.
- A-05-rework-report.xlsx  -- backend-side Excel report.

## How the xlsx is produced
The agent emits the ledger JSON. Generate the xlsx via:
  cd agentic-pipeline\scripts
  npm install                                  # first-time only
  npm run review-report -- --sprint $SprintId --agent A-04
  npm run review-report -- --sprint $SprintId --agent A-05

The script reads the *-ledger.json and emits the matching *-rework-report.xlsx
in this folder.

## Read-only contract for downstream
Canonical record of what was implemented from a review cycle and what was
not (with reasons). A-06 (Code Reviewer) and humans READ; they do not write.
"@
    Set-Content -Path (Join-Path $reviewOutputsFolder "README.md") -Value $roReadme -Encoding ascii
    Write-Host "[A-SM] Created review-outputs folder at $reviewOutputsFolder (with README)"
} else {
    Write-Host "[A-SM] review-outputs folder already present at $reviewOutputsFolder"
}

# 2e. Ensure tests/ folder tree exists. Test agents (A-07 FE, A-08 BFF) write
#     test-cases (T-009/T-010) and test-results + defects + disputes (T-011/T-012).
#     Microservice (A-09) and DB (A-10) layers reserved for future agents.
$testsFolder = Join-Path $SprintsPath "$SprintId\tests"
if (-not (Test-Path $testsFolder)) {
    foreach ($layer in @("fe","bff","microservice","db")) {
        New-Item -ItemType Directory -Path (Join-Path $testsFolder "$layer\test-cases")             -Force | Out-Null
        New-Item -ItemType Directory -Path (Join-Path $testsFolder "$layer\test-results\defects")   -Force | Out-Null
        New-Item -ItemType Directory -Path (Join-Path $testsFolder "$layer\test-results\disputes")  -Force | Out-Null
    }
    $testsReadme = @"
# Tests -- $SprintId

Test agents write to this tree:
- ``fe\``           -- A-07 (FE Test Agent)  -- Vitest + Playwright + MSW
- ``bff\``          -- A-08 (BFF Test Agent) -- Vitest + supertest + Pact
- ``microservice\`` -- reserved for A-09 (microservice test agent, future)
- ``db\``           -- reserved for A-10 (DB test agent, future)

## Per-layer folder layout
- ``<layer>\test-cases\``                  -- TC-*.md test-case specs
- ``<layer>\test-results\``                -- TR-*.md per-case results + TR-summary.html
- ``<layer>\test-results\defects\``        -- DEF-*.md defect files (routed by ``owner:`` tag)
- ``<layer>\test-results\disputes\``       -- DSP-*.md dispute files written by dev agents

## JSON routing contracts (emitted with the Markdown)
- ``fe\test-results\defect-summary-fe.json``   -- routing summary for A-00
- ``bff\test-results\defect-summary-bff.json`` -- routing summary for A-00
- Dev agents emit ``dispute-summary.json`` in their layer folder when raising DSPs

## Read-only contract
Test agents write here. Dev agents (A-04, A-05) READ defects, WRITE disputes only.
Orchestrator reads JSON summaries only (not Markdown content) for routing.
"@
    Set-Content -Path (Join-Path $testsFolder "README.md") -Value $testsReadme -Encoding ascii
    Write-Host "[A-SM] Created tests/ folder tree at $testsFolder (fe/bff/microservice/db)"
} else {
    Write-Host "[A-SM] tests/ folder already present at $testsFolder"
}

# 2f. Ensure scripts/validators/ folder exists. Tier-1 validators are invoked by
#     hooks pre-activation and post-completion.
$validatorsFolder = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
if (-not (Test-Path $validatorsFolder)) {
    Write-Host "[A-SM] WARN: scripts/validators/ folder missing at $validatorsFolder"
    Write-Host "[A-SM]       Tier-1 schema validation will be skipped by hooks until this is restored."
}

# 3. Find all input files -- accept ANYTHING except START_SPRINT itself
$allFiles = Get-ChildItem -Path $inputsFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -ne "START_SPRINT" }

if (-not $allFiles -or $allFiles.Count -eq 0) {
    Write-Host "[A-SM] ERROR: No input files found in $inputsFolder"
    Write-Host "[A-SM] Drop at least one file of any type and try again."
    Write-Host "[A-SM] Accepted: .png .jpg .jpeg .webp .pdf .docx .doc .txt .md"
    Write-Host "[A-SM]           .xlsx .xls .csv .yaml .yml .json or any other format"
    Write-Output "ERROR:NO_INPUT_FILES"
    exit 1
}

# 4. Categorise what was found (informational only -- all are accepted)
$reqMd   = $allFiles | Where-Object { $_.Name -eq "requirements.md" }
$images  = $allFiles | Where-Object { $_.Extension -match "^\.(png|jpg|jpeg|webp|gif|bmp|tiff|svg)$" }
$docs    = $allFiles | Where-Object { $_.Extension -match "^\.(pdf|docx|doc|odt)$" }
$text    = $allFiles | Where-Object { $_.Extension -match "^\.(txt|md|markdown)$" -and $_.Name -ne "requirements.md" }
$data    = $allFiles | Where-Object { $_.Extension -match "^\.(xlsx|xls|csv|tsv)$" }
$config  = $allFiles | Where-Object { $_.Extension -match "^\.(yaml|yml|json|xml)$" }
$others  = $allFiles | Where-Object {
    $_.Extension -notmatch "^\.(png|jpg|jpeg|webp|gif|bmp|tiff|svg|pdf|docx|doc|odt|txt|md|markdown|xlsx|xls|csv|tsv|yaml|yml|json|xml)$" `
    -and $_.Name -ne "requirements.md"
}

Write-Host "[A-SM] Input files found: $($allFiles.Count) file(s)"
if ($reqMd)   { Write-Host "  requirements.md  -- human-provided, RA will use directly" }
if ($images)  { Write-Host "  Images  ($($images.Count)):   $($images.Name -join ', ')" }
if ($docs)    { Write-Host "  Docs    ($($docs.Count)):   $($docs.Name -join ', ')" }
if ($text)    { Write-Host "  Text/MD ($($text.Count)):   $($text.Name -join ', ')" }
if ($data)    { Write-Host "  Data    ($($data.Count)):   $($data.Name -join ', ')" }
if ($config)  { Write-Host "  Config  ($($config.Count)):   $($config.Name -join ', ')" }
if ($others)  { Write-Host "  Other   ($($others.Count)):   $($others.Name -join ', ')" }

# 5. Determine input mode
if ($reqMd -and $allFiles.Count -eq 1) {
    $inputMode = "requirements.md only -- RA will produce RC cards directly"
} elseif ($reqMd) {
    $inputMode = "requirements.md + $($allFiles.Count - 1) other file(s) -- RA will consolidate all"
} else {
    $inputMode = "$($allFiles.Count) raw file(s) -- RA will consolidate into requirements.md first"
}

# 6. Check manifest for duplicate active sprint
if (Test-Path $manifest) {
    $mc = Get-Content -Path $manifest -Raw -ErrorAction SilentlyContinue
    if ($mc -match ($SprintId + ".*Active")) {
        Write-Host "[A-SM] WARNING: Sprint $SprintId appears already active in manifest."
        Write-Output "SPRINT_ALREADY_ACTIVE"
        exit 0
    }
}

# 7. All good -- return PROCEED
Write-Host "[A-SM] Validation passed."
Write-Host "[A-SM] Input mode: $inputMode"
Write-Host "[A-SM] Next: register sprint in manifest and activate A-01."
Write-Output "PROCEED:${SprintId}:$($allFiles.Count)"