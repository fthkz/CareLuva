@echo off
echo Starting HTTP server on port 3000...
echo Open your browser and go to: http://localhost:3000/index.html
echo Press Ctrl+C to stop the server
echo.

REM Try different methods to start a server
echo Trying Python...
python -m http.server 3000 --bind localhost 2>nul
if %errorlevel% equ 0 goto :end

echo Python failed, trying Python3...
python3 -m http.server 3000 --bind localhost 2>nul
if %errorlevel% equ 0 goto :end

echo Python3 failed, trying Node.js...
npx http-server -p 3000 -a localhost 2>nul
if %errorlevel% equ 0 goto :end

echo Node.js failed, trying PowerShell...
powershell -ExecutionPolicy Bypass -File serve.ps1
if %errorlevel% equ 0 goto :end

echo All methods failed. Please install Python or Node.js.
echo You can also try opening the index.html file directly in your browser.
pause

:end