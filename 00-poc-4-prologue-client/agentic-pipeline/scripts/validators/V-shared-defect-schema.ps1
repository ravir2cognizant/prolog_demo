# V-shared-defect-schema.ps1 -- Tier-1 schema check for DEF-FE-*.md / DEF-BFF-*.md
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = ".",
    [string]$Layer = "fe"   # fe | bff | microservice | db
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-defect-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\tests\$Layer\test-results\defects"
$fail      = $false
$count     = 0

if (-not (Test-Path $folder)) {
    Write-ValidatorPass -Validator $Validator -Count 0
    exit 0
}

$files = Get-ChildItem -Path $folder -Filter "DEF-*.md" -ErrorAction SilentlyContinue
if (-not $files -or $files.Count -eq 0) {
    Write-ValidatorPass -Validator $Validator -Count 0
    exit 0
}

$required = @("id", "test-case", "owner", "severity", "location", "reporter", "date", "status")
$validOwners   = @("A-04", "A-05", "shared", "test-case-bug")
$validSeverity = @("critical", "high", "medium", "low", "info")
$validStatus   = @("open", "in-progress", "resolved", "disputed", "closed")

foreach ($f in $files) {
    $fm = Read-Frontmatter -Path $f.FullName
    if (-not (Test-RequiredFrontmatter -Frontmatter $fm -RequiredKeys $required -Path $f.FullName -Validator $Validator)) {
        $fail = $true; continue
    }
    if ($validOwners   -notcontains $fm["owner"])    { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_OWNER"    -Detail "owner='$($fm["owner"])' not in [A-04|A-05|shared|test-case-bug]"; $fail=$true; continue }
    if ($validSeverity -notcontains $fm["severity"]) { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_SEVERITY" -Detail "severity='$($fm["severity"])' not in [critical|high|medium|low|info]"; $fail=$true; continue }
    if ($validStatus   -notcontains $fm["status"])   { Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_STATUS"   -Detail "status='$($fm["status"])' not in [open|in-progress|resolved|disputed|closed]"; $fail=$true; continue }
    $count++
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $count
exit 0
