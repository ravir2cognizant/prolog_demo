# =============================================================================
# cost-guard.ps1 -- PreToolUse cost guard
# Blocks further tool calls when session tool-call count exceeds the ceiling.
# Uses tool-call count as a proxy for session cost (exact USD not available
# via Claude Code hooks -- adapt when Anthropic exposes cost_usd in payload).
#
# Ceiling: 300 tool calls (POC baseline). Tighten for production.
# Implements: F-01 (cost-optimization-kb Section 11B), rules S4 + AP6 + O5.
# =============================================================================

$ErrorActionPreference = 'Stop'

# ---- Resolve workspace root -------------------------------------------------
$WorkspaceRoot = if ($env:POC_WORKSPACE_ROOT) { $env:POC_WORKSPACE_ROOT }
                 else { Split-Path (Split-Path $PSScriptRoot) }

$MaxToolCalls   = 300
$WarnToolCalls  = 200

# ---- Read event payload from stdin ------------------------------------------
try {
    $eventJson = [Console]::In.ReadToEnd()
    $event = $eventJson | ConvertFrom-Json
} catch {
    exit 0  # parse failure is non-fatal; allow the tool call
}

$sessionId = if ($event.session_id) { $event.session_id } else { "unknown" }

# ---- Count tool calls logged so far this session ----------------------------
$TelemetryDir = Join-Path $WorkspaceRoot "agentic-pipeline\telemetry\sessions"
$stateFile    = Join-Path $TelemetryDir "$sessionId.jsonl"

if (-not (Test-Path $stateFile)) {
    exit 0  # no log yet -- first call in session, allow
}

try {
    $callCount = (Get-Content $stateFile -ErrorAction Stop | Measure-Object -Line).Lines
} catch {
    exit 0  # unreadable log -- non-fatal, allow
}

# ---- Enforce ceiling --------------------------------------------------------
if ($callCount -ge $MaxToolCalls) {
    $response = [ordered]@{
        decision = 'block'
        message  = "[cost-guard] Session tool-call count $callCount >= ceiling $MaxToolCalls. " +
                   "Run /compact (Protocol 5.5) or /clear before continuing. " +
                   "This prevents runaway cost on Opus agent activations."
    }
    $response | ConvertTo-Json -Compress | Write-Output
    exit 2
}

# ---- Advisory warning (non-blocking) ----------------------------------------
if ($callCount -ge $WarnToolCalls) {
    [Console]::Error.WriteLine("[cost-guard] WARN: $callCount tool calls this session. Approaching ceiling $MaxToolCalls. Consider /compact soon (Protocol 5.5).")
}

exit 0
