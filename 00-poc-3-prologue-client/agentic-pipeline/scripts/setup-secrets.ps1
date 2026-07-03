# setup-secrets.ps1
# First-time credential and environment variable setup
# Usage: .\setup-secrets.ps1
#        .\setup-secrets.ps1 -Verify        (check existing setup)
#        .\setup-secrets.ps1 -Reset         (clear all and re-enter)

param(
    [switch]$Verify,
    [switch]$Reset
)

# ---- Helper functions -------------------------------------------------------

function Set-EnvVar {
    param([string]$Name, [string]$Value)
    [System.Environment]::SetEnvironmentVariable($Name, $Value, "User")
    Set-Item -Path "Env:\$Name" -Value $Value
    Write-Host "  [SET]  $Name" -ForegroundColor Green
}

function Test-EnvVar {
    param([string]$Name)
    $val = [System.Environment]::GetEnvironmentVariable($Name, "User")
    if ([string]::IsNullOrEmpty($val)) {
        $val = [System.Environment]::GetEnvironmentVariable($Name, "Machine")
    }
    return (-not [string]::IsNullOrEmpty($val))
}

function Get-EnvVar {
    param([string]$Name)
    $val = [System.Environment]::GetEnvironmentVariable($Name, "User")
    if ([string]::IsNullOrEmpty($val)) {
        $val = [System.Environment]::GetEnvironmentVariable($Name, "Machine")
    }
    return $val
}

# ---- Required variables -----------------------------------------------------

$requiredVars = @(
    @{
        Name        = "ANTHROPIC_API_KEY"
        Description = "Anthropic API key for Claude Code CLI"
        Hint        = "Get from: https://console.anthropic.com -- API Keys"
        Secret      = $true
        Required    = $true
    },
    @{
        Name        = "POC_WORKSPACE_ROOT"
        Description = "Absolute path to the poc-workspace folder"
        Hint        = "Example: C:\Projects\poc-workspace"
        Secret      = $false
        Required    = $true
    },
    @{
        Name        = "AZURE_DEVOPS_PAT"
        Description = "Azure DevOps Personal Access Token (optional)"
        Hint        = "Get from: Azure DevOps -- User Settings -- Personal Access Tokens"
        Secret      = $true
        Required    = $false
    },
    @{
        Name        = "GITHUB_TOKEN"
        Description = "GitHub Personal Access Token (optional)"
        Hint        = "Get from: GitHub -- Settings -- Developer Settings -- Personal Access Tokens"
        Secret      = $true
        Required    = $false
    },
    @{
        Name        = "NEXUS_TOKEN"
        Description = "Nexus Registry API token (optional)"
        Hint        = "Get from: Nexus -- Your Profile -- User Token"
        Secret      = $true
        Required    = $false
    },
    @{
        Name        = "KEY_VAULT_NAME"
        Description = "Azure Key Vault name for shared secrets (optional)"
        Hint        = "Example: kv-poc-dev"
        Secret      = $false
        Required    = $false
    }
)

# ---- Verify mode ------------------------------------------------------------

if ($Verify) {
    Write-Host ""
    Write-Host "Verifying existing setup..." -ForegroundColor White
    Write-Host ""
    $allGood = $true
    foreach ($var in $requiredVars) {
        $exists = Test-EnvVar -Name $var.Name
        if ($var.Required) {
            $tag = "[REQUIRED]"
        } else {
            $tag = "[OPTIONAL]"
        }
        if ($exists) {
            $val = Get-EnvVar -Name $var.Name
            if ($var.Secret) {
                $suffix = $val.Substring([Math]::Max(0, $val.Length - 4))
                $display = "***" + $suffix
            } else {
                $display = $val
            }
            Write-Host "  OK  $($var.Name) = $display  $tag" -ForegroundColor Green
        } else {
            if ($var.Required) {
                Write-Host "  MISSING  $($var.Name)  $tag" -ForegroundColor Red
                $allGood = $false
            } else {
                Write-Host "  NOT SET  $($var.Name)  $tag" -ForegroundColor Yellow
            }
        }
    }
    Write-Host ""
    if ($allGood) {
        Write-Host "All required variables are set." -ForegroundColor Green
    } else {
        Write-Host "Some required variables are missing." -ForegroundColor Red
        Write-Host "Run .\setup-secrets.ps1 without -Verify to set them." -ForegroundColor Yellow
    }
    Write-Host ""
    exit 0
}

# ---- Setup mode -------------------------------------------------------------

Write-Host ""
Write-Host "POC Agent Pipeline -- Credentials Setup" -ForegroundColor Cyan
Write-Host "Variables are stored as User-level environment variables." -ForegroundColor White
Write-Host "They are never written to any file." -ForegroundColor White
Write-Host ""

foreach ($var in $requiredVars) {

    if ($var.Required) {
        $tag = "(Required)"
    } else {
        $tag = "(Optional -- press Enter to skip)"
    }

    $alreadySet = Test-EnvVar -Name $var.Name

    if ($alreadySet -and -not $Reset) {
        $val = Get-EnvVar -Name $var.Name
        if ($var.Secret) {
            $suffix  = $val.Substring([Math]::Max(0, $val.Length - 4))
            $display = "***" + $suffix
        } else {
            $display = $val
        }
        Write-Host "  Already set: $($var.Name) = $display" -ForegroundColor Yellow
        $update = Read-Host "  Update? (y/N)"
        if ($update -ne "y" -and $update -ne "Y") {
            continue
        }
    }

    Write-Host ""
    Write-Host "  $($var.Name) $tag" -ForegroundColor Cyan
    Write-Host "  $($var.Description)" -ForegroundColor Gray
    Write-Host "  $($var.Hint)" -ForegroundColor DarkGray

    if ($var.Secret) {
        $secureVal = Read-Host "  Enter value" -AsSecureString
        $bstr      = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureVal)
        $plainVal  = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    } else {
        $plainVal = Read-Host "  Enter value"
    }

    if ([string]::IsNullOrWhiteSpace($plainVal)) {
        if ($var.Required) {
            Write-Host "  WARNING: This is required -- skipping for now but pipeline may fail." -ForegroundColor Red
        } else {
            Write-Host "  Skipped." -ForegroundColor Gray
        }
        continue
    }

    Set-EnvVar -Name $var.Name -Value $plainVal
}

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Cyan
Write-Host "Run .\setup-secrets.ps1 -Verify to check your configuration." -ForegroundColor Gray
Write-Host "IMPORTANT: Restart your terminal for changes to take effect." -ForegroundColor Yellow
Write-Host ""