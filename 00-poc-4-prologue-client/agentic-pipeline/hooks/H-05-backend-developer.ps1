# H-05-backend-developer.ps1 -- Backend Developer
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-005",
    [string]$WorkspaceRoot = ".",
    [switch]$PostCheck
)

$AgentId      = "A-05"
$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$AppPath      = Join-Path $WorkspaceRoot "app"
$EDFolder     = Join-Path $SprintsPath "$SprintId\endpoint-design"
$RCFolder     = Join-Path $SprintsPath "$SprintId\req-outputs"
$OutputFolder = Join-Path $AppPath "backend"
$HashFile     = Join-Path $OutputFolder ".input-hash-$SprintId"
$Manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-05's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-ed-route-coverage.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    if ($LASTEXITCODE -eq 0) { Write-Output "VALIDATION_PASS"; exit 0 }
    Write-Output "VALIDATION_FAIL"; exit 1
}

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue
foreach ($dep in @("T-GATE.*\[x\]", "T-002.*\[x\]")) {
    if ($mc -notmatch $dep) { Write-Output "BLOCKED:DEPENDENCY_NOT_COMPLETE"; exit 1 }
}

$edFiles = Get-ChildItem -Path $EDFolder -Filter "ED-*.md" -ErrorAction SilentlyContinue
$rcFiles = Get-ChildItem -Path $RCFolder -Filter "RC-*.md" -ErrorAction SilentlyContinue
if (-not $edFiles -or -not $rcFiles) { Write-Output "BLOCKED:MISSING_INPUT_FILES"; exit 1 }

$allFiles = @($edFiles) + @($rcFiles) | Sort-Object Name
$parts    = foreach ($f in $allFiles) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
$combined = [string]::Join("|", $parts)

if (Test-Path $HashFile) {
    $stored = Get-Content -Path $HashFile -Raw
    if ($combined.Trim() -eq $stored.Trim()) { Write-Output "NO_CHANGE"; exit 0 }
}

if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
}

Write-Host "[$AgentId] PROCEED"
Write-Output "PROCEED"
Write-Output "ED_PATH:$EDFolder"
Write-Output "RC_PATH:$RCFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
