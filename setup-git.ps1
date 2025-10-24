# ==========================================
# NileStore - Git Setup Script
# ==========================================
# هذا السكريبت يقوم بإعداد Git ورفع المشروع على GitHub
# ==========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NileStore - Git Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود Git
Write-Host "[1/6] Checking Git installation..." -ForegroundColor Yellow
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git is installed" -ForegroundColor Green
Write-Host ""

# إضافة جميع الملفات
Write-Host "[2/6] Adding files to Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Files added successfully" -ForegroundColor Green
Write-Host ""

# عرض حالة Git
Write-Host "[3/6] Git Status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# إنشاء Commit
Write-Host "[4/6] Creating commit..." -ForegroundColor Yellow
git commit -m "feat: Initial clean setup with proper .gitignore

- Added comprehensive .gitignore file
- Excluded node_modules, .env files, and build artifacts
- Clean project structure ready for deployment
- Includes Next.js client and Express server
- Supabase integration configured"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create commit" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Commit created successfully" -ForegroundColor Green
Write-Host ""

# التحقق من Remote
Write-Host "[5/6] Checking remote repository..." -ForegroundColor Yellow
$remote = git remote -v
if ($remote) {
    Write-Host "Current remote:" -ForegroundColor Cyan
    Write-Host $remote
    Write-Host ""
} else {
    Write-Host "No remote repository configured!" -ForegroundColor Yellow
    Write-Host "You can add one using:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/Mohamed-Salmony/NileStore.git" -ForegroundColor Cyan
    Write-Host ""
}

# رفع المشروع
Write-Host "[6/6] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may need to force push if you cleaned the history" -ForegroundColor Yellow
Write-Host ""
Write-Host "Choose an option:" -ForegroundColor Cyan
Write-Host "  1. Normal push (git push)" -ForegroundColor White
Write-Host "  2. Force push (git push -f) - Use if you cleaned history" -ForegroundColor White
Write-Host "  3. Skip push (I'll do it manually)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1/2/3)"

switch ($choice) {
    "1" {
        Write-Host "Pushing to origin main..." -ForegroundColor Yellow
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Pushed successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠ Push failed. You may need to use force push." -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host "Force pushing to origin main..." -ForegroundColor Yellow
        Write-Host "WARNING: This will overwrite remote history!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            git push -f origin main
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Force pushed successfully!" -ForegroundColor Green
            } else {
                Write-Host "✗ Force push failed" -ForegroundColor Red
            }
        } else {
            Write-Host "Push cancelled" -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host "Skipping push. You can push manually using:" -ForegroundColor Yellow
        Write-Host "  git push origin main" -ForegroundColor Cyan
        Write-Host "  or" -ForegroundColor Yellow
        Write-Host "  git push -f origin main" -ForegroundColor Cyan
    }
    default {
        Write-Host "Invalid choice. Skipping push." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure node_modules are deleted (optional)" -ForegroundColor White
Write-Host "  2. Verify your repository on GitHub" -ForegroundColor White
Write-Host "  3. Clone and run: npm install in client/ and server/" -ForegroundColor White
Write-Host ""
Write-Host "Repository: https://github.com/Mohamed-Salmony/NileStore" -ForegroundColor Cyan
Write-Host ""
