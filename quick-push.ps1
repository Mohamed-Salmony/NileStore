# Quick Git Push Script for NileStore
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "feat: Initial clean setup with proper .gitignore"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Attempting normal push first..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Normal push failed. Trying force push..." -ForegroundColor Yellow
    Write-Host "This will overwrite remote history!" -ForegroundColor Red
    git push -f origin main
}

Write-Host ""
Write-Host "Done! Check your repository at:" -ForegroundColor Green
Write-Host "https://github.com/Mohamed-Salmony/NileStore" -ForegroundColor Cyan
