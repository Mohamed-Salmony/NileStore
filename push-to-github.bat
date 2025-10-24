@echo off
chcp 65001 >nul
echo ========================================
echo   NileStore - Push to GitHub
echo ========================================
echo.

echo [1/4] Adding files...
git add .
if errorlevel 1 (
    echo Error: Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added
echo.

echo [2/4] Creating commit...
git commit -m "feat: Initial clean setup with proper .gitignore"
if errorlevel 1 (
    echo Note: Nothing to commit or commit failed
)
echo.

echo [3/4] Checking remote...
git remote -v
echo.

echo [4/4] Pushing to GitHub...
echo Attempting normal push...
git push origin main
if errorlevel 1 (
    echo.
    echo Normal push failed. Do you want to force push? [Y/N]
    set /p choice=
    if /i "%choice%"=="Y" (
        echo Force pushing...
        git push -f origin main
        if errorlevel 1 (
            echo Error: Force push failed
            pause
            exit /b 1
        )
    ) else (
        echo Push cancelled
        pause
        exit /b 0
    )
)

echo.
echo ========================================
echo   Success! ✓
echo ========================================
echo.
echo Your repository: https://github.com/Mohamed-Salmony/NileStore
echo.
pause
