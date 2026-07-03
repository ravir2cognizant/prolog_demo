# V-02-ed-schema.ps1 -- Tier-1 schema check for ED-###.md
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-ed-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\endpoint-design"
$fail      = $false
$count     = 0

if (-not (Test-Path $folder)) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "FOLDER_MISSING" -Detail "endpoint-design/ not found"
    exit 1
}

$files = Get-ChildItem -Path $folder -Filter "ED-*.md" -ErrorAction SilentlyContinue
if (-not $files -or $files.Count -eq 0) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "NO_ED_FILES" -Detail "no ED-*.md present"
    exit 1
}

foreach ($f in $files) {
    $body = Get-Content -Path $f.FullName -Raw

    # Must reference a parent RC
    if ($body -notmatch 'RC-\d+') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "NO_RC_REF" -Detail "no RC-### reference in body"
        $fail = $true; continue
    }
    # Must declare HTTP method
    if ($body -notmatch '\b(GET|POST|PUT|PATCH|DELETE)\b') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "NO_HTTP_METHOD" -Detail "no HTTP method declared"
        $fail = $true; continue
    }
    # Must declare URL path
    if ($body -notmatch '/[a-z][\w/\-{}.]*') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "NO_URL_PATH" -Detail "no URL path declared"
        $fail = $true; continue
    }
    # No TBD
    if ($body -match '\bTBD\b' -or $body -match '\bTODO\b') {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "UNRESOLVED_PLACEHOLDER" -Detail "ED body contains TBD/TODO"
        $fail = $true; continue
    }
    $count++
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $count
exit 0
