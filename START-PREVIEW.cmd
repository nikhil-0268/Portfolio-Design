@echo off
cd /d "%~dp0"
node preview-server.cjs
if errorlevel 1 (
 echo Preview could not start. This launcher needs Node.js installed.
 pause
)
