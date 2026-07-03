# H-02-bff-designer.ps1 -- BFF Endpoint Designer
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-002",
    [string]$WorkspaceRoot = ".",
    [switch]$PostCheck
)

$AgentId      = "A-02"
$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$InputFolder  = Join-Path $SprintsPath "$SprintId\req-outputs"
$OutputFolder = Join-Path $SprintsPath "$SprintId\endpoint-design"
$HashFile     = Join-Path $OutputFolder ".input-hash"
$Manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-02's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
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

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue
if ($mc -notmatch "T-GATE.*\[x\]") {
    Write-Host "[$AgentId] BLOCKED: Gate not complete"
    Write-Output "BLOCKED:GATE_NOT_OPEN"
    exit 1
}

$inputFiles = Get-ChildItem -Path $InputFolder -Filter "RC-*.md" -ErrorAction SilentlyContinue
if (-not $inputFiles) {
    Write-Output "BLOCKED:MISSING_INPUT"
    exit 1
}

$partial = Get-ChildItem -Path $OutputFolder -Filter "ED-*.md" -ErrorAction SilentlyContinue
if ($partial -and -not (Test-Path $HashFile)) { $partial | Remove-Item -Force }

$sorted    = $inputFiles | Sort-Object Name
$parts     = foreach ($f in $sorted) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
$combined  = [string]::Join("|", $parts)

if (Test-Path $HashFile) {
    $stored = Get-Content -Path $HashFile -Raw
    if ($combined.Trim() -eq $stored.Trim()) { Write-Output "NO_CHANGE"; exit 0 }
}

if (-not (Test-Path $OutputFolder)) { New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null }

Write-Host "[$AgentId] PROCEED"
Write-Output "PROCEED"
Write-Output "INPUT_PATH:$InputFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
