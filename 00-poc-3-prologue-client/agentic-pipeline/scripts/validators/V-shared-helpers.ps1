# V-shared-helpers.ps1 -- Shared validator helpers
# Frontmatter parser + structured error emitter used by all validate-*-schema scripts.
# Dot-source this file from a validator:
#   . "$PSScriptRoot\V-shared-helpers.ps1"

function Read-Frontmatter {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path $Path)) { return $null }
    $content = Get-Content -Path $Path -Raw
    if ($content -notmatch '(?s)^---\s*\r?\n(.*?)\r?\n---') { return $null }
    $block = $Matches[1]
    $fm = @{}
    foreach ($line in ($block -split "\r?\n")) {
        if ($line -match '^\s*([A-Za-z0-9_\-]+)\s*:\s*(.*?)\s*$') {
            $fm[$Matches[1]] = $Matches[2].Trim('"').Trim("'")
        }
    }
    return $fm
}

function Read-Sections {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path $Path)) { return @() }
    $content = Get-Content -Path $Path -Raw
    $headers = @()
    foreach ($m in [regex]::Matches($content, '(?m)^(#{1,6})\s+(.+?)\s*$')) {
        $headers += $m.Groups[2].Value.Trim()
    }
    return $headers
}

function Write-ValidatorError {
    param(
        [Parameter(Mandatory)][string]$Validator,
        [Parameter(Mandatory)][string]$Target,
        [Parameter(Mandatory)][string]$Code,
        [Parameter(Mandatory)][string]$Detail
    )
    Write-Output "VALIDATION_FAIL:${Validator}:${Code}:${Target}:${Detail}"
}

function Write-ValidatorPass {
    param(
        [Parameter(Mandatory)][string]$Validator,
        [Parameter(Mandatory)][int]$Count
    )
    Write-Output "VALIDATION_PASS:${Validator}:count=${Count}"
}

function Test-RequiredFrontmatter {
    param(
        [hashtable]$Frontmatter,
        [string[]]$RequiredKeys,
        [string]$Path,
        [string]$Validator
    )
    if (-not $Frontmatter) {
        Write-ValidatorError -Validator $Validator -Target $Path -Code "NO_FRONTMATTER" -Detail "missing --- frontmatter block"
        return $false
    }
    foreach ($k in $RequiredKeys) {
        if (-not $Frontmatter.ContainsKey($k) -or -not $Frontmatter[$k]) {
            Write-ValidatorError -Validator $Validator -Target $Path -Code "MISSING_KEY" -Detail "frontmatter key '${k}' is missing or empty"
            return $false
        }
    }
    return $true
}
