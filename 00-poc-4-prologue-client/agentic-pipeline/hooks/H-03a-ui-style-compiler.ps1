# H-03a-ui-style-compiler.ps1 -- UI Style Compiler
# Hash scope: ui-style-inputs/* only (NOT RC cards). Empty folder is acceptable.
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-003a",
    [string]$WorkspaceRoot = ".",
    [switch]$PostCheck
)

$AgentId      = "A-03a"
$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$InputFolder  = Join-Path $SprintsPath "$SprintId\ui-style-inputs"
$OutputFolder = Join-Path $SprintsPath "$SprintId\ui-style-outputs"
$ConcernsDir  = Join-Path $SprintsPath "$SprintId\concerns\uicd"
$HashFile     = Join-Path $OutputFolder ".input-hash"
$Manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-03a's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-03a-tokens-schema.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
    $exit1 = $LASTEXITCODE
    if ($exit1 -eq 0) { Write-Output "VALIDATION_PASS"; exit 0 }
    Write-Output "VALIDATION_FAIL"; exit 1
}

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue
if ($mc -notmatch "T-GATE.*\[x\]") { Write-Output "BLOCKED:GATE_NOT_OPEN"; exit 1 }

# Ensure folders exist
foreach ($dir in @($InputFolder, $OutputFolder, $ConcernsDir)) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

# Hash scope: ui-style-inputs/* (exclude README.md and dotfiles)
$inputFiles = Get-ChildItem -Path $InputFolder -File -Recurse -ErrorAction SilentlyContinue |
              Where-Object { $_.Name -ne "README.md" -and $_.Name -notlike ".*" } |
              Sort-Object FullName

if (-not $inputFiles -or $inputFiles.Count -eq 0) {
    # Empty input folder is acceptable -- emit baseline defaults
    $combined = "EMPTY_INPUT_BASELINE"
} else {
    $parts    = foreach ($f in $inputFiles) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
    $combined = [string]::Join("|", $parts)
}

if (Test-Path $HashFile) {
    $stored = Get-Content -Path $HashFile -Raw
    if ($combined.Trim() -eq $stored.Trim()) { Write-Output "NO_CHANGE"; exit 0 }
}

Write-Host "[$AgentId] PROCEED"
Write-Output "PROCEED"
Write-Output "INPUT_PATH:$InputFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
Write-Output "CONCERNS_PATH:$ConcernsDir"
