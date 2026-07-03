# H-04-frontend-developer.ps1 -- Frontend Developer
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-004",
    [string]$WorkspaceRoot = "."
)

$AgentId           = "A-04"
$SprintsPath       = Join-Path $WorkspaceRoot "sprints"
$PipelinePath      = Join-Path $WorkspaceRoot "agentic-pipeline"
$AppPath           = Join-Path $WorkspaceRoot "app"
$CIFolder          = Join-Path $SprintsPath "$SprintId\component-inventory"
$EDFolder          = Join-Path $SprintsPath "$SprintId\endpoint-design"
$RCFolder          = Join-Path $SprintsPath "$SprintId\req-outputs"
$UIStyleOutFolder  = Join-Path $SprintsPath "$SprintId\ui-style-outputs"
$OutputFolder      = Join-Path $AppPath "frontend"
$HashFile          = Join-Path $OutputFolder ".input-hash-$SprintId"
$Manifest          = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId"

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue
# A-03 split: dependencies are now T-003a (style) + T-003b (components) + T-002 (BFF design)
foreach ($dep in @("T-GATE.*\[(x|=)\]", "T-002.*\[(x|=)\]", "T-003a.*\[(x|=)\]", "T-003b.*\[(x|=)\]")) {
    if ($mc -notmatch $dep) {
        Write-Output "BLOCKED:DEPENDENCY_NOT_COMPLETE"
        exit 1
    }
}

# Tier-1 alignment validators (SRP fix -- mechanical check moves from agent to hook).
# A-04 receives clean inputs or never activates.
$ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
$alignScript    = Join-Path $ValidatorsRoot "V-shared-ci-ed-alignment.ps1"
$coverScript    = Join-Path $ValidatorsRoot "V-shared-rc-ci-coverage.ps1"

if (Test-Path $alignScript) {
    $alignOut = & $alignScript -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[$AgentId] CI/ED alignment validator failed:"
        $alignOut | ForEach-Object { Write-Host "  $_" }
        Write-Output "ALIGNMENT_CONFLICT"
        exit 1
    }
}
if (Test-Path $coverScript) {
    $coverOut = & $coverScript -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[$AgentId] RC->CI coverage validator failed:"
        $coverOut | ForEach-Object { Write-Host "  $_" }
        Write-Output "ALIGNMENT_CONFLICT"
        exit 1
    }
}

$ciFiles      = Get-ChildItem -Path $CIFolder         -Filter "CI-*.md" -ErrorAction SilentlyContinue
$edFiles      = Get-ChildItem -Path $EDFolder         -Filter "ED-*.md" -ErrorAction SilentlyContinue
$uiStyleFiles = Get-ChildItem -Path $UIStyleOutFolder -File             -ErrorAction SilentlyContinue
if (-not $ciFiles -or -not $edFiles) { Write-Output "BLOCKED:MISSING_DESIGN_FILES"; exit 1 }

if ($ciFiles.Count -ne $edFiles.Count) {
    Write-Output "ALIGNMENT_CONFLICT:COUNT_MISMATCH"
    exit 1
}

# Hash scope per A-04-frontend-developer-definition.md: CI + ED + ui-style-outputs/*
# ui-style-outputs/ may be empty (no human-supplied style guide); that is acceptable
# and contributes nothing to the hash, so the result remains deterministic.
$allFiles = @($ciFiles) + @($edFiles) + @($uiStyleFiles) | Where-Object { $_ -ne $null } | Sort-Object FullName
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
Write-Output "CI_PATH:$CIFolder"
Write-Output "ED_PATH:$EDFolder"
Write-Output "RC_PATH:$RCFolder"
Write-Output "UI_STYLE_OUT_PATH:$UIStyleOutFolder"
Write-Output "OUTPUT_PATH:$OutputFolder"
