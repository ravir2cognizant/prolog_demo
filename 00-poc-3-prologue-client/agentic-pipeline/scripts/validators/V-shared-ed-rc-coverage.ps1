# V-shared-ed-rc-coverage.ps1 -- Every ED traces back to an RC, and every RC has at least one ED.
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-ed-rc-coverage"
$rcFolder  = Join-Path $WorkspaceRoot "sprints\$SprintId\req-outputs"
$edFolder  = Join-Path $WorkspaceRoot "sprints\$SprintId\endpoint-design"
$fail      = $false

$rcFiles = Get-ChildItem -Path $rcFolder -Filter "RC-*.md" -ErrorAction SilentlyContinue
$edFiles = Get-ChildItem -Path $edFolder -Filter "ED-*.md" -ErrorAction SilentlyContinue

if (-not $rcFiles) { Write-ValidatorError -Validator $Validator -Target $rcFolder -Code "NO_RC_FILES" -Detail "no RC files"; exit 1 }
if (-not $edFiles) { Write-ValidatorError -Validator $Validator -Target $edFolder -Code "NO_ED_FILES" -Detail "no ED files"; exit 1 }

$edRCs = [System.Collections.Generic.HashSet[string]]::new()
foreach ($f in $edFiles) {
    $body = Get-Content -Path $f.FullName -Raw
    foreach ($m in [regex]::Matches($body, 'RC-(\d+)')) {
        [void]$edRCs.Add("RC-" + $m.Groups[1].Value.PadLeft(3, '0'))
    }
}

foreach ($rc in $rcFiles) {
    if ($rc.BaseName -match '^(RC-\d+)') {
        $rcId = $Matches[1]
        if (-not $edRCs.Contains($rcId)) {
            Write-ValidatorError -Validator $Validator -Target $rc.FullName -Code "RC_NO_ED" -Detail "$rcId has no ED mapping"
            $fail = $true
        }
    }
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count $rcFiles.Count
exit 0
