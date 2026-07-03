# V-03a-tokens-schema.ps1 -- Tier-1 check for ui-style-outputs/tokens.json + tailwind.theme.json + style-system.md
param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator = "validate-tokens-schema"
$folder    = Join-Path $WorkspaceRoot "sprints\$SprintId\ui-style-outputs"
$fail      = $false

if (-not (Test-Path $folder)) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "FOLDER_MISSING" -Detail "ui-style-outputs/ not found"
    exit 1
}

# style-system.md must exist
$styleMd = Join-Path $folder "style-system.md"
if (-not (Test-Path $styleMd)) {
    Write-ValidatorError -Validator $Validator -Target $styleMd -Code "MISSING_STYLE_SYSTEM" -Detail "style-system.md is required"
    $fail = $true
}

# Either tokens.json or tokens.css must exist
$tokensJson = Join-Path $folder "tokens.json"
$tokensCss  = Join-Path $folder "tokens.css"
if (-not (Test-Path $tokensJson) -and -not (Test-Path $tokensCss)) {
    Write-ValidatorError -Validator $Validator -Target $folder -Code "MISSING_TOKENS" -Detail "neither tokens.json nor tokens.css present"
    $fail = $true
}

# Validate tokens.json shape if present
if (Test-Path $tokensJson) {
    try {
        $json = Get-Content -Path $tokensJson -Raw | ConvertFrom-Json
        $requiredCategories = @("colors", "spacing", "typography")
        foreach ($cat in $requiredCategories) {
            if (-not $json.PSObject.Properties.Name -contains $cat) {
                Write-ValidatorError -Validator $Validator -Target $tokensJson -Code "MISSING_TOKEN_CATEGORY" -Detail "tokens.json missing required category '$cat'"
                $fail = $true
            }
        }
    } catch {
        Write-ValidatorError -Validator $Validator -Target $tokensJson -Code "INVALID_JSON" -Detail "tokens.json is not valid JSON: $($_.Exception.Message)"
        $fail = $true
    }
}

# tailwind.theme.json is recommended; warn but do not fail
$tailwindTheme = Join-Path $folder "tailwind.theme.json"
if (-not (Test-Path $tailwindTheme)) {
    Write-Host "[$Validator] WARN: tailwind.theme.json not present (recommended)"
}

if ($fail) { exit 1 }
Write-ValidatorPass -Validator $Validator -Count 1
exit 0
