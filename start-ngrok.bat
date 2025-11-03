@echo off
echo ========================================
echo SCHOLARIX GLOBAL - OLLAMA + NGROK SETUP
echo AI + Odoo ERP Consultancy CRM
echo ========================================
echo.
echo Configuring ngrok with your auth token...
echo.

REM Create ngrok config directory
if not exist "%USERPROFILE%\.ngrok2" mkdir "%USERPROFILE%\.ngrok2"

REM Write config file
echo authtoken: 2yW4avNV1VWCb8F9tW9sRHCFDaw_64fRufxBfEB9aVNPGpAWR > "%USERPROFILE%\.ngrok2\ngrok.yml"
echo version: 2 >> "%USERPROFILE%\.ngrok2\ngrok.yml"

echo Token configured successfully!
echo.
echo ========================================
echo STARTING NGROK TUNNEL
echo ========================================
echo.
echo This will expose Ollama to the cloud at:
echo Port: 11434 (Ollama API)
echo.
echo COPY THE HTTPS URL THAT APPEARS BELOW!
echo.
pause

powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location ''%CD%''; ./ngrok.exe http 11434' -Verb RunAs"
