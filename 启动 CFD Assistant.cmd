@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-workbench.ps1"
if not errorlevel 1 exit /b 0
pause
exit /b 1
