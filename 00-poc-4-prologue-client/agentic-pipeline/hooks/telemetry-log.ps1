# =============================================================================
# telemetry-log.ps1 -- PostToolUse telemetry logger
# Appends a per-tool-call record to a session JSONL log.
# Logs: tool_name, input/output byte sizes, timestamps.
# NOTE: Exact USD cost and token counts are not available in Claude Code's
# PostToolUse payload. Byte sizes are a proxy until Anthropic exposes usage.
# Adapt field names when the hook contract evolves.
#
# Output: agentic-pipeline\telemetry\sessions\{session_id}.jsonl
# Implements: F-02 (cost-optimization-kb Section 11B), rules T1 + T2 + M1.
# =============================================================================

$ErrorActionPreference = 'SilentlyContinue'  # telemetry failure must never block pipeline

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
$toolName  = if ($event.tool_name)   { $event.tool_name   } else { "unknown" }

# ---- Estimate sizes from payload --------------------------------------------
$inputBytes    = 0
$responseBytes = 0
try {
    if ($event.tool_input)    { $inputBytes    = ($event.tool_input    | ConvertTo-Json -Compress -Depth 10).Length }
    if ($event.tool_response) { $responseBytes = ($event.tool_response | ConvertTo-Json -Compress -Depth 10).Length }
} catch {}

# ---- Ensure telemetry directory exists --------------------------------------
$TelemetryDir = Join-Path $WorkspaceRoot "agentic-pipeline\telemetry\sessions"
if (-not (Test-Path $TelemetryDir)) {
    try { New-Item -ItemType Directory -Path $TelemetryDir -Force | Out-Null } catch { exit 0 }
}

# ---- Write record -----------------------------------------------------------
$record = [ordered]@{
    ts             = (Get-Date -Format 'o')
    session_id     = $sessionId
    tool_name      = $toolName
    input_bytes    = $inputBytes
    response_bytes = $responseBytes
}

try {
    $record | ConvertTo-Json -Compress | Add-Content -Path (Join-Path $TelemetryDir "$sessionId.jsonl") -Encoding utf8
} catch {}

exit 0
