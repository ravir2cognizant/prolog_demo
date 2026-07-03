# V-ed-route-coverage.ps1 -- Tier-1 response-shape drift check for A-05 (T-005 PostCheck)
# Compares the Response Model fields declared in each ED-###.md against the actual return
# shape in app/backend/src/routes/ or app/backend/src/services/.
# Flags mismatches as ED_RESPONSE_DRIFT so that DEF-BFF-001-class bugs are caught at T0
# (hook validation) rather than at T-006 code review or T-012 test execution.
#
# Usage:
#   pwsh agentic-pipeline\scripts\validators\V-ed-route-coverage.ps1 `
#       -SprintId sprint-01 -WorkspaceRoot .
#
# Exit codes:
#   0  VALIDATION_PASS (all routes covered + no response-shape drift detected)
#   1  VALIDATION_FAIL (missing routes OR response-shape drift)

param(
    [Parameter(Mandatory)][string]$SprintId,
    [string]$WorkspaceRoot = "."
)

. "$PSScriptRoot\V-shared-helpers.ps1"

$Validator  = "ed-route-coverage"
$EDFolder   = Join-Path $WorkspaceRoot "sprints\$SprintId\endpoint-design"
$RoutesDir  = Join-Path $WorkspaceRoot "app\backend\src\routes"
$ServicesDir= Join-Path $WorkspaceRoot "app\backend\src\services"
$fail       = $false
$checked    = 0
$driftCount = 0

if (-not (Test-Path $EDFolder)) {
    Write-ValidatorError -Validator $Validator -Target $EDFolder -Code "FOLDER_MISSING" -Detail "endpoint-design/ not found"
    exit 1
}

$edFiles = Get-ChildItem -Path $EDFolder -Filter "ED-*.md" -ErrorAction SilentlyContinue
if (-not $edFiles -or $edFiles.Count -eq 0) {
    Write-ValidatorError -Validator $Validator -Target $EDFolder -Code "NO_ED_FILES" -Detail "no ED-*.md files present"
    exit 1
}

if (-not (Test-Path $RoutesDir)) {
    Write-ValidatorError -Validator $Validator -Target $RoutesDir -Code "ROUTES_DIR_MISSING" -Detail "app/backend/src/routes/ not found -- T-005 output missing"
    exit 1
}

# Collect all TypeScript source lines once for fast substring search
$allTsSource = ""
foreach ($dir in @($RoutesDir, $ServicesDir)) {
    if (Test-Path $dir) {
        Get-ChildItem -Path $dir -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\dist\\' } |
            ForEach-Object {
            $allTsSource += (Get-Content -Path $_.FullName -Raw -ErrorAction SilentlyContinue) + "`n"
        }
    }
}

foreach ($f in $edFiles) {
    $body  = Get-Content -Path $f.FullName -Raw
    $edId  = $f.BaseName   # e.g. ED-001

    # ---- Extract HTTP method + path ----
    $method = $null
    $path   = $null
    if ($body -match '\b(GET|POST|PUT|PATCH|DELETE)\b') { $method = $Matches[1] }
    if ($body -match '`(/[\w/\-{}.]+)`') { $path = $Matches[1] }
    elseif ($body -match '"(/[\w/\-{}.]+)"')  { $path = $Matches[1] }
    elseif ($body -match "(?m)^\s*Path\s*[:\|]\s*(/[\w/\-{}.]+)") { $path = $Matches[1] }
    # Markdown table format: | URL Path | /some/path |  (produced by A-02)
    elseif ($body -match "(?m)\|\s*URL Path\s*\|\s*(/[\w/\-{}.]+)") { $path = $Matches[1] }

    if (-not $method -or -not $path) {
        # Skip EDs that legitimately have no new endpoints:
        #   - status: Deferred in frontmatter, OR
        #   - explicit "No New BFF Endpoints" declaration
        if ($body -match '(?i)status:\s*Deferred' -or $body -match '(?i)No New BFF Endpoint') {
            Write-Host "[$Validator] SKIP $edId -- no endpoint (Deferred or client-side only)"
            continue
        }
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "ED_PARSE_FAIL" -Detail "could not extract method/path from $edId"
        $fail = $true; continue
    }

    # Normalise Express-style path: /accounts/:id -> route segment "accounts"
    $pathSegments = ($path -replace '\{[^}]+\}', ':param' -replace ':[^/]+', ':param').Trim('/') -split '/'
    $primarySegment = if ($pathSegments.Count -gt 0) { $pathSegments[0] } else { "" }

    # ---- Check that a route file exists referencing this path segment ----
    $routeFound = $false
    if ($primarySegment -and ($allTsSource -match [regex]::Escape($primarySegment))) {
        $routeFound = $true
    }
    # Also check for the literal path string
    if (-not $routeFound -and $path -and ($allTsSource -match [regex]::Escape($path))) {
        $routeFound = $true
    }

    if (-not $routeFound) {
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "ROUTE_NOT_FOUND" `
            -Detail "$edId declares $method $path but no matching route found in app/backend/src/"
        $fail = $true; continue
    }

    # ---- Extract Response Model fields from ED card ----
    # Look for a table section headed "Response Model" or "Response Body"
    $expectedFields = @()
    if ($body -match '(?si)(?:Response Model|Response Body)[^\n]*\n(\|[^\n]+\|\n\|[-| :]+\|\n(?:\|[^\n]+\|\n)*)') {
        $tableBlock = $Matches[1]
        foreach ($row in ($tableBlock -split "\r?\n")) {
            # Each row: | field | type | description |
            if ($row -match '^\|\s*`?([a-zA-Z][a-zA-Z0-9_]+)`?\s*\|') {
                $field = $Matches[1].Trim()
                if ($field -notin @("Field", "field", "Name", "name", "Property", "Key")) {
                    $expectedFields += $field
                }
            }
        }
    }

    # If no Response Model table found, skip drift check (ED may use prose description)
    if ($expectedFields.Count -eq 0) {
        $checked++
        continue
    }

    # ---- Check each expected field appears in source (route or service) ----
    $missingFields = @()
    foreach ($field in $expectedFields) {
        # Look for the field as a JSON key, object property, or return object key
        $pattern = "(?:""$field""|'$field'|${field}\s*[=:]|${field}:)"
        if ($allTsSource -notmatch $pattern) {
            $missingFields += $field
        }
    }

    if ($missingFields.Count -gt 0) {
        $missing = $missingFields -join ", "
        Write-Output "ED_RESPONSE_DRIFT:${edId}:$method $path expects fields [$missing] not found in app/backend/src/"
        Write-ValidatorError -Validator $Validator -Target $f.FullName -Code "ED_RESPONSE_DRIFT" `
            -Detail "$edId response shape mismatch: fields [$missing] declared in ED but absent from route/service source"
        $fail = $true
        $driftCount++
    }

    $checked++
}

if ($fail) {
    Write-Output "VALIDATION_FAIL:${Validator}:drift=${driftCount}"
    exit 1
}

Write-ValidatorPass -Validator $Validator -Count $checked
exit 0
