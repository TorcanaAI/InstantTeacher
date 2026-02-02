# Option B: Run this after you've set DATABASE_URL in .env (e.g. from Neon.tech)
# Creates tables and seeds the admin user (support@torcanaai.com / SouthAfrica91!)
Set-Location $PSScriptRoot\..

Write-Host "Pushing schema to database..." -ForegroundColor Cyan
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed. Make sure DATABASE_URL in .env is set to your Neon (or Postgres) connection string." -ForegroundColor Red
    exit 1
}

Write-Host "Seeding admin user..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Done. Log in at http://localhost:3000/login with support@torcanaai.com / SouthAfrica91!" -ForegroundColor Green
