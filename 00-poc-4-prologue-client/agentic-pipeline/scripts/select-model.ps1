# select-model.ps1 -- Pick the model tier for a sub-agent spawn.
#
# Invoked by A-00 before issuing a Task() / sub-agent spawn. Returns the model
# name to use. For foreground mode-switch activations, A-00 does NOT call this
# script -- mode-switch inherits the session model unconditionally.
#
# Rules (TWO total; adding a third requires an ADR):
#   1. Read the agent's declared `model:` from agentic-pipeline/agents/CLAUDE-A-<id>-<fullname>.md.
#      The activation file's "## Default model tier" section names the declared tier.
#   2. Dynamic override: if AgentId is A-04 or A-05 AND ReworkCycle >= 2, force `opus`.
#      Rationale: second-pass rework hunts subtle bugs that benefit from stronger reasoning.
#
# Anti-rule (do NOT add): "validator-fail loop", "input-size threshold for A-01", etc.
# A-01's large-input case is already handled by its declared `opus` tier -- the Case C
# spawn already happens; no override needed. Adding more rules slides into Path A by
# accretion (see R3 SRP discussion).
#
# Usage:
#   pwsh agentic-pipeline\scripts\select-model.ps1 -AgentId A-04 -ReworkCycle 2
#   -> opus
#
#   pwsh agentic-pipeline\scripts\select-model.ps1 -AgentId A-02 -ReworkCycle 0
#   -> sonnet
#
# Audit: every invocation appends a row to agentic-pipeline/audit-log.md via
# manifest-writer.ps1 so the velocity report can attribute cost spikes to specific
# overrides.

param(
    [Parameter(Mandatory)][string]$AgentId,
    [int]$ReworkCycle      = 0,
    [string]$SprintId      = "",
    [string]$WorkspaceRoot = ".",
    [switch]$NoAudit
)

$PipelinePath  = Join-Path $WorkspaceRoot "agentic-pipeline"
$AgentsFolder  = Join-Path $PipelinePath  "agents"

# Activation files now use the pattern CLAUDE-<AgentId>-<fullname>.md (e.g. CLAUDE-A-04-frontend-developer.md).
# Resolve by glob since fullname varies per agent.
$ActivationFile = Get-ChildItem -Path $AgentsFolder -Filter "CLAUDE-$AgentId-*.md" -File -ErrorAction SilentlyContinue |
                  Select-Object -First 1 -ExpandProperty FullName
if (-not $ActivationFile) {
    Write-Error "[select-model] Activation file not found for AgentId='$AgentId' in $AgentsFolder (looked for CLAUDE-$AgentId-*.md)"
    exit 1
}

# Rule 1: read declared tier from the activation file
$content = Get-Content -Path $ActivationFile -Raw
$declared = "sonnet"   # safe default if section is missing
if ($content -match '(?ms)##\s+Default model tier.*?-\s+Declared model:\s*`?(haiku|sonnet|opus)`?') {
    $declared = $Matches[1].ToLower()
}

$selected = $declared
$reason   = "declared"

# Rule 2: rework escalation
if ($AgentId -in @("A-04","A-05") -and $ReworkCycle -ge 2) {
    $selected = "opus"
    $reason   = "override:rework-cycle-escalation (cycle=$ReworkCycle)"
}

# Audit trail (dot-source manifest-writer.ps1 in-process; no cross-shell invocation)
if (-not $NoAudit) {
    $writer = Join-Path $PipelinePath "scripts\manifest-writer.ps1"
    if (Test-Path $writer) {
        try {
            . $writer -Action "" -WorkspaceRoot $WorkspaceRoot   # dot-source defines helpers, no-op dispatch
            $sprintTag = if ($SprintId) { " sprint=$SprintId" } else { "" }
            $detail    = "AgentId=$AgentId model=$selected reason=$reason reworkCycle=$ReworkCycle$sprintTag"
            Append-AuditLog -Agent "A-00" -EventType "model-selection" -Detail $detail
        } catch {
            # Audit failure should not block model selection
            Write-Host "[select-model] audit write failed (non-fatal): $($_.Exception.Message)"
        }
    }
}

# Emit the selection in two forms:
# - stdout: machine-readable for A-00 to capture
# - host:   human-readable for live transcripts
Write-Host "[select-model] $AgentId -> $selected ($reason)"
Write-Output $selected
