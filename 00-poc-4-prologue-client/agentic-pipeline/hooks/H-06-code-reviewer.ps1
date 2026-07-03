# H-06-code-reviewer.ps1 -- Code Reviewer
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-006",
    [string]$WorkspaceRoot = ".",
    [switch]$PostCheck
)

$AgentId      = "A-06"
$SprintsPath  = Join-Path $WorkspaceRoot "sprints"
$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$AppPath      = Join-Path $WorkspaceRoot "app"
$FEFolder     = Join-Path $AppPath "frontend"
$BEFolder     = Join-Path $AppPath "backend"
$EDFolder     = Join-Path $SprintsPath "$SprintId\endpoint-design"
$RCFolder     = Join-Path $SprintsPath "$SprintId\req-outputs"
$OutputFolder = Join-Path $SprintsPath "$SprintId\review"
$HashFile     = Join-Path $OutputFolder ".input-hash"
$Manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-06's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
# A-06 emits findings under review-inputs/code-review (per A-00 mapping).
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-06-finding-schema.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot -Subfolder "code-review"
    $exit1 = $LASTEXITCODE
    if ($exit1 -eq 0) {
        $reportScript = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\build-review-report.ps1"
        if (Test-Path $reportScript) {
            & $reportScript -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot
            if ($LASTEXITCODE -ne 0) { Write-Host "[$AgentId] WARNING: build-review-report.ps1 exited $LASTEXITCODE (non-fatal)" }
        } else {
            Write-Host "[$AgentId] WARNING: build-review-report.ps1 not found -- skipping HTML report"
        }
        Write-Output "VALIDATION_PASS"; exit 0
    }
    Write-Output "VALIDATION_FAIL"; exit 1
}

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue
if ($TaskId -eq "T-008") {
    $deps = @("T-007.*\[x\]")
} else {
    $deps = @("T-004.*\[x\]", "T-005.*\[x\]")
}
foreach ($dep in $deps) {
    if ($mc -notmatch $dep) { Write-Output "BLOCKED:DEPENDENCY_NOT_COMPLETE"; exit 1 }
}

$feFiles = Get-ChildItem -Path $FEFolder -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\dist\\' }
$beFiles = Get-ChildItem -Path $BEFolder -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\dist\\' }
if (-not $feFiles -and -not $beFiles) { Write-Output "BLOCKED:NO_IMPLEMENTATION_FILES"; exit 1 }

$allFiles = @($feFiles) + @($beFiles) | Where-Object { $_ -ne $null } | Sort-Object FullName
$parts    = foreach ($f in $allFiles) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
$combined = [string]::Join("|", $parts)

if ($TaskId -ne "T-008") {
    if (Test-Path $HashFile) {
        $stored = Get-Content -Path $HashFile -Raw
        if ($combined.Trim() -eq $stored.Trim()) { Write-Output "NO_CHANGE"; exit 0 }
    }
}

if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
}

Write-Host "[$AgentId] PROCEED"
Write-Output "PROCEED"
Write-Output "FE_PATH:$FEFolder"
Write-Output "BE_PATH:$BEFolder"
Write-Output "ED_PATH:$EDFolder"
Write-Output "RC_PATH:$RCFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
