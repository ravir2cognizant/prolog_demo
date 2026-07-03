# build-test-report.ps1
# Generates TR-{layer}-summary.html from vitest JSON output + defect summary.
# Invoked by A-07 (T-011/T-013) and A-08 (T-012/T-014). Agents do NOT generate HTML themselves.
#
# Usage:
#   pwsh agentic-pipeline\scripts\build-test-report.ps1 -SprintId sprint-01 -Layer bff -WorkspaceRoot .
#   pwsh agentic-pipeline\scripts\build-test-report.ps1 -SprintId sprint-01 -Layer fe  -WorkspaceRoot .
#
# Inputs:
#   sprints\<id>\tests\<layer>\test-output.json             (vitest --reporter=json output)
#   sprints\<id>\tests\<layer>\test-results\defect-summary-<layer>.json
#   sprints\<id>\tests\<layer>\test-results\failures-<layer>.md  (optional)
#
# Output:
#   sprints\<id>\tests\<layer>\test-results\TR-<layer>-summary.html

param(
    [Parameter(Mandatory)][string]$SprintId,
    [Parameter(Mandatory)][ValidateSet("fe","bff")][string]$Layer,
    [string]$WorkspaceRoot = "."
)

$TestsPath   = Join-Path $WorkspaceRoot "sprints\$SprintId\tests\$Layer"
$ResultsPath = Join-Path $TestsPath "test-results"
$OutPath     = Join-Path $ResultsPath "TR-$Layer-summary.html"

if (-not (Test-Path $ResultsPath)) { New-Item -ItemType Directory -Path $ResultsPath -Force | Out-Null }

function Read-JsonOrNull([string]$path) {
    if (-not (Test-Path $path)) { return $null }
    try { return Get-Content -Path $path -Raw | ConvertFrom-Json } catch { return $null }
}

$vitestOutput  = Read-JsonOrNull (Join-Path $TestsPath "test-output.json")
$defectSummary = Read-JsonOrNull (Join-Path $ResultsPath "defect-summary-$Layer.json")
$failureMd     = Join-Path $ResultsPath "failures-$Layer.md"
$failureText   = if (Test-Path $failureMd) { Get-Content -Path $failureMd -Raw } else { "" }

# ---- Extract metrics ----
$totalTests  = if ($vitestOutput -and $vitestOutput.numTotalTests)  { $vitestOutput.numTotalTests }  else { 0 }
$passedTests = if ($vitestOutput -and $vitestOutput.numPassedTests) { $vitestOutput.numPassedTests } else { 0 }
$failedTests = if ($vitestOutput -and $vitestOutput.numFailedTests) { $vitestOutput.numFailedTests } else { 0 }
$skippedTests= if ($vitestOutput -and $vitestOutput.numPendingTests){ $vitestOutput.numPendingTests } else { 0 }
$passRate    = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

$totalDefects = if ($defectSummary -and $defectSummary.totalDefects) { $defectSummary.totalDefects } else { 0 }
$openDefects  = if ($defectSummary -and $defectSummary.openDefects)  { $defectSummary.openDefects }  else { $totalDefects }

# ---- Build test-results table rows ----
$resultRows = ""
if ($vitestOutput -and $vitestOutput.testResults) {
    foreach ($file in $vitestOutput.testResults) {
        if ($file.assertionResults) {
            foreach ($tc in $file.assertionResults) {
                $status  = if ($tc.status -eq "passed") { "passed" } else { "failed" }
                $badge   = if ($status -eq "passed") { '<span class="badge pass">PASS</span>' } else { '<span class="badge fail">FAIL</span>' }
                $title   = [System.Web.HttpUtility]::HtmlEncode($tc.title)
                $msg     = if ($tc.failureMessages -and $tc.failureMessages.Count -gt 0) {
                               [System.Web.HttpUtility]::HtmlEncode($tc.failureMessages[0] -replace "`r?`n.*", "")
                           } else { "" }
                $resultRows += "          <tr><td>$title</td><td>$badge</td><td class=`"note`">$msg</td></tr>`n"
            }
        }
    }
}
if (-not $resultRows) {
    $resultRows = "          <tr><td colspan=`"3`">(no test results in test-output.json)</td></tr>`n"
}

