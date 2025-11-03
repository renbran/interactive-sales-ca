# Install ngrok on Windows
# Run this: powershell -ExecutionPolicy Bypass -File install-ngrok.ps1

Write-Host "Installing ngrok for Windows..." -ForegroundColor Green
Write-Host ""

# Download URL
$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$downloadPath = "$env:TEMP\ngrok.zip"
$extractPath = "$env:LOCALAPPDATA\ngrok"
$ngrokExe = "$extractPath\ngrok.exe"

# Create directory
if (!(Test-Path $extractPath)) {
    New-Item -ItemType Directory -Path $extractPath | Out-Null
}

# Download
Write-Host "Downloading ngrok..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $downloadPath
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    exit 1
}

# Extract
Write-Host "Extracting..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    Write-Host "Extraction complete!" -ForegroundColor Green
} catch {
    Write-Host "Extraction failed: $_" -ForegroundColor Red
    exit 1
}

# Add to PATH
Write-Host "Adding to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$extractPath*") {
    $newPath = $currentPath + ";" + $extractPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Added to PATH!" -ForegroundColor Green
} else {
    Write-Host "Already in PATH!" -ForegroundColor Green
}

# Verify
Write-Host ""
Write-Host "Testing installation..." -ForegroundColor Yellow
if (Test-Path $ngrokExe) {
    & $ngrokExe version
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "NGROK INSTALLED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your terminal" -ForegroundColor White
    Write-Host "2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "3. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
    Write-Host "4. Start: ngrok http 11434" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Installation verification failed" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item $downloadPath -ErrorAction SilentlyContinue
