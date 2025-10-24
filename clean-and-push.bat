@echo off
chcp 65001 >nul
echo ========================================
echo   Cleaning Git History and Pushing
echo ========================================
echo.

echo [1/6] Removing old .git folder...
rmdir /s /q .git
echo Done!
echo.

echo [2/6] Initializing new Git repository...
git init
git branch -M main
echo Done!
echo.

echo [3/6] Adding remote...
git remote add origin https://github.com/Mohamed-Salmony/NileStore.git
echo Done!
echo.

echo [4/6] Adding all files...
git add .
echo Done!
echo.

echo [5/6] Creating first commit...
git commit -m "Initial commit: Clean NileStore project"
echo Done!
echo.

echo [6/6] Force pushing to GitHub...
git push -f origin main
echo.

if errorlevel 1 (
    echo ========================================
    echo   Push Failed!
    echo ========================================
    pause
    exit /b 1
) else (
    echo ========================================
    echo   Success! Project uploaded to GitHub
    echo ========================================
    echo.
    echo Repository: https://github.com/Mohamed-Salmony/NileStore
    echo.
    pause
)
