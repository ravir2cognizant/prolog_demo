# route-defects.ps1 -- Mechanical defect-routing helper (R3 SRP fix).
# Reads review-summary.json + defect-summary-fe.json + defect-summary-bff.json
# and emits a routing-plan.json that tells Orchestrator which agents to activate
# in T-007 (consolidated rework) and what to put in each briefing.
#
# Orchestrator stays the coordinator; the mechanical aggregation logic lives here.
#
# Usage:
#   pwsh agentic-pipeline\scripts\route-defects.ps1 -SprintId sprint-01 -WorkspaceRoot .
#
# Output:
#   agentic-pipeline\briefings\T-007-routing-plan.json

param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

$SprintPath  = Join-Path $WorkspaceRoot "sprints\$SprintId"
$BriefingDir = Join-Path $WorkspaceRoot "agentic-pipeline\briefings"
$ReviewSum   = Join-Path $SprintPath "review\review-summary.json"
$FeDef       = Join-Path $SprintPath "tests\fe\test-results\defect-summary-fe.json"
$BffDef      = Join-Path $SprintPath "tests\bff\test-results\defect-summary-bff.json"
$OutPath     = Join-Path $BriefingDir "T-007-routing-plan.json"

if (-not (Test-Path $BriefingDir)) { New-Item -ItemType Directory -Path $BriefingDir -Force | Out-Null }

function Load-Json([string]$p) {
    if (-not (Test-Path $p)) { return $null }
    try { return Get-Content -Path $p -Raw | ConvertFrom-Json } catch { return $null }
}

$review = Load-Json $ReviewSum
$fe     = Load-Json $FeDef
$bff    = Load-Json $BffDef

function Int($v) { if ($null -eq $v) { 0 } else { [int]$v } }

# Build per-agent counts
$agt04_cr = Int $review.byOwner.'A-04'
$agt05_cr = Int $review.byOwner.'A-05'
$shared_cr= Int $review.byOwner.shared

$agt04_def = Int $fe.byOwner.'A-04'
$agt05_def = Int $bff.byOwner.'A-05'
$shared_def= (Int $fe.byOwner.shared) + (Int $bff.byOwner.shared)

$testCaseBugs = (Int $fe.byOwner.'test-case-bug') + (Int $bff.byOwner.'test-case-bug')

$reviewRework = ($review -ne $null) -and ($review.reworkRequired -eq $true)
$feRework     = ($fe     -ne $null) -and ($fe.reworkRequired     -eq $true)
$bffRework    = ($bff    -ne $null) -and ($bff.reworkRequired    -eq $true)

$activateAGT04 = ($agt04_cr + $agt04_def + $shared_cr + $shared_def) -gt 0
$activateAGT05 = ($agt05_cr + $agt05_def + $shared_cr + $shared_def) -gt 0

$plan = [ordered]@{
    sprintId            = $SprintId
    generatedAt         = (Get-Date -Format "o")
    consolidatedRework  = ($reviewRework -or $feRework -or $bffRework)
    canonical           = "BE-canonical (default per D-019; FE adapts to BE shape on shared findings)"
    perAgent = [ordered]@{
        'A-04' = [ordered]@{
            activate       = $activateAGT04
            codeReviewCount= ($agt04_cr + $shared_cr)
            testDefectCount= ($agt04_def + (Int $fe.byOwner.shared))
            inputs         = @(
                "sprints/$SprintId/review-inputs/code-review/  (filter owner: A-04 | shared)",
                "sprints/$SprintId/tests/fe/test-results/defects/  (filter owner: A-04 | shared)"
            )
        }
        'A-05' = [ordered]@{
            activate       = $activateAGT05
            codeReviewCount= ($agt05_cr + $shared_cr)
            testDefectCount= ($agt05_def + (Int $bff.byOwner.shared))
            inputs         = @(
                "sprints/$SprintId/review-inputs/code-review/  (filter owner: A-05 | shared)",
                "sprints/$SprintId/tests/bff/test-results/defects/  (filter owner: A-05 | shared)"
            )
        }
    }
    testCaseBugs        = $testCaseBugs
    testCaseBugRouting  = "back to originating test agent (A-07/A-08); does NOT block sprint completion"
}

$plan | ConvertTo-Json -Depth 6 | Set-Content -Path $OutPath -Encoding utf8
Write-Host "Wrote: $OutPath"
Write-Host "  activate A-04: $activateAGT04  (CR=$($agt04_cr + $shared_cr) DEF=$($agt04_def + (Int $fe.byOwner.shared)))"
Write-Host "  activate A-05: $activateAGT05  (CR=$($agt05_cr + $shared_cr) DEF=$($agt05_def + (Int $bff.byOwner.shared)))"
Write-Host "  test-case bugs (route to test agents): $testCaseBugs"
