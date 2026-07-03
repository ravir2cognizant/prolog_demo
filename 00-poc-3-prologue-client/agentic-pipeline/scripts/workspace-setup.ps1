# workspace-setup.ps1
# First-time workspace bootstrap.
#
# Three-folder workspace (per agentic-delivery-core-kb Section 3.1):
#   app/              -- application code, created LAZILY by developer hooks
#                        (H-04 creates app/frontend/, H-05 creates app/backend/
#                        on first activation). NOT created here.
#   sprints/          -- sprint artefacts, created LAZILY by start-sprint.ps1
#                        on the first sprint. NOT created here.
#   agentic-pipeline/ -- pipeline infrastructure. Created here.
#
# Why lazy creation: a brand-new workspace should show only the infrastructure
# folder. app/ and sprints/ appear as a side-effect of activating the pipeline.
# This makes the "empty workspace" state visually unambiguous and prevents
# accidental commits of empty placeholder dirs.
#
# Usage: .\workspace-setup.ps1 [-Root "C:\Projects\poc-workspace"]

param([string]$Root = ".\poc-workspace")

Write-Host ""
Write-Host "Creating POC Workspace at: $Root" -ForegroundColor Cyan
Write-Host ""

# Ensure the workspace root itself exists
if (-not (Test-Path $Root)) {
    New-Item -ItemType Directory -Path $Root -Force | Out-Null
    Write-Host "  [CREATED]  $Root" -ForegroundColor Green
}

# agentic-pipeline/ subfolders -- the only top-level folder created at bootstrap
foreach ($f in @(
    "agentic-pipeline\agents",
    "agentic-pipeline\hooks",
    "agentic-pipeline\scripts",
    "agentic-pipeline\scripts\validators",
    "agentic-pipeline\briefings",
    "agentic-pipeline\.claude\agents"
)) {
    $p = Join-Path $Root $f
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "  [CREATED]  $f" -ForegroundColor Green
    } else {
        Write-Host "  [EXISTS]   $f" -ForegroundColor Yellow
    }
}

# orchestrator-manifest.md
$mp = Join-Path $Root "agentic-pipeline\orchestrator-manifest.md"
if (-not (Test-Path $mp)) {
    $tp = Join-Path $PSScriptRoot "orchestrator-manifest.md"
    if (Test-Path $tp) {
        Copy-Item $tp $mp
        Write-Host "  [CREATED]  agentic-pipeline\orchestrator-manifest.md (from template)" -ForegroundColor Green
    } else {
        "# Orchestrator Manifest`n# Copy template from poc-artefacts`n" | Set-Content $mp -Encoding UTF8
        Write-Host "  [CREATED]  agentic-pipeline\orchestrator-manifest.md (placeholder)" -ForegroundColor Green
    }
} else {
    Write-Host "  [EXISTS]   agentic-pipeline\orchestrator-manifest.md" -ForegroundColor Yellow
}

# audit-log.md
$al = Join-Path $Root "agentic-pipeline\audit-log.md"
if (-not (Test-Path $al)) {
    "# Audit Log`n# Append-only`n| Timestamp | Agent | Event Type | Detail |`n|-----------|-------|------------|--------|`n| $(Get-Date -Format 'yyyy-MM-dd HH:mm') | A-00 | Workspace initialised | workspace-setup.ps1 |" |
        Set-Content $al -Encoding UTF8
    Write-Host "  [CREATED]  agentic-pipeline\audit-log.md" -ForegroundColor Green
}

# NOTIFICATIONS.md
$nf = Join-Path $Root "agentic-pipeline\NOTIFICATIONS.md"
if (-not (Test-Path $nf)) {
    "# NOTIFICATIONS`n" | Set-Content $nf -Encoding UTF8
    Write-Host "  [CREATED]  agentic-pipeline\NOTIFICATIONS.md" -ForegroundColor Green
}

# agentic-pipeline/agents/CLAUDE.md guide
$cg = Join-Path $Root "agentic-pipeline\agents\CLAUDE.md"
if (-not (Test-Path $cg)) {
    @"
# agentic-pipeline/agents/ -- CLAUDE.md files
# One file per agent: CLAUDE-A-00-orchestrator.md | CLAUDE-A-SM-sprint-manager.md | CLAUDE-A-01-requirement-analyst.md ... CLAUDE-A-08-bff-tester.md
#
# Path variables all agents use:
#   ROOT     = poc-workspace/
#   PIPELINE = poc-workspace/agentic-pipeline/
#   SPRINTS  = poc-workspace/sprints/   (created on first sprint by start-sprint.ps1)
#   APP      = poc-workspace/app/       (created on first developer activation by H-04/H-05)
"@ | Set-Content $cg -Encoding UTF8
    Write-Host "  [CREATED]  agentic-pipeline\agents\CLAUDE.md" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "Workspace ready (infrastructure only)." -ForegroundColor Cyan
Write-Host ""
Write-Host "poc-workspace/" -ForegroundColor White
Write-Host "  agentic-pipeline/agents/          Place CLAUDE-A-##-{fullname}.md files here" -ForegroundColor Gray
Write-Host "  agentic-pipeline/hooks/           Place H-##-{fullname}.ps1 files here" -ForegroundColor Gray
Write-Host "  agentic-pipeline/scripts/         Helper scripts (manifest-writer, route-defects, etc.)" -ForegroundColor Gray
Write-Host "  agentic-pipeline/.claude/agents/  A-##-{fullname}-definition.md + A-##-{fullname}-skills.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Folders created lazily on first activation:" -ForegroundColor White
Write-Host "  sprints/                          (on first .\start-sprint.ps1 run)" -ForegroundColor Gray
Write-Host "  app/frontend/                     (on first A-04 frontend-developer activation)" -ForegroundColor Gray
Write-Host "  app/backend/                      (on first A-05 backend-developer activation)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next: run .\setup-secrets.ps1 then .\start-sprint.ps1 -SprintId sprint-01 -Name 'Sprint 1'" -ForegroundColor Yellow
Write-Host ""
