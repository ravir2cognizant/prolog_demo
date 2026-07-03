# V-01-rc-schema.ps1 -- Tier-1 schema check for RC-###.md
# Runs after A-01 reports complete. Exits 0 (pass) or 1 (fail).

param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-rc-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\req-outputs"
$fail      = $false
$count     = 0

if (-not (Test-Path $folder)) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "FOLDER_MISSING" -Detail "req-outputs/ not found"
    exit 1
}

$files = Get-ChildItem -Path $folder -Filter "RC-*.md" -ErrorAction SilentlyContinue
if (-not $files -or $files.Count -eq 0) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "NO_RC_FILES" -Detail "no RC-*.md present"
    exit 1
}

$required = @("id", "title", "version", "status")

foreach ($f in $files) {
    $fm = Read-Frontmatter -Path $f.FullName
    if (-not (Test-RequiredFrontmatter -Frontmatter $fm -RequiredKeys $required -Path $f.FullName -Validator $Validator)) {
        $fail = $true
        continue
    }
    $body = Get-Content -Path $f.FullName -Raw
    if ($body -match '\bTBD\b' -or $body -match '\bTODO\b') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "UNRESOLVED_PLACEHOLDER" -Detail "RC body contains TBD/TODO"
        $fail = $true
        continue
    }
    $headers = Read-Sections -Path $f.FullName
    $hasAC = $headers | Where-Object { $_ -match '^Acceptance\s+criteria' -or $_ -match '^Acceptance$' }
    if (-not $hasAC) {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "MISSING_AC" -Detail "no 'Acceptance criteria' section"
        $fail = $true
        continue
    }
    $count++
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $count
exit 0
