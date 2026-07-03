# =============================================================================
# permission-guard.ps1 -- PreToolUse workspace-scope permission gate
#
# Approves tool calls whose effects are confined to the workspace folder without
# prompting the user. Falls through (exit 0, no output) when any path is outside
# the workspace -- Claude Code's normal user-prompt dialog handles those cases.
# This script never blocks; it only approves or defers.
#
# Covered tools:
#   Read               -> always approve  (read-only; zero write risk)
#   Write / Edit       -> approve if file_path is under $WorkspaceRoot
#   PowerShell         -> approve if -File script is under $WorkspaceRoot AND
#                         every detectable absolute path arg is under $WorkspaceRoot
#   Bash / executeCode -> approve if python/py script path is under $WorkspaceRoot
#                         AND every detectable absolute path arg is workspace-scoped
#   All other tools    -> no decision (falls through to settings.local.json / user)
#
# Decision contract (Claude Code hook spec):
#   {"decision":"approve"}  -> call proceeds without user prompt
#   exit 0, no JSON output  -> falls through to next hook / settings.local.json / user prompt
#
# Requires: POC_WORKSPACE_ROOT env var set in .claude/settings.json env block.
# Implements: dynamic workspace-boundary guard for all pipeline agent activations.
# =============================================================================

$ErrorActionPreference = 'SilentlyContinue'

# ---- Resolve workspace root -------------------------------------------------
$WorkspaceRoot = if ($env:POC_WORKSPACE_ROOT) { $env:POC_WORKSPACE_ROOT }
                 else { Split-Path (Split-Path $PSScriptRoot) }
# Normalise for reliable prefix comparison: no trailing sep, lowercase
$WorkspaceRootNorm = $WorkspaceRoot.TrimEnd('\', '/').ToLower()

# ---- Read event payload from stdin ------------------------------------------
try {
    $eventJson = [Console]::In.ReadToEnd()
    $event     = $eventJson | ConvertFrom-Json
} catch {
    exit 0   # parse failure -> non-fatal, fall through
}

$toolName  = if ($event.tool_name)  { [string]$event.tool_name  } else { "" }
$toolInput = $event.tool_input

# ---- Helper: is a path within workspace? ------------------------------------
function IsWithinWorkspace([string]$path) {
    if (-not $path) { return $false }
    $norm = $path.TrimEnd('\', '/').Replace('/', '\').ToLower()
    return $norm.StartsWith($WorkspaceRootNorm)
}

# ---- Helper: extract + check all absolute Windows paths in a string ---------
# Returns $true if every detectable absolute path in $text is workspace-scoped,
# or if no absolute paths are detected.
function AllAbsolutePathsWithinWorkspace([string]$text) {
    $pattern = '[A-Za-z]:\\[^\s"''`|&;><]+'
    $matches  = [regex]::Matches($text, $pattern)
    foreach ($m in $matches) {
        if (-not (IsWithinWorkspace $m.Value)) { return $false }
    }
    return $true   # zero matches also returns $true (no absolute paths to check)
}

# ---- Emit approve decision --------------------------------------------------
function Approve {
    [ordered]@{ decision = 'approve' } | ConvertTo-Json -Compress | Write-Output
    exit 0
}

# =============================================================================
# Tool dispatch
# =============================================================================

# --------------------------------------------------------------------------
# Read: read-only; always safe regardless of path
# --------------------------------------------------------------------------
if ($toolName -eq 'Read') { Approve }

# --------------------------------------------------------------------------
# Write / Edit: single file_path parameter
# --------------------------------------------------------------------------
if ($toolName -in @('Write', 'Edit')) {
    $fp = if ($toolInput -and $toolInput.file_path) { [string]$toolInput.file_path } else { "" }
    if ($fp -and (IsWithinWorkspace $fp)) { Approve }
    exit 0   # outside workspace or unknown -> user prompt
}

# --------------------------------------------------------------------------
# PowerShell: inspect -File argument + all absolute path args
# --------------------------------------------------------------------------
if ($toolName -eq 'PowerShell') {
    $cmd = if ($toolInput -and $toolInput.command) { [string]$toolInput.command } else { "" }
    if (-not $cmd) { exit 0 }

    # Extract -File argument (handles both quoted and unquoted paths)
    $fileArg = $null
    if      ($cmd -match '(?i)-File\s+"([^"]+)"') { $fileArg = $Matches[1] }
    elseif  ($cmd -match '(?i)-File\s+(\S+)')     { $fileArg = $Matches[1] }

    # If a script file is specified, it must be inside the workspace
    if ($fileArg -and (-not (IsWithinWorkspace $fileArg))) {
        exit 0   # script outside workspace -> user prompt
    }

    # All absolute path arguments must be workspace-scoped
    if (-not (AllAbsolutePathsWithinWorkspace $cmd)) { exit 0 }

    Approve
}

# --------------------------------------------------------------------------
# Bash / executeCode: Python script execution
# --------------------------------------------------------------------------
if ($toolName -in @('Bash', 'mcp__ide__executeCode')) {
    $cmd = ""
    if ($toolInput -and $toolInput.command) { $cmd = [string]$toolInput.command }
    elseif ($toolInput -and $toolInput.code) { $cmd = [string]$toolInput.code }
    if (-not $cmd) { exit 0 }

    # Extract python / py script argument
    $scriptArg = $null
    if      ($cmd -match '(?i)(?:python3?|py)\s+"([^"]+\.py)"') { $scriptArg = $Matches[1] }
    elseif  ($cmd -match '(?i)(?:python3?|py)\s+(\S+\.py)')     { $scriptArg = $Matches[1] }

    # If a script file is specified, it must be inside the workspace
    if ($scriptArg -and (-not (IsWithinWorkspace $scriptArg))) {
        exit 0   # script outside workspace -> user prompt
    }

    # All absolute path arguments must be workspace-scoped
    if (-not (AllAbsolutePathsWithinWorkspace $cmd)) { exit 0 }

    Approve
}

# --------------------------------------------------------------------------
# All other tools: no decision
# --------------------------------------------------------------------------
exit 0
