# H-01-requirement-analyst.ps1 -- Requirement Analyst
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-001",
    [string]$WorkspaceRoot = "",
    [switch]$PostCheck
)

if (-not $WorkspaceRoot) { $WorkspaceRoot = $env:POC_WORKSPACE_ROOT }
if (-not $WorkspaceRoot) { $WorkspaceRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }

$AgentId      = "A-01"
$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$InputFolder  = Join-Path $SprintsPath "$SprintId\req-inputs"
$OutputFolder = Join-Path $SprintsPath "$SprintId\req-outputs"
$HashFile     = Join-Path $OutputFolder ".input-hash"
$BackupFolder = Join-Path $OutputFolder ".backup"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-01's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-01-rc-schema.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    $exit1 = $LASTEXITCODE
    if ($exit1 -eq 0) { Write-Output "VALIDATION_PASS"; exit 0 }
    Write-Output "VALIDATION_FAIL"; exit 1
}

# 1. Verify req-inputs folder exists and has at least one file (excluding START_SPRINT)
if (-not (Test-Path $InputFolder)) {
    Write-Host "[$AgentId] BLOCKED: req-inputs folder not found: $InputFolder"
    Write-Output "BLOCKED:MISSING_INPUTS_FOLDER"
    exit 1
}

$inputFiles = Get-ChildItem -Path $InputFolder -File -ErrorAction SilentlyContinue |
              Where-Object { $_.Name -ne "START_SPRINT" -and $_.Name -ne "requirements.md" }

# Accept requirements.md too if human provided it
$reqMd = Join-Path $InputFolder "requirements.md"
$hasReqMd = Test-Path $reqMd

if (-not $inputFiles -and -not $hasReqMd) {
    Write-Host "[$AgentId] BLOCKED: No input files found in $InputFolder"
    Write-Host "[$AgentId] Drop any files (images, docs, Excel, text) into the req-inputs folder"
    Write-Output "BLOCKED:NO_INPUT_FILES"
    exit 1
}

Write-Host "[$AgentId] Input files found:"
if ($hasReqMd) { Write-Host "  requirements.md (human-provided)" -ForegroundColor Gray }
foreach ($f in $inputFiles) { Write-Host "  $($f.Name)" -ForegroundColor Gray }

# 2. Detect partial output
$partial = Get-ChildItem -Path $OutputFolder -Filter "RC-*.md" -ErrorAction SilentlyContinue
if ($partial -and -not (Test-Path $HashFile)) {
    Write-Host "[$AgentId] Partial output found -- cleaning"
    if (-not (Test-Path $BackupFolder)) {
        New-Item -ItemType Directory -Path $BackupFolder -Force | Out-Null
    }
    $partial | Copy-Item -Destination $BackupFolder -Force
    $partial | Remove-Item -Force
}

# 3. Compute hash of ALL input files (everything in inputs/ except START_SPRINT)
$allInputs = Get-ChildItem -Path $InputFolder -File -ErrorAction SilentlyContinue |
             Where-Object { $_.Name -ne "START_SPRINT" } |
             Sort-Object Name
$parts    = foreach ($f in $allInputs) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
$combined = [string]::Join("|", $parts)

# 4. Compare hash
if (Test-Path $HashFile) {
    $stored = Get-Content -Path $HashFile -Raw
    if ($combined.Trim() -eq $stored.Trim()) {
        Write-Host "[$AgentId] Inputs unchanged -- NO_CHANGE"
        Write-Output "NO_CHANGE"
        exit 0
    }
}

# 5. Create output directory if needed
if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
}

Write-Host "[$AgentId] PROCEED"
Write-Output "PROCEED"
Write-Output "INPUT_FOLDER:$InputFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
