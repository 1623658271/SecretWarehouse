# SecretWarehouse - Windows Build Script
# Usage: Run in PowerShell: .\build_windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SecretWarehouse - Windows Build Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Project root directory
$ProjectDir = $PSScriptRoot
$DistDir = Join-Path $ProjectDir "windows_dist"

# Clean old dist directory
Write-Host ""
Write-Host "[1/4] Cleaning old build artifacts..." -ForegroundColor Yellow
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
}
New-Item -ItemType Directory -Path $DistDir -Force | Out-Null

# Build frontend
Write-Host ""
Write-Host "[2/4] Building frontend..." -ForegroundColor Yellow
Set-Location $ProjectDir
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Build Tauri app
Write-Host ""
Write-Host "[3/4] Building Windows application..." -ForegroundColor Yellow
Set-Location (Join-Path $ProjectDir "src-tauri")
cargo build --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Rust build failed!" -ForegroundColor Red
    exit 1
}

# Copy build artifacts
Write-Host ""
Write-Host "[4/4] Copying build artifacts to $DistDir..." -ForegroundColor Yellow

# Copy executable
$ExePath = Join-Path $ProjectDir "src-tauri\target\release\secret-warehouse.exe"
if (Test-Path $ExePath) {
    Copy-Item $ExePath $DistDir
    Write-Host "  OK Executable: secret-warehouse.exe" -ForegroundColor Green
}

# Copy bundle packages
$BundleDir = Join-Path $ProjectDir "src-tauri\target\release\bundle"
if (Test-Path $BundleDir) {
    # MSI installer
    $MsiDir = Join-Path $BundleDir "msi"
    if (Test-Path $MsiDir) {
        Copy-Item -Recurse $MsiDir $DistDir
        Write-Host "  OK MSI installer: windows_dist\msi\" -ForegroundColor Green
    }

    # NSIS installer
    $NsisDir = Join-Path $BundleDir "nsis"
    if (Test-Path $NsisDir) {
        Copy-Item -Recurse $NsisDir $DistDir
        Write-Host "  OK NSIS installer: windows_dist\nsis\" -ForegroundColor Green
    }
}

# Copy config file
$ConfigPath = Join-Path $ProjectDir "src-tauri\tauri.conf.json"
if (Test-Path $ConfigPath) {
    Copy-Item $ConfigPath $DistDir
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Windows build complete!" -ForegroundColor Green
Write-Host "  Output directory: $DistDir" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Get-ChildItem $DistDir | Format-Table Name, Length, LastWriteTime -AutoSize
