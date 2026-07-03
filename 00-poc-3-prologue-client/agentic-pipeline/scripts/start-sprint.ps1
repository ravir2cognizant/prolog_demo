# start-sprint.ps1
# Creates sprint subfolder structure and START_SPRINT signal file
# Usage: .\start-sprint.ps1 -SprintId sprint-01 -Name "Sprint 1" -Description "Login feature"

param(
    [Parameter(Mandatory=$true)]  [string]$SprintId,
    [Parameter(Mandatory=$true)]  [string]$Name,
    [string]$Description   = "",
    [string]$WorkspaceRoot = ""
)

if (-not $WorkspaceRoot) { $WorkspaceRoot = $env:POC_WORKSPACE_ROOT }
if (-not $WorkspaceRoot) { $WorkspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }

$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$sprintFolder = Join-Path $SprintsPath $SprintId
$inputsFolder = Join-Path $sprintFolder "inputs"
$startFile    = Join-Path $inputsFolder "START_SPRINT"
$manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host ""
Write-Host "Starting Sprint: $SprintId -- $Name" -ForegroundColor Cyan
Write-Host ""

# 1. Validate workspace
if (-not (Test-Path $WorkspaceRoot)) {
    Write-Host "ERROR: Workspace not found: $WorkspaceRoot" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $PipelinePath)) {
    Write-Host "ERROR: agentic-pipeline/ folder not found. Run workspace-setup.ps1 first." -ForegroundColor Red
    exit 1
}

# 2. sprints/ is created lazily on first sprint (matches the lazy-creation rule
# in agentic-delivery-core-kb Section 3.1; workspace-setup.ps1 does NOT
# pre-create sprints/).
if (-not (Test-Path $SprintsPath)) {
    New-Item -ItemType Directory -Path $SprintsPath -Force | Out-Null
    Write-Host "  [CREATED] sprints/ (first sprint in this workspace)" -ForegroundColor Green
}

# 3. Check for duplicate
if (Test-Path $startFile) {
    Write-Host "WARNING: Sprint $SprintId already has a START_SPRINT file." -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") { Write-Host "Cancelled."; exit 0 }
}

if (Test-Path $manifest) {
    $mc = Get-Content -Path $manifest -Raw -ErrorAction SilentlyContinue
    if ($mc -match ($SprintId + ".*Active")) {
        Write-Host "WARNING: Sprint $SprintId appears active in manifest." -ForegroundColor Yellow
    }
}

# 4. Create sprint subfolder structure
$sprintFolders = @(
    "inputs",
    "req-outputs",
    "endpoint-design",
    "component-inventory",
    "review",
    "concerns\uicd",
    "concerns\resolutions"
)

foreach ($f in $sprintFolders) {
    $p = Join-Path $sprintFolder $f
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "  [CREATED] sprints\$SprintId\$f" -ForegroundColor Green
    } else {
        Write-Host "  [EXISTS]  sprints\$SprintId\$f" -ForegroundColor Yellow
    }
}

# 5. Create START_SPRINT signal file
$startDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$startContent = "SPRINT_ID=$SprintId`r`nSPRINT_NAME=$Name`r`nDESCRIPTION=$Description`r`nSTARTED=$startDate`r`nTRIGGERED_BY=start-sprint.ps1"
$startContent | Set-Content -Path $startFile -Encoding UTF8

Write-Host ""
Write-Host "  [CREATED] START_SPRINT signal file" -ForegroundColor Green

# 6. Summary
Write-Host ""
Write-Host "Sprint $SprintId ($Name) ready." -ForegroundColor Cyan
Write-Host ""
Write-Host "Sprint req-inputs folder: $inputsFolder" -ForegroundColor Gray
Write-Host ""
Write-Host "NEXT: Drop your input files into the req-inputs folder:" -ForegroundColor Yellow
Write-Host "  Supported: images (.png .jpg), documents (.pdf .docx), Excel (.xlsx)," -ForegroundColor Gray
Write-Host "             text (.txt .md), CSV (.csv), YAML (.yaml), Agile format files" -ForegroundColor Gray
Write-Host ""
Write-Host "Then open Claude Code and say:" -ForegroundColor Yellow
Write-Host "  Read agentic-pipeline\agents\CLAUDE-A-SM-sprint-manager.md and follow the instructions" -ForegroundColor White
Write-Host ""
