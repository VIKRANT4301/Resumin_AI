param(
    [switch]$Reload
)

$ErrorActionPreference = "Stop"

$backendDir = Join-Path $PSScriptRoot "Backend"

if (-not (Test-Path $backendDir)) {
    throw "Backend directory not found: $backendDir"
}

Push-Location $backendDir
try {
    $arguments = @("-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000")

    if ($Reload) {
        $arguments += "--reload"
    }

    python @arguments
}
finally {
    Pop-Location
}
