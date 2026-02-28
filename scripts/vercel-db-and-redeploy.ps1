# Run database setup and redeploy after adding Neon in Vercel.
# 1. Add database: Vercel project -> Storage -> Create Database -> Neon -> Connect to instant-teacher
# 2. Run this script: .\scripts\vercel-db-and-redeploy.ps1

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
    Write-Host ""
    Write-Host "No DATABASE_URL found. Add a database first:" -ForegroundColor Yellow
    Write-Host "  1. Open: https://vercel.com/justin-kritzingers-projects/instant-teacher/stores" -ForegroundColor White
    Write-Host "  2. Click 'Create Database' or 'Add Database'" -ForegroundColor White
    Write-Host "  3. Choose Neon (Postgres), connect to this project, pick a region" -ForegroundColor White
    Write-Host "  4. Run this script again: .\scripts\vercel-db-and-redeploy.ps1" -ForegroundColor White
    Write-Host ""
    Start-Process "https://vercel.com/justin-kritzingers-projects/instant-teacher/stores"
    exit 1
}

$hasAuthSecret = $content -match 'AUTH_SECRET='
if (-not $hasAuthSecret) {
    Write-Host ""
    Write-Host "AUTH_SECRET not found in Vercel env. Admin login will fail in production." -ForegroundColor Yellow
    Write-Host "  Add it in Vercel -> Project -> Settings -> Environment Variables (e.g. run: openssl rand -base64 32)" -ForegroundColor White
    Write-Host ""
}

Write-Host "DATABASE_URL found. Running prisma db push..." -ForegroundColor Cyan
$env:DATABASE_URL = $dbUrl
npx prisma db push
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Running db:seed..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Redeploying to production..." -ForegroundColor Cyan
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Done. Login at https://instant-teacher.vercel.app/login" -ForegroundColor Green
Write-Host "  Use the admin email and password from the seed (see prisma/seed.ts or ADMIN_EMAIL/ADMIN_PASSWORD)." -ForegroundColor Gray
