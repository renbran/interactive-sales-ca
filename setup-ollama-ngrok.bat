y@echo off
REM Ollama + Ngrok Setup for Windows
echo.
echo 🚀 Setting up Ollama + Ngrok for Scholarix AI Role-Play
echo ==========================================================
echo.

REM Step 1: Check Ollama
echo ✅ Step 1: Checking Ollama...
where ollama >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    ollama --version
) else (
    echo    ❌ Ollama not found!
    echo    📥 Please download from: https://ollama.ai/download/windows
    pause
    exit /b 1
)

REM Step 2: Pull recommended model
echo.
echo 📦 Step 2: Pulling llama3.1:8b model...
echo    This may take 5-10 minutes (4.7GB download)
ollama pull llama3.1:8b

REM Step 3: Test Ollama
echo.
echo 🧪 Step 3: Testing Ollama API...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Ollama is running on http://localhost:11434
) else (
    echo    ⚠️  Ollama may need a moment to start...
    timeout /t 3 /nobreak >nul
)

REM Step 4: Check Ngrok
echo.
echo 🌐 Step 4: Checking Ngrok...
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    ❌ Ngrok not installed!
    echo.
    echo    📥 Installation Options:
    echo    1. Chocolatey: choco install ngrok -y
    echo    2. Download: https://ngrok.com/download
    echo.
    echo    After installing, run this script again.
    pause
    exit /b 1
)

REM Step 5: Ngrok auth reminder
echo.
echo 🔑 Step 5: Ngrok Authentication
echo    If this is your first time:
echo    1. Sign up (free): https://dashboard.ngrok.com/signup
echo    2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken
echo    3. Run: ngrok config add-authtoken YOUR_TOKEN
echo.
set /p SKIP="Have you set up your ngrok auth token? (y/n): "
if /i "%SKIP%" NEQ "y" (
    echo.
    echo    Please complete ngrok authentication first.
    echo    Run: ngrok config add-authtoken YOUR_TOKEN
    pause
    exit /b 1
)

REM Step 6: Start ngrok
echo.
echo ==========================================================
echo 🎉 SETUP COMPLETE! Starting ngrok tunnel...
echo ==========================================================
echo.
echo 📝 IMPORTANT INSTRUCTIONS:
echo 1. Keep this window open
echo 2. Copy the HTTPS URL shown below (https://xxxx.ngrok-free.app)
echo 3. Open https://scholarix-crm.pages.dev
echo 4. Go to AI Practice ^> Setup
echo 5. Select "Ollama (Local)"
echo 6. Paste your ngrok URL
echo 7. Select model: llama3.1:8b
echo 8. Start practicing!
echo.
echo Starting ngrok on port 11434...
echo.

ngrok http 11434
