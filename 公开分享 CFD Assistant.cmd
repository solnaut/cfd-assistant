@echo off
setlocal
cd /d "%~dp0"
call npm.cmd run build
if errorlevel 1 goto failed
set "NODE_USE_ENV_PROXY=1"
node scripts\share-workbench.mjs
if not errorlevel 1 exit /b 0
:failed
pause
exit /b 1
