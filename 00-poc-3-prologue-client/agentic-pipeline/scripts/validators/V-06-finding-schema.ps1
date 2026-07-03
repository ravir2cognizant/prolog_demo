# V-06-finding-schema.ps1 -- Tier-1 schema check for CR-*.md / CR2-*.md / CR3-*.md / AR-*.md
# Used for code-review and arch-review finding files in review-inputs/.
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = ".",
    [string]$Subfolder = "code-review"   # code-review | arch-review
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-finding-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\review-inputs\$Subfolder"
$fail      = $false
$count     = 0

if (-not (Test-Path $folder)) {
    Write-ValidatorPass -Validator $Validator -Count 0   # empty folder is acceptable
    exit 0
}

$files = Get-ChildItem -Path $folder -Filter "*.md" -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "README*" }
if (-not $files -or $files.Count -eq 0) {
    Write-ValidatorPass -Validator $Validator -Count 0
    exit 0
}

$required = @("id", "category", "owner", "severity", "location", "reviewer", "date")
$validOwners    = @("A-04", "A-05", "shared", "other", "A-06")
$validSeverity  = @("critical", "high", "medium", "low", "info")

foreach ($f in $files) {
    $fm = Read-Frontmatter -Path $f.FullName
    if (-not (Test-RequiredFrontmatter -Frontmatter $fm -RequiredKeys $required -Path $f.FullName -Validator $Validator)) {
        $fail = $true; continue
    }
    if ($validOwners -notcontains $fm["owner"]) {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_OWNER" -Detail "owner='$($fm["owner"])' not in [A-04|A-05|shared|other|A-06]"
        $fail = $true; continue
    }
    if ($validSeverity -notcontains $fm["severity"]) {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "INVALID_SEVERITY" -Detail "severity='$($fm["severity"])' not in [critical|high|medium|low|info]"
        $fail = $true; continue
    }
    $count++
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $count
exit 0
