# H-01r-requirement-resolver.ps1 -- Requirement Resolver
# Idempotent CL re-resolution: same CL + same source hash -> NO_CHANGE.
param(
    [string]$SprintId      = "sprint-01",
    [Parameter(Mandatory)][string]$ClId,       # e.g. CL-A04-003 or CNC-A03-001
    [string]$AffectedRc    = "",                # e.g. RC-012 (optional; helpful for the hash)
    [string]$WorkspaceRoot = "."
)

$AgentId          = "A-01r"
$SprintsPath      = Join-Path $WorkspaceRoot "sprints"
$PipelinePath     = Join-Path $WorkspaceRoot "agentic-pipeline"
$ReqInputs        = Join-Path $SprintsPath  "$SprintId\req-inputs"
$ReqOutputs       = Join-Path $SprintsPath  "$SprintId\req-outputs"
$ResolutionsDir   = Join-Path $SprintsPath  "$SprintId\concerns\resolutions"
$BriefingsDir     = Join-Path $PipelinePath "briefings"
$BriefingFile     = Join-Path $BriefingsDir "$ClId-A-01r-briefing.md"
$ResolutionFile   = Join-Path $ResolutionsDir "$ClId-resolution.md"
$HashFile         = Join-Path $ResolutionsDir ".$ClId.input-hash"

Write-Host "[$AgentId] Hooks -- CL: $ClId Sprint: $SprintId"

if (-not (Test-Path $BriefingFile)) {
    Write-Output "BLOCKED:MISSING_BRIEFING:$BriefingFile"
    exit 1
}

if (-not (Test-Path $ResolutionsDir)) {
    New-Item -ItemType Directory -Path $ResolutionsDir -Force | Out-Null
}

# Hash scope: briefing + affected RC + req-inputs/* + prior resolutions
$toHash = @()
$toHash += Get-Item -LiteralPath $BriefingFile

if ($AffectedRc) {
    $rcFile = Join-Path $ReqOutputs "$AffectedRc.md"
    if (Test-Path $rcFile) { $toHash += Get-Item -LiteralPath $rcFile }
}

if (Test-Path $ReqInputs) {
    $toHash += Get-ChildItem -Path $ReqInputs -File -Recurse -ErrorAction SilentlyContinue |
               Where-Object { $_.Name -ne "START_SPRINT" -and $_.Name -ne "README.md" }
}

if (Test-Path $ResolutionsDir) {
    $toHash += Get-ChildItem -Path $ResolutionsDir -Filter "*-resolution.md" -ErrorAction SilentlyContinue |
               Where-Object { $_.BaseName -ne "$ClId-resolution" }
}

$sorted   = $toHash | Where-Object { $_ -ne $null } | Sort-Object FullName
$parts    = foreach ($f in $sorted) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
$combined = [string]::Join("|", $parts)

if (Test-Path $HashFile) {
    $stored = Get-Content -Path $HashFile -Raw
    if ($combined.Trim() -eq $stored.Trim() -and (Test-Path $ResolutionFile)) {
        Write-Output "NO_CHANGE"
        exit 0
    }
}

Write-Output "PROCEED"
Write-Output "CL_ID:$ClId"
Write-Output "BRIEFING_PATH:$BriefingFile"
Write-Output "AFFECTED_RC:$AffectedRc"
Write-Output "REQ_INPUTS_PATH:$ReqInputs"
Write-Output "REQ_OUTPUTS_PATH:$ReqOutputs"
Write-Output "RESOLUTIONS_PATH:$ResolutionsDir"
Write-Output "OUTPUT_FILE:$ResolutionFile"
Write-Output "HASH_FILE:$HashFile"
