# Push InstantTeacher to GitHub
# Run from project root: .\scripts\push-to-github.ps1

$repoUrl = Read-Host "Paste your GitHub repo URL (e.g. https://github.com/username/InstantTeacher.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "No URL entered. Exiting." -ForegroundColor Red
    exit 1
}

$repoUrl = $repoUrl.Trim()

# Add remote (ignore error if already added)
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done! Your code is on GitHub." -ForegroundColor Green
} else {
    Write-Host "Push failed. If GitHub asks for a password, use a Personal Access Token instead of your password. See PUSH-TO-GITHUB.md" -ForegroundColor Yellow
}
