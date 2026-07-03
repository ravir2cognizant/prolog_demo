# V-shared-ci-ed-alignment.ps1 -- Cross-output alignment between CI-*.md and ED-*.md
# Detects count mismatch and missing RC pair-up.
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-ci-ed-alignment"
$ciFolder  = Join-Path $WorkspaceRoot "sprints\$SprintId\component-inventory"
$edFolder  = Join-Path $WorkspaceRoot "sprints\$SprintId\endpoint-design"
$fail      = $false

$ciFiles = Get-ChildItem -Path $ciFolder -Filter "CI-*.md" -ErrorAction SilentlyContinue
$edFiles = Get-ChildItem -Path $edFolder -Filter "ED-*.md" -ErrorAction SilentlyContinue

if (-not $ciFiles) {
    Write-ValidatorError -Validator $Validator -Target $ciFolder -Code "NO_CI_FILES" -Detail "no CI-*.md present"
    exit 1
}
if (-not $edFiles) {
    Write-ValidatorError -Validator $Validator -Target $edFolder -Code "NO_ED_FILES" -Detail "no ED-*.md present"
    exit 1
}

# Extract RC references from each side
function Get-RCRefs($file) {
    $body = Get-Content -Path $file.FullName -Raw
    $refs = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($m in [regex]::Matches($body, 'RC-(\d+)')) {
        [void]$refs.Add("RC-" + $m.Groups[1].Value.PadLeft(3, '0'))
    }
    return $refs
}

$ciRCs = [System.Collections.Generic.HashSet[string]]::new()
$edRCs = [System.Collections.Generic.HashSet[string]]::new()
foreach ($f in $ciFiles) { foreach ($r in (Get-RCRefs $f)) { [void]$ciRCs.Add($r) } }
foreach ($f in $edFiles) { foreach ($r in (Get-RCRefs $f)) { [void]$edRCs.Add($r) } }

# RCs in CI but not ED
foreach ($rc in $ciRCs) {
    if (-not $edRCs.Contains($rc)) {
        Write-ValidatorError -Validator $Validator -Target "$ciFolder" -Code "CI_RC_NO_ED" -Detail "$rc has CI but no ED"
        $fail = $true
    }
}
# RCs in ED but not CI
foreach ($rc in $edRCs) {
    if (-not $ciRCs.Contains($rc)) {
        Write-ValidatorError -Validator $Validator -Target "$edFolder" -Code "ED_RC_NO_CI" -Detail "$rc has ED but no CI"
        $fail = $true
    }
}

if ($fail) {
    Write-Output "ALIGNMENT_CONFLICT"
    exit 1
}
Write-ValidatorPass -Validator $Validator -Count ($ciRCs.Count)
exit 0
