# =============================================================================
# trace-rollup.ps1 -- Stop hook trace rollup
# Fires when a Claude Code session ends. Reads the session's JSONL telemetry
# log and appends a per-session summary to rollups.jsonl.
# The rollup feeds build-velocity-report.ps1 for per-sprint cost attribution.
#
# Output: agentic-pipeline\telemetry\rollups.jsonl
# Implements: F-02 (cost-optimization-kb Section 11B), rule M2.
# =============================================================================

$ErrorActionPreference = 'SilentlyContinue'

# ---- Resolve workspace root -------------------------------------------------
$WorkspaceRoot = if ($env:POC_WORKSPACE_ROOT) { $env:POC_WORKSPACE_ROOT }
                 else { Split-Path (Split-Path $PSScriptRoot) }

# ---- Read event payload from stdin ------------------------------------------
try {
    $eventJson = [Console]::In.ReadToEnd()
    $event = $eventJson | ConvertFrom-Json
} catch {
    exit 0
}

$sessionId = if ($event.session_id) { $event.session_id } else { "unknown" }

# ---- Read session JSONL log -------------------------------------------------
$TelemetryDir = Join-Path $WorkspaceRoot "agentic-pipeline\telemetry"
$SessionsDir  = Join-Path $TelemetryDir "sessions"
$RollupFile   = Join-Path $TelemetryDir "rollups.jsonl"
$stateFile    = Join-Path $SessionsDir "$sessionId.jsonl"

if (-not (Test-Path $stateFile)) { exit 0 }

$calls = @()
try {
    $calls = Get-Content $stateFile | ForEach-Object {
        try { $_ | ConvertFrom-Json } catch {}
    } | Where-Object { $_ }
} catch { exit 0 }

if ($calls.Count -eq 0) { exit 0 }

# ---- Aggregate ---------------------------------------------------------------
$totalInputBytes    = ($calls | Measure-Object -Property input_bytes    -Sum).Sum
$totalResponseBytes = ($calls | Measure-Object -Property response_bytes -Sum).Sum
$toolsUsed          = @($calls | Select-Object -ExpandProperty tool_name -Unique | Sort-Object)

$rollup = [ordered]@{
    session_id            = $sessionId
    ended_at              = (Get-Date -Format 'o')
    tool_call_count       = $calls.Count
    total_input_bytes     = $totalInputBytes
    total_response_bytes  = $totalResponseBytes
    tools_used            = $toolsUsed
}

# ---- Write rollup -----------------------------------------------------------
if (-not (Test-Path $TelemetryDir)) {
    try { New-Item -ItemType Directory -Path $TelemetryDir -Force | Out-Null } catch { exit 0 }
}

try {
    $rollup | ConvertTo-Json -Compress | Add-Content -Path $RollupFile -Encoding utf8
} catch {}

exit 0
