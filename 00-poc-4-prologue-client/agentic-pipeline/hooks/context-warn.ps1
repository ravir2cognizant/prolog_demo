# =============================================================================
# context-warn.ps1 -- UserPromptSubmit context bloat warning
# Advisory only -- always exits 0 (non-blocking).
# Fires before each user prompt is submitted. Reads the session telemetry log
# and warns when tool-call count approaches the /compact threshold.
#
# Thresholds (Protocol 5.5):
#   >= 100 calls: INFO -- suggest /compact after next few mode-switches
#   >= 200 calls: WARN -- /compact now before next activation
# Implements: F-04 (cost-optimization-kb Section 11B), rule AP15.
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

# ---- Count tool calls in this session ---------------------------------------
$TelemetryDir = Join-Path $WorkspaceRoot "agentic-pipeline\telemetry\sessions"
$stateFile    = Join-Path $TelemetryDir "$sessionId.jsonl"

if (-not (Test-Path $stateFile)) { exit 0 }

try {
    $callCount = (Get-Content $stateFile | Measure-Object -Line).Lines
} catch {
    exit 0
}

# ---- Emit advisory message to stderr (non-blocking) -------------------------
if ($callCount -ge 200) {
    [Console]::Error.WriteLine("[COST] WARNING: $callCount tool calls this session. Run /compact NOW before the next agent activation (Protocol 5.5). Avoids expensive context-bloat recovery.")
} elseif ($callCount -ge 100) {
    [Console]::Error.WriteLine("[COST] INFO: $callCount tool calls. Plan to /compact after 3-4 more mode-switches (Protocol 5.5).")
}

exit 0
