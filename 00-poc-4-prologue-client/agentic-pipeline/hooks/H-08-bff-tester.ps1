# H-08-bff-tester.ps1 -- BFF Test Agent
#
# T-010 (Test Plan): hash RC + ED; output -> tests/bff/test-cases/.input-hash
# T-012 (Test Exec): hash app/backend + test-cases vs .signoff-hash; PROCEED on drift
# T-014 (Re-exec):   same logic as T-012 -- PROCEED on hash drift from .signoff-hash
# -CommitSignoff:    write .signoff-hash with current hash (called by A-00 after PASS verdict)
#
# Sign-off currency rule (D-034):
#   After A-08 reports verdict=PASS, A-00 invokes this hook with -CommitSignoff to record
#   the app/backend + test-cases hash that the sign-off is valid against. On any subsequent
#   re-trigger (after A-05 completion, T-007 rework, etc.), the hook compares current state
#   to .signoff-hash. NO_CHANGE means sign-off is still current; PROCEED means re-test needed.
param(
    [string]$SprintId      = "sprint-01",
    [string]$TaskId        = "T-010",
    [string]$WorkspaceRoot = ".",
    [switch]$CommitSignoff,
    [switch]$PostCheck
)

$AgentId         = "A-08"
$SprintsPath     = Join-Path $WorkspaceRoot "sprints"
$PipelinePath    = Join-Path $WorkspaceRoot "agentic-pipeline"
$AppPath         = Join-Path $WorkspaceRoot "app"
$RCFolder        = Join-Path $SprintsPath  "$SprintId\req-outputs"
$EDFolder        = Join-Path $SprintsPath  "$SprintId\endpoint-design"
$BEAppFolder     = Join-Path $AppPath      "backend"
$TestCasesFolder = Join-Path $SprintsPath  "$SprintId\tests\bff\test-cases"
$TestResultsFolder = Join-Path $SprintsPath "$SprintId\tests\bff\test-results"
$DefectsFolder   = Join-Path $TestResultsFolder "defects"
$DisputesFolder  = Join-Path $TestResultsFolder "disputes"
$SignoffHashFile = Join-Path $TestResultsFolder ".signoff-hash"
$Manifest        = Join-Path $PipelinePath "orchestrator-manifest.md"

Write-Host "[$AgentId] Hooks -- Task: $TaskId Sprint: $SprintId$(if ($CommitSignoff) { ' -CommitSignoff' })$(if ($PostCheck) { ' -PostCheck' })"

# -PostCheck: invoke A-08's declared Tier-1 validators after the agent reports complete.
# Called by A-00 before marking the task [x]. Returns VALIDATION_PASS / VALIDATION_FAIL.
# Validates the defect + dispute schemas under tests/bff/test-results/.
if ($PostCheck) {
    $ValidatorsRoot = Join-Path $WorkspaceRoot "agentic-pipeline\scripts\validators"
    $v1 = Join-Path $ValidatorsRoot "V-shared-defect-schema.ps1"
    $v2 = Join-Path $ValidatorsRoot "V-shared-dispute-schema.ps1"
    & $v1 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot -Layer bff
    $exit1 = $LASTEXITCODE
    & $v2 -SprintId $SprintId -WorkspaceRoot $WorkspaceRoot -Layer bff
    $exit2 = $LASTEXITCODE
    if ($exit1 -eq 0 -and $exit2 -eq 0) { Write-Output "VALIDATION_PASS"; exit 0 }
    Write-Output "VALIDATION_FAIL"; exit 1
}

foreach ($dir in @($TestCasesFolder, $TestResultsFolder, $DefectsFolder, $DisputesFolder)) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

# Compute the execution-phase input hash (app/backend + test-cases).
# Returns empty string when no files are present (defensive; .signoff-hash on an
# empty workspace is a valid state during pipeline bootstrap).
function Get-ExecutionHash {
    $tcFiles = @(Get-ChildItem -Path $TestCasesFolder -Filter "TC-BFF-*.md" -ErrorAction SilentlyContinue)
    $beFiles = @(Get-ChildItem -Path $BEAppFolder -File -Recurse -ErrorAction SilentlyContinue |
                 Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\dist\\' } |
                 Sort-Object FullName)
    $all = @($tcFiles) + @($beFiles) | Where-Object { $_ -ne $null } | Sort-Object FullName
    if ($all.Count -eq 0) { return "" }
    $parts = @(foreach ($f in $all) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash })
    return [string]::Join("|", $parts)
}

# Null-safe trim helper.
function Trim-Safe([object]$s) { if ($null -eq $s) { return "" } else { return $s.ToString().Trim() } }

