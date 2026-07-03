# manifest-writer.ps1 -- shared helpers for appending rows to orchestrator-manifest.md tables.
# Pulls mechanical write logic out of A-00's narrative responsibility (R3 SRP fix).
# A-00 invokes these helpers; the script handles the row format + idempotency.
#
# Dot-source from PowerShell:
#   . "$PSScriptRoot\manifest-writer.ps1"
#
# Or invoke each helper as a one-shot:
#   pwsh agentic-pipeline\scripts\manifest-writer.ps1 -Action AppendAudit ...

param(
    [string]$Action = "",
    [hashtable]$Fields = @{},
    [string]$WorkspaceRoot = ".",
    [string]$ManifestPath = ""
)

if (-not $ManifestPath) {
    $ManifestPath = Join-Path $WorkspaceRoot "agentic-pipeline\orchestrator-manifest.md"
}

function Get-ManifestContent {
    if (-not (Test-Path $ManifestPath)) {
        throw "Manifest not found: $ManifestPath"
    }
    return Get-Content -Path $ManifestPath -Raw
}

function Save-Manifest([string]$content) {
    Set-Content -Path $ManifestPath -Value $content -Encoding utf8
}

function Append-TableRow {
    param(
        [Parameter(Mandatory)][string]$SectionHeader,   # e.g. "## TEST DEFECT LOG"
        [Parameter(Mandatory)][string]$Row              # full pipe-delimited row including outer pipes
    )
    $c = Get-ManifestContent

    # Find the section. Pattern: header line + any prose + the table header line + separator line +
    # any number of body rows. Append the row before the section's terminating blank line or
    # next "---" boundary.
    $pattern = "(?ms)($([regex]::Escape($SectionHeader))\s*\r?\n.*?\|[^\r\n]+\|\s*\r?\n\|[\s\-:|]+\|\s*\r?\n)(.*?)(?=\r?\n---|\r?\n##\s|\z)"
    $m = [regex]::Match($c, $pattern)
    if (-not $m.Success) {
        throw "Section not found in manifest: $SectionHeader"
    }
    $head    = $m.Groups[1].Value
    $body    = $m.Groups[2].Value

    # Idempotency: if the exact row already present, no-op
    if ($body -match [regex]::Escape($Row.Trim())) {
        Write-Host "[manifest-writer] row already present (idempotent skip): $Row"
        return
    }

    # Strip placeholder "(empty)" row when present
    $bodyClean = ($body -replace "(?m)^\|\s*\(empty\)\s*\|.*\r?\n?", "")

    $newBlock = "$head$bodyClean$Row`r`n"
    $updated  = $c.Substring(0, $m.Index) + $newBlock + $c.Substring($m.Index + $m.Length)
    Save-Manifest $updated
    Write-Host "[manifest-writer] appended row to '$SectionHeader'"
}

function Append-AuditLog {
    param(
        [string]$Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss"),
        [Parameter(Mandatory)][string]$Agent,
        [Parameter(Mandatory)][string]$EventType,
        [Parameter(Mandatory)][string]$Detail
    )
    $row = "| $Timestamp | $Agent | $EventType | $Detail |"
    Append-TableRow -SectionHeader "## AUDIT LOG" -Row $row
}

function Append-TestDefect {
    param(
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Sprint,
        [Parameter(Mandatory)][string]$TestCase,
        [Parameter(Mandatory)][string]$Layer,
        [Parameter(Mandatory)][string]$Severity,
        [Parameter(Mandatory)][string]$Owner,
        [string]$Status     = "open",
        [string]$Resolution = ""
    )
    $row = "| $Id | $Sprint | $TestCase | $Layer | $Severity | $Owner | $Status | $Resolution |"
    Append-TableRow -SectionHeader "## TEST DEFECT LOG" -Row $row
}

function Append-Dispute {
    param(
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$DefectRef,
        [Parameter(Mandatory)][string]$Disputer,
        [Parameter(Mandatory)][string]$Verdict,
        [string]$Resolution = ""
    )
    $row = "| $Id | $DefectRef | $Disputer | $Verdict | $Resolution |"
    Append-TableRow -SectionHeader "## DISPUTE LOG" -Row $row
}

function Append-Validation {
    param(
        [string]$Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss"),
        [Parameter(Mandatory)][string]$Validator,
        [Parameter(Mandatory)][string]$Target,
        [Parameter(Mandatory)][string]$Result,    # VALIDATION_PASS | VALIDATION_FAIL | ALIGNMENT_CONFLICT
        [string]$Detail = ""
    )
    $row = "| $Timestamp | $Validator | $Target | $Result | $Detail |"
    Append-TableRow -SectionHeader "## VALIDATION LOG" -Row $row
}

function Append-CrossSprint {
    param(
        [Parameter(Mandatory)][string]$Sprint,
        [Parameter(Mandatory)][string]$RcRef,
        [Parameter(Mandatory)][string]$FromSprint,
        [Parameter(Mandatory)][string]$Action,
        [string]$Context = ""
    )
    $row = "| $Sprint | $RcRef | $FromSprint | $Action | $Context |"
    Append-TableRow -SectionHeader "## CROSS-SPRINT LOG" -Row $row
}

# One-shot dispatcher when invoked directly
if ($Action) {
    switch ($Action) {
        "AppendAudit"        { Append-AuditLog        @Fields }
        "AppendTestDefect"   { Append-TestDefect      @Fields }
        "AppendDispute"      { Append-Dispute         @Fields }
        "AppendValidation"   { Append-Validation      @Fields }
        "AppendCrossSprint"  { Append-CrossSprint     @Fields }
        default              { throw "Unknown action: $Action" }
    }
}
