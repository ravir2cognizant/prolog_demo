# V-03b-ci-schema.ps1 -- Tier-1 schema check for CI-###.md (component inventory)
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-ci-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\component-inventory"
$fail      = $false
$count     = 0

if (-not (Test-Path $folder)) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "FOLDER_MISSING" -Detail "component-inventory/ not found"
    exit 1
}

$files = Get-ChildItem -Path $folder -Filter "CI-*.md" -ErrorAction SilentlyContinue
if (-not $files -or $files.Count -eq 0) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "NO_CI_FILES" -Detail "no CI-*.md present"
    exit 1
}

foreach ($f in $files) {
    $body = Get-Content -Path $f.FullName -Raw
    if ($body -notmatch 'RC-\d+') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "NO_RC_REF" -Detail "no RC-### reference in body"
        $fail = $true; continue
    }
    $headers = Read-Sections -Path $f.FullName
    # Must have a Components, States, and Accessibility section (case-insensitive substring match)
    $hasComponents    = $headers | Where-Object { $_ -match '(?i)component' }
    $hasStates        = $headers | Where-Object { $_ -match '(?i)state' }
    $hasAccessibility = $headers | Where-Object { $_ -match '(?i)accessib|a11y|wcag' }
    if (-not $hasComponents)    { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "MISSING_COMPONENTS"    -Detail "no Components section"; $fail=$true; continue }
    if (-not $hasStates)        { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "MISSING_STATES"        -Detail "no States section"; $fail=$true; continue }
    if (-not $hasAccessibility) { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "MISSING_ACCESSIBILITY" -Detail "no Accessibility section"; $fail=$true; continue }
    if ($body -match '\bTBD\b') { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "UNRESOLVED_PLACEHOLDER" -Detail "CI body contains TBD"; $fail=$true; continue }
    $count++
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $count
exit 0
