@echo off
if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
  start "" "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" "%~dp0portfolio.code-workspace"
  exit /b
)
if exist "%ProgramFiles%\Microsoft VS Code\Code.exe" (
  start "" "%ProgramFiles%\Microsoft VS Code\Code.exe" "%~dp0portfolio.code-workspace"
  exit /b
)
call code "%~dp0portfolio.code-workspace"
