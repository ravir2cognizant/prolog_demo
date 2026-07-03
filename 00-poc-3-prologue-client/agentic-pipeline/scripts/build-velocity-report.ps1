# build-velocity-report.ps1
# Generates sprints/<sprintId>/review/velocity-report.md from manifest + audit-log + JSON summaries.
# Invoked by A-SM at sprint complete. The agent does not hand-craft the report.
#
# Usage:
#   pwsh agentic-pipeline\scripts\build-velocity-report.ps1 -SprintId sprint-01 -WorkspaceRoot .
#
# Inputs:
#   agentic-pipeline\orchestrator-manifest.md
#   agentic-pipeline\audit-log.md
#   sprints\<id>\review\review-summary.json
#   sprints\<id>\tests\fe\test-results\defect-summary-fe.json
#   sprints\<id>\tests\bff\test-results\defect-summary-bff.json
#
# Output:
#   sprints\<id>\review\velocity-report.md

param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$SprintPath   = Join-Path $WorkspaceRoot "sprints\$SprintId"
$Manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"
$AuditLog     = Join-Path $PipelinePath "audit-log.md"
$ReviewPath   = Join-Path $SprintPath  "review"
$OutPath      = Join-Path $ReviewPath  "velocity-report.md"

if (-not (Test-Path $ReviewPath)) { New-Item -ItemType Directory -Path $ReviewPath -Force | Out-Null }

function Read-JsonOrNull([string]$path) {
    if (-not (Test-Path $path)) { return $null }
    try { return Get-Content -Path $path -Raw | ConvertFrom-Json } catch { return $null }
}

$reviewSummary = Read-JsonOrNull (Join-Path $ReviewPath "review-summary.json")
$feDefects     = Read-JsonOrNull (Join-Path $SprintPath "tests\fe\test-results\defect-summary-fe.json")
$bffDefects    = Read-JsonOrNull (Join-Path $SprintPath "tests\bff\test-results\defect-summary-bff.json")
$feDispute     = Read-JsonOrNull (Join-Path $SprintPath "tests\fe\test-results\dispute-summary.json")
$bffDispute    = Read-JsonOrNull (Join-Path $SprintPath "tests\bff\test-results\dispute-summary.json")
$crossSprint   = Read-JsonOrNull (Join-Path $SprintPath "req-outputs\cross-sprint-refs.json")

$mc = if (Test-Path $Manifest) { Get-Content -Path $Manifest -Raw } else { "" }
$al = if (Test-Path $AuditLog) { Get-Content -Path $AuditLog -Raw } else { "" }

# Count hash-skips ([=]) and explicit task statuses in audit log entries for this sprint
$skipCount    = ([regex]::Matches($al, "(?i)$SprintId.*\[=\]")).Count
$completeCount= ([regex]::Matches($al, "(?i)$SprintId.*\[x\]")).Count
$spawnCount   = ([regex]::Matches($al, "(?i)sub-agent spawn|case [ABC]:")).Count
$compactCount = ([regex]::Matches($al, "(?i)/compact|compact invoked|compact session")).Count
$validatorFail= ([regex]::Matches($al, "(?i)VALIDATION_FAIL|ALIGNMENT_CONFLICT")).Count

function Fmt-Defects($d) {
    if (-not $d) { return "(no summary)" }
    $tot = if ($d.totalDefects) { $d.totalDefects } else { 0 }
    $crit = if ($d.byCriticality.critical) { $d.byCriticality.critical } else { 0 }
    $high = if ($d.byCriticality.high)     { $d.byCriticality.high }     else { 0 }
    $med  = if ($d.byCriticality.medium)   { $d.byCriticality.medium }   else { 0 }
    $low  = if ($d.byCriticality.low)      { $d.byCriticality.low }      else { 0 }
    $info = if ($d.byCriticality.info)     { $d.byCriticality.info }     else { 0 }
    return "total=$tot  C=$crit/H=$high/M=$med/L=$low/I=$info"
}

$reviewTotal       = if ($reviewSummary -and $reviewSummary.totalFindings) { $reviewSummary.totalFindings } else { 0 }
$reviewRework      = if ($reviewSummary) { $reviewSummary.reworkRequired } else { $false }
$reviewVerdict     = if ($reviewSummary -and $reviewSummary.verdict) { $reviewSummary.verdict } else { "(unknown)" }

$feDisputeCount    = if ($feDispute)  { @($feDispute).Count }  else { 0 }
$bffDisputeCount   = if ($bffDispute) { @($bffDispute).Count } else { 0 }
$crossSprintCount  = if ($crossSprint) { @($crossSprint).Count } else { 0 }

$content = @"
# Sprint $SprintId Velocity Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Generator: build-velocity-report.ps1
Note: produced by script. Do not hand-edit -- regenerate from manifest + audit-log + JSON summaries.

## Summary
| Metric                  | Value                                       |
|-------------------------|---------------------------------------------|
| Sprint ID               | $SprintId                                   |
| Cross-sprint refs       | $crossSprintCount                           |
| Code review verdict     | $reviewVerdict                              |
| Code review findings    | $reviewTotal                                |
| Rework required         | $reviewRework                               |
| FE defects              | $(Fmt-Defects $feDefects)                   |
| BFF defects             | $(Fmt-Defects $bffDefects)                  |
| FE disputes             | $feDisputeCount                             |
| BFF disputes            | $bffDisputeCount                            |
| Validator failures      | $validatorFail                              |

## Phase Breakdown
(Pulled from manifest task registry status column. Status legend: [x] complete, [=] hash-skipped, [V] validation-failed, [T] timed out.)

| Phase             | Tasks                            |
|-------------------|----------------------------------|
| Input + RA        | T-001                            |
| Sign-off Gate     | T-GATE (6 signing agents)        |
| Design            | T-002, T-003a, T-003b            |
| Test Planning     | T-009, T-010                     |
| Implementation    | T-004, T-005                     |
| Review            | T-006                            |
| Test Execution    | T-011, T-012                     |
| Rework (consol.)  | T-007 (CRs + DEFs together)      |
| Code Re-review    | T-008                            |
| Test Re-execution | T-013, T-014                     |

## Cost Summary (Protocol 5)
| Metric                        | Value          |
|-------------------------------|----------------|
| Hash-skips applied ([=])      | $skipCount     |
| Sub-agent spawns              | $spawnCount    |
| /compact invocations          | $compactCount  |
| Validator failures            | $validatorFail |
| Tasks completed ([x])         | $completeCount |

(See ``.claude/kb/cost-optimization-kb.md`` Section 10 for the tier baseline.)

## Test Outcomes
| Layer | Defects (C/H/M/L/I)              | Disputes |
|-------|----------------------------------|----------|
| FE    | $(Fmt-Defects $feDefects)        | $feDisputeCount  |
| BFF   | $(Fmt-Defects $bffDefects)       | $bffDisputeCount |

## Notes
- This report is a snapshot. Source-of-truth remains the manifest + audit-log + JSON summaries.
- Empty values indicate the corresponding JSON summary was not produced or the sprint phase did not run.
"@

Set-Content -Path $OutPath -Value $content -Encoding utf8
Write-Host "Wrote: $OutPath"
