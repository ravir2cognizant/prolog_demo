# H-03b-ui-component-inventory.ps1 -- UI Component Inventory
# Hash scope: RC-*.md + ui-style-outputs/*
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-003b",
    [string]$WorkspaceRoot = ".",
    [switch]$PostCheck
)

$AgentId         = "A-03b"
$SprintsPath     = Join-Path $WorkspaceRoot "sprints"
$PipelinePath    = Join-Path $WorkspaceRoot "agentic-pipeline"
$RCFolder        = Join-Path $SprintsPath "$SprintId\req-outputs"
$StyleOutFolder  = Join-Path $SprintsPath "$SprintId\ui-style-outputs"
$OutputFolder    = Join-Path $SprintsPath "$SprintId\component-inventory"
$ConcernsDir     = Join-Path $SprintsPath "$SprintId\concerns\uicd"
$HashFile        = Join-Path $OutputFolder ".input-hash"
$Manifest        = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-03b's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-03b-ci-schema.ps1"
    $v2 = Join-Path $ValidatorsRoot "V-shared-rc-ci-coverage.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    $exit1 = $LASTEXITCODE
    & $v2 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    $exit2 = $LASTEXITCODE
    if ($exit1 -eq 0 -and $exit2 -eq 0) { Write-Output "VALIDATION_PASS"; exit 0 }
    Write-Output "VALIDATION_FAIL"; exit 1
}

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue
if ($mc -notmatch "T-GATE.*\[x\]") { Write-Output "BLOCKED:GATE_NOT_OPEN"; exit 1 }

# A-03a must have completed (either [x] or [=])
if ($mc -notmatch "T-003a.*\[(x|=)\]") { Write-Output "BLOCKED:T-003a_NOT_COMPLETE"; exit 1 }

$rcFiles    = Get-ChildItem -Path $RCFolder       -Filter "RC-*.md" -ErrorAction SilentlyContinue
$styleFiles = Get-ChildItem -Path $StyleOutFolder -File             -ErrorAction SilentlyContinue |
              Where-Object { $_.Name -ne "README.md" -and $_.Name -notlike ".*" }

if (-not $rcFiles)    { Write-Output "BLOCKED:MISSING_RC_FILES"; exit 1 }
if (-not $styleFiles) { Write-Output "BLOCKED:MISSING_STYLE_OUTPUTS"; exit 1 }

# Clean up partial output if hash file is missing
$partial = Get-ChildItem -Path $OutputFolder -Filter "CI-*.md" -ErrorAction SilentlyContinue
if ($partial -and -not (Test-Path $HashFile)) { $partial | Remove-Item -Force }

$allFiles = @($rcFiles) + @($styleFiles) | Sort-Object FullName
$parts    = foreach ($f in $allFiles) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
$combined = [string]::Join("|", $parts)

if (Test-Path $HashFile) {
    $stored = Get-Content -Path $HashFile -Raw
    if ($combined.Trim() -eq $stored.Trim()) { Write-Output "NO_CHANGE"; exit 0 }
}

foreach ($dir in @($OutputFolder, $ConcernsDir)) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

Write-Host "[$AgentId] PROCEED"
Write-Output "PROCEED"
Write-Output "RC_PATH:$RCFolder"
Write-Output "STYLE_OUT_PATH:$StyleOutFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
Write-Output "CONCERNS_PATH:$ConcernsDir"