# ---- Build defects table rows ----
$defectRows = ""
if ($defectSummary -and $defectSummary.defects) {
    foreach ($d in $defectSummary.defects) {
        $id       = if ($d.id)          { [System.Web.HttpUtility]::HtmlEncode($d.id) }          else { "" }
        $tc       = if ($d.testCase)    { [System.Web.HttpUtility]::HtmlEncode($d.testCase) }    else { "" }
        $sev      = if ($d.severity)    { [System.Web.HttpUtility]::HtmlEncode($d.severity) }    else { "" }
        $owner    = if ($d.owner)       { [System.Web.HttpUtility]::HtmlEncode($d.owner) }       else { "" }
        $dstatus  = if ($d.status)      { [System.Web.HttpUtility]::HtmlEncode($d.status) }      else { "open" }
        $desc     = if ($d.description) { [System.Web.HttpUtility]::HtmlEncode($d.description) } else { "" }
        $sevClass = switch ($sev) { "critical" { "sev-critical" } "high" { "sev-high" } "medium" { "sev-medium" } default { "sev-low" } }
        $defectRows += "          <tr><td>$id</td><td>$tc</td><td><span class=`"sev $sevClass`">$sev</span></td><td>$owner</td><td>$dstatus</td><td class=`"note`">$desc</td></tr>`n"
    }
}
if (-not $defectRows) {
    $defectRows = "          <tr><td colspan=`"6`">No defects recorded.</td></tr>`n"
}

# ---- Escape failures.md content for HTML ----
$failureHtml = if ($failureText) {
    "<pre class=`"failures`">" + [System.Web.HttpUtility]::HtmlEncode($failureText) + "</pre>"
} else {
    "<p>No failures-$Layer.md file present.</p>"
}

$layerLabel  = $Layer.ToUpper()
$passClass   = if ($passRate -ge 90) { "metric-pass" } elseif ($passRate -ge 70) { "metric-warn" } else { "metric-fail" }
$generated   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TR-$layerLabel Summary -- $SprintId</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f7fa; color: #1a1a2e; }
    h1   { font-size: 1.5rem; margin-bottom: 4px; }
    .meta { color: #666; font-size: 0.85rem; margin-bottom: 24px; }
    .metrics { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .card { background: #fff; border-radius: 8px; padding: 16px 24px; box-shadow: 0 1px 4px rgba(0,0,0,.08); min-width: 120px; text-align: center; }
    .card .val { font-size: 2rem; font-weight: 700; line-height: 1.1; }
    .card .lbl { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }
    .metric-pass { color: #22863a; }
    .metric-warn { color: #b08800; }
    .metric-fail { color: #cb2431; }
    h2 { font-size: 1.1rem; margin-top: 28px; margin-bottom: 8px; border-bottom: 2px solid #e1e4e8; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); font-size: 0.88rem; }
    th { background: #24292e; color: #fff; text-align: left; padding: 9px 12px; font-weight: 600; }
    td { padding: 7px 12px; border-bottom: 1px solid #e1e4e8; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f6f8fa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
    .badge.pass { background: #dcffe4; color: #22863a; }
    .badge.fail { background: #ffdce0; color: #cb2431; }
    .sev { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 0.73rem; font-weight: 600; }
    .sev-critical { background: #ffdce0; color: #9e1c23; }
    .sev-high     { background: #fff5b1; color: #735c0f; }
    .sev-medium   { background: #fff0e0; color: #9a5200; }
    .sev-low      { background: #e8f5e9; color: #1b5e20; }
    .note { color: #555; font-size: 0.82rem; }
    pre.failures { background: #24292e; color: #e1e4e8; padding: 16px; border-radius: 8px; font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
    .footer { margin-top: 32px; font-size: 0.75rem; color: #999; text-align: right; }
  </style>
</head>
<body>
  <h1>Test Report -- $layerLabel Layer -- $SprintId</h1>
  <p class="meta">Generated: $generated &nbsp;&bull;&nbsp; Source: test-output.json + defect-summary-$Layer.json &nbsp;&bull;&nbsp; Generator: build-test-report.ps1</p>

  <div class="metrics">
    <div class="card"><div class="val">$totalTests</div><div class="lbl">Total Tests</div></div>
    <div class="card"><div class="val metric-pass">$passedTests</div><div class="lbl">Passed</div></div>
    <div class="card"><div class="val metric-fail">$failedTests</div><div class="lbl">Failed</div></div>
    <div class="card"><div class="val">$skippedTests</div><div class="lbl">Skipped</div></div>
    <div class="card"><div class="val $passClass">$passRate%</div><div class="lbl">Pass Rate</div></div>
    <div class="card"><div class="val metric-fail">$openDefects</div><div class="lbl">Open Defects</div></div>
  </div>

  <h2>Test Results</h2>
  <table>
    <thead><tr><th>Test Case</th><th>Verdict</th><th>Notes</th></tr></thead>
    <tbody>
$resultRows    </tbody>
  </table>

  <h2>Defects</h2>
  <table>
    <thead><tr><th>ID</th><th>Test Case</th><th>Severity</th><th>Owner</th><th>Status</th><th>Description</th></tr></thead>
    <tbody>
$defectRows    </tbody>
  </table>

  <h2>Failure Detail</h2>
  $failureHtml

  <div class="footer">Generated by build-test-report.ps1 &mdash; do not hand-edit. Regenerate from source JSON.</div>
</body>
</html>
"@

Set-Content -Path $OutPath -Value $html -Encoding utf8
Write-Host "Wrote: $OutPath"