# -CommitSignoff: write .signoff-hash with current execution-phase hash, then exit.
# Called by A-00 after A-08 reports verdict=PASS.
if ($CommitSignoff) {
    $combined = Get-ExecutionHash
    Set-Content -Path $SignoffHashFile -Value $combined -Encoding ascii -NoNewline
    Write-Host "[$AgentId] SIGNOFF_COMMITTED -- hash written to .signoff-hash"
    Write-Output "SIGNOFF_COMMITTED"
    Write-Output "SIGNOFF_HASH_FILE:$SignoffHashFile"
    exit 0
}

$mc = Get-Content -Path $Manifest -Raw -ErrorAction SilentlyContinue

switch ($TaskId) {
    "T-010" {
        if ($mc -notmatch "T-GATE.*\[x\]") { Write-Output "BLOCKED:GATE_NOT_OPEN"; exit 1 }
        $rcFiles = Get-ChildItem -Path $RCFolder -Filter "RC-*.md" -ErrorAction SilentlyContinue
        $edFiles = Get-ChildItem -Path $EDFolder -Filter "ED-*.md" -ErrorAction SilentlyContinue
        if (-not $rcFiles) { Write-Output "BLOCKED:MISSING_RC"; exit 1 }
        # ED may not exist yet if running parallel with T-002 -- accept either way
        $all = @($rcFiles) + @($edFiles) | Where-Object { $_ -ne $null } | Sort-Object FullName
        $parts = foreach ($f in $all) { (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash }
        $combined = [string]::Join("|", $parts)
        $HashFile = Join-Path $TestCasesFolder ".input-hash"
        if (Test-Path $HashFile) {
            $stored = Get-Content -Path $HashFile -Raw
            if ((Trim-Safe $combined) -eq (Trim-Safe $stored)) { Write-Output "NO_CHANGE"; exit 0 }
        }
        Write-Output "PROCEED"
        Write-Output "RC_PATH:$RCFolder"
        Write-Output "ED_PATH:$EDFolder"
        Write-Output "OUTPUT_PATH:$TestCasesFolder"
        exit 0
    }
    "T-012" {
        if ($mc -notmatch "T-006.*\[x\]") { Write-Output "BLOCKED:T-006_NOT_COMPLETE"; exit 1 }
        if ($mc -notmatch "T-005.*\[x\]") { Write-Output "BLOCKED:T-005_NOT_COMPLETE"; exit 1 }
        $tcFiles = Get-ChildItem -Path $TestCasesFolder -Filter "TC-BFF-*.md" -ErrorAction SilentlyContinue
        if (-not $tcFiles) { Write-Output "BLOCKED:MISSING_TEST_CASES"; exit 1 }
        $combined = Get-ExecutionHash
        # Compare against .signoff-hash if present (D-034 sign-off currency).
        # Fallback to legacy .input-hash for first-time runs.
        $compareFile = if (Test-Path $SignoffHashFile) { $SignoffHashFile } else { Join-Path $TestResultsFolder ".input-hash" }
        if (Test-Path $compareFile) {
            $stored = Get-Content -Path $compareFile -Raw
            if ((Trim-Safe $combined) -eq (Trim-Safe $stored)) { Write-Output "NO_CHANGE"; exit 0 }
        }
        Write-Output "PROCEED"
        Write-Output "TEST_CASES_PATH:$TestCasesFolder"
        Write-Output "BE_APP_PATH:$BEAppFolder"
        Write-Output "OUTPUT_PATH:$TestResultsFolder"
        Write-Output "DEFECTS_PATH:$DefectsFolder"
        Write-Output "DISPUTES_PATH:$DisputesFolder"
        exit 0
    }
    "T-014" {
        # Re-execution -- generalised per D-034. Fires whenever .signoff-hash diverges
        # from current state, regardless of which event caused divergence (T-007 rework,
        # T-007b iterative rework, mid-sprint code change, new RC, etc.).
        $combined = Get-ExecutionHash
        if (Test-Path $SignoffHashFile) {
            $stored = Get-Content -Path $SignoffHashFile -Raw
            if ((Trim-Safe $combined) -eq (Trim-Safe $stored)) {
                Write-Output "NO_CHANGE"
                Write-Output "REASON:signoff-hash-current"
                exit 0
            }
        } else {
            # No prior sign-off -- T-014 should not have fired. Treat as misroute.
            Write-Output "BLOCKED:NO_PRIOR_SIGNOFF"
            exit 1
        }
        Write-Output "PROCEED"
        Write-Output "REASON:signoff-hash-stale"
        Write-Output "TEST_CASES_PATH:$TestCasesFolder"
        Write-Output "BE_APP_PATH:$BEAppFolder"
        Write-Output "OUTPUT_PATH:$TestResultsFolder"
        Write-Output "DEFECTS_PATH:$DefectsFolder"
        Write-Output "DISPUTES_PATH:$DisputesFolder"
        exit 0
    }
    default {
        Write-Output "BLOCKED:UNKNOWN_TASK_ID"
        exit 1
    }
}
