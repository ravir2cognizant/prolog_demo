# V-shared-rc-ci-coverage.ps1 -- Every RC has at least one CI
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-rc-ci-coverage"
$rcFolder  = Join-Path $WorkspaceRoot "sprints\$SprintId\req-outputs"
$ciFolder  = Join-Path $WorkspaceRoot "sprints\$SprintId\component-inventory"
$fail      = $false

$rcFiles = Get-ChildItem -Path $rcFolder -Filter "RC-*.md" -ErrorAction SilentlyContinue
$ciFiles = Get-ChildItem -Path $ciFolder -Filter "CI-*.md" -ErrorAction SilentlyContinue

if (-not $rcFiles) { Write-ValidatorError -Validator $Validator -Target $rcFolder -Code "NO_RC_FILES" -Detail "no RC files"; exit 1 }
if (-not $ciFiles) { Write-ValidatorError -Validator $Validator -Target $ciFolder -Code "NO_CI_FILES" -Detail "no CI files"; exit 1 }

$ciRCs = [System.Collections.Generic.HashSet[string]]::new()
foreach ($f in $ciFiles) {
    $body = Get-Content -Path $f.FullName -Raw
    foreach ($m in [regex]::Matches($body, 'RC-(\d+)')) {
        [void]$ciRCs.Add("RC-" + $m.Groups[1].Value.PadLeft(3, '0'))
    }
}

foreach ($rc in $rcFiles) {
    # filename like RC-001.md
    if ($rc.BaseName -match '^(RC-\d+)') {
        $rcId = $Matches[1]
        if (-not $ciRCs.Contains($rcId)) {
            Write-ValidatorError -Validator $Validator -Target $rc.FullName -Code "RC_NO_CI" -Detail "$rcId has no CI mapping"
            $fail = $true
        }
    }
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $rcFiles.Count
exit 0
