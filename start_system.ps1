$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$hostUrl = "http://127.0.0.1:8000"
$pythonCandidates = @(
  "C:\Python\python313\python.exe",
  (Get-Command py.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
  (Get-Command python.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue)
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

if (-not $pythonCandidates) {
  Write-Host "Python executable was not found." -ForegroundColor Red
  exit 1
}

$pythonExe = $pythonCandidates[0]
$listener = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
  Write-Host "Starting local server with $pythonExe ..." -ForegroundColor Cyan
  Start-Process -FilePath $pythonExe -ArgumentList "-u", "-m", "backend.server" -WorkingDirectory $projectDir

  $deadline = (Get-Date).AddSeconds(20)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri "$hostUrl/api/health" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        break
      }
    } catch {
    }
    Start-Sleep -Milliseconds 500
  }
}

try {
  $response = Invoke-WebRequest -Uri "$hostUrl/api/health" -UseBasicParsing -TimeoutSec 2
  if ($response.StatusCode -ne 200) {
    throw "Health check returned $($response.StatusCode)"
  }
} catch {
  Write-Host "Server did not become healthy. Check the Python window for details." -ForegroundColor Red
  exit 1
}

try {
  Start-Process $hostUrl | Out-Null
} catch {
}

Write-Host "SuHeng Registration System is available at $hostUrl" -ForegroundColor Green
