@echo off
git commit -m "Initial clean setup"
git push origin main
if errorlevel 1 (
    echo Normal push failed, trying force push...
    git push -f origin main
)
echo Done!
