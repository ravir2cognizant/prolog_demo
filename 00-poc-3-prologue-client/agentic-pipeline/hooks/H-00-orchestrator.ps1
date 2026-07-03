# =============================================================================
# H-00-orchestrator.ps1 -- Orchestrator Hooks
# Validates workspace health. Does NOT pre-create app/ or sprints/ -- those
# are created lazily on first activation (sprints/ by start-sprint.ps1; app/
# subfolders by H-04 / H-05 on first developer activation). See lazy-creation
# rule in agentic-delivery-core-kb Section 3.1.
# =============================================================================
param(
    [string]$WorkspaceRoot = ".",
    [string]$Action        = "validate"
)

$PipelinePath = Join-Path $WorkspaceRoot "agentic-pipeline"
$manifest     = Join-Path $PipelinePath "orchestrator-manifest.md"
$auditLog     = Join-Path $PipelinePath "audit-log.md"
$notifFile    = Join-Path $PipelinePath "NOTIFICATIONS.md"

Write-Host "[A-00] Orchestrator hooks -- Action: $Action"

# 1. Validate workspace root
if (-not (Test-Path $WorkspaceRoot)) {
    Write-Host "[A-00] ERROR: Workspace root not found: $WorkspaceRoot"
    Write-Output "ERROR:MISSING_WORKSPACE"; exit 1
}

# 2. Validate agentic-pipeline/ folder exists (the only required top-level
#    folder at orchestrator-validation time -- app/ and sprints/ are lazy).
if (-not (Test-Path $PipelinePath)) {
    Write-Host "[A-00] ERROR: agentic-pipeline/ folder not found. Run workspace-setup.ps1 first."
    Write-Output "ERROR:MISSING_PIPELINE"; exit 1
}

# 3. Validate manifest
if (-not (Test-Path $manifest)) {
    Write-Host "[A-00] ERROR: orchestrator-manifest.md not found in agentic-pipeline/"
    Write-Output "ERROR:MISSING_MANIFEST"; exit 1
}

# 4. Ensure audit-log.md exists
if (-not (Test-Path $auditLog)) {
    "# Audit Log`n| Timestamp | Agent | Event Type | Detail |`n|-----------|-------|------------|--------|" |
        Set-Content $auditLog -Encoding UTF8
    Write-Host "[A-00] audit-log.md initialised"
}

# 5. Ensure NOTIFICATIONS.md exists
if (-not (Test-Path $notifFile)) {
    "# NOTIFICATIONS`n" | Set-Content $notifFile -Encoding UTF8
    Write-Host "[A-00] NOTIFICATIONS.md initialised"
}

# Note: app/ and sprints/ are intentionally NOT pre-created here.
# - sprints/ appears when start-sprint.ps1 runs (first sprint).
# - app/frontend/ appears when H-04 runs (first frontend developer activation).
# - app/backend/  appears when H-05 runs (first backend  developer activation).

Write-Host "[A-00] Workspace validated OK (infrastructure-only state is fine)"
Write-Output "PROCEED"
