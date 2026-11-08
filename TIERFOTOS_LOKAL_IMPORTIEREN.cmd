@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo LernSafari - Tierfotos lokal in assets\tierfotos speichern
node scripts\download-tierfotos.mjs
if errorlevel 1 (
 echo.
 echo Achtung: Nicht alle Fotos konnten geladen werden. Hinweise oben lesen.
) else (
 echo.
 echo Alle Fotos geladen. GitHub Desktop erkennt jetzt neue Bilder und geaenderte Tierdaten.
)
pause
