@echo off
setlocal
title SuHeng Registration System
cd /d "%~dp0"

set "PYTHON_EXE=C:\Python\python313\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE="
if not defined PYTHON_EXE for /f "delims=" %%i in ('where python 2^>nul') do if not defined PYTHON_EXE set "PYTHON_EXE=%%i"
if not defined PYTHON_EXE for /f "delims=" %%i in ('where py 2^>nul') do if not defined PYTHON_EXE set "PYTHON_EXE=%%i"

if not defined PYTHON_EXE (
  echo Python was not found.
  pause
  exit /b 1
)

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8000'"
echo Starting SuHeng Registration System...
echo Close this window to stop the local server.
"%PYTHON_EXE%" -u -m backend.server
