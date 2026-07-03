# V-shared-dispute-schema.ps1 -- Tier-1 schema check for DSP-*.md (defect disputes)
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = ".",
    [string]$Layer = "fe"   # fe | bff | microservice | db
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-dispute-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\tests\$Layer\test-results\disputes"
$fail      = $false
$count     = 0

if (-not (Test-Path $folder)) {
    Write-ValidatorPass -Validator $Validator -Count 0
    exit 0
}

$files = Get-ChildItem -Path $folder -Filter "DSP-*.md" -ErrorAction SilentlyContinue
if (-not $files -or $files.Count -eq 0) {
    Write-ValidatorPass -Validator $Validator -Count 0
    exit 0
}

$required = @("id", "defect-ref", "disputer", "verdict", "date")
$validVerdicts = @("not-a-defect", "test-case-incorrect", "requirement-mismatch", "valid-defect")

foreach ($f in $files) {
    $fm = Read-Frontmatter -Path $f.FullName
    if (-not (Test-RequiredFrontmatter -Frontmatter $fm -RequiredKeys $required -Path $f.FullName -Validator $Validator)) {
        $fail = $true; continue
    }
    if ($validVerdicts -notcontains $fm["verdict"]) {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_VERDICT" -Detail "verdict='$($fm["verdict"])' not in [not-a-defect|test-case-incorrect|requirement-mismatch|valid-defect]"
        $fail = $true; continue
    }
    if ($fm["defect-ref"] -notmatch '^DEF-(FE|BFF|MS|DB)-\d+') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_DEFECT_REF" -Detail "defect-ref='$($fm["defect-ref"])' does not match DEF-(FE|BFF|MS|DB)-###"
        $fail = $true; continue
    }
    $count++
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $count
exit 0
