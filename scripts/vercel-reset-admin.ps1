# Reset admin user on the production database (create or set password).
# Run this if admin login fails. Uses DATABASE_URL from Vercel; optional ADMIN_EMAIL / ADMIN_PASSWORD.
# Example: .\scripts\vercel-reset-admin.ps1
# Or set your own: $env:ADMIN_EMAIL = "you@example.com"; $env:ADMIN_PASSWORD = "YourPassword"; .\scripts\vercel-reset-admin.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Pulling production env from Vercel..." -ForegroundColor Cyan
& npx vercel env pull .env.vercel --environment=production --yes 2>&1 | Out-Null

$content = Get-Content .env.vercel -Raw -ErrorAction SilentlyContinue
$dbUrl = $null
if ($content -match 'DATABASE_URL="([^"]+)"') { $dbUrl = $Matches[1] }
if (-not $dbUrl -and $content -match 'POSTGRES_URL="([^"]+)"') { $dbUrl = $Matches[1] }
if (-not $dbUrl -and $content -match 'DATABASE_URL=([^\r\n]+)') { $dbUrl = $Matches[1].Trim() }
if (-not $dbUrl -and $content -match 'POSTGRES_URL=([^\r\n]+)') { $dbUrl = $Matches[1].Trim() }

if (-not $dbUrl) {
    Write-Host "No DATABASE_URL in .env.vercel. Add a database in Vercel first." -ForegroundColor Red
    exit 1
}

$env:DATABASE_URL = $dbUrl
if (-not $env:ADMIN_EMAIL) { $env:ADMIN_EMAIL = "support@torcanaai.com" }
if (-not $env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD = "SouthAfrica91!" }

Write-Host "Resetting admin user (email: $env:ADMIN_EMAIL) on production DB..." -ForegroundColor Cyan
npx tsx scripts/reset-admin.ts
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Done. Log in at https://instant-teacher.vercel.app/login" -ForegroundColor Green
Write-Host "  Email: $env:ADMIN_EMAIL" -ForegroundColor Gray
Write-Host "  Password: (the one you set, or default SouthAfrica91!)" -ForegroundColor Gray
