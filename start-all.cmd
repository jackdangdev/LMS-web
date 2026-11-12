@echo off
rem Start the EduNova API and web client with one command (npm concurrently).
rem Usage: start-all.cmd
cd /d "%~dp0"
if not exist node_modules (
  echo Installing workspace dependencies...
  call npm install --no-audit --no-fund
)
call npm run dev
if errorlevel 1 pause
