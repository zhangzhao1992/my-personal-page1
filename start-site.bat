@echo off
cd /d "%~dp0"
set HOST=0.0.0.0
set PORT=4174
echo Personal site is starting...
echo.
echo Open on this computer:
echo   http://localhost:4174/index.html
echo.
echo Other people on the same Wi-Fi/LAN should open:
echo   http://YOUR-IPV4-ADDRESS:4174/index.html
echo.
node server.js
