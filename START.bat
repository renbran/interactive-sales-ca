@echo off
echo.
echo ========================================
echo OLLAMA + NGROK - FINAL SETUP
echo ========================================
echo.
echo Current Status:
echo [X] Ollama installed (v0.12.6)
echo [X] Model ready: llama3.2:3b (2GB)
echo [X] Model tested: Working perfectly!
echo [X] App deployed: scholarix-crm.pages.dev
echo [ ] Ngrok: Need manual download
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Download ngrok:
echo    https://ngrok.com/download
echo.
echo 2. Extract ngrok.exe to this folder:
echo    D:\odoolocal\interactive-sales-ca\
echo.
echo 3. Then run this command again!
echo.
pause

REM Check if ngrok exists
where ngrok >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo NGROK FOUND! Let's set it up...
    echo ========================================
    echo.
    
    REM Check if auth token is configured
    echo Step 1: Get your auth token
    echo.
    echo Sign up (free): https://dashboard.ngrok.com/signup
    echo Get token: https://dashboard.ngrok.com/get-started/your-authtoken
    echo.
    set /p TOKEN="Paste your ngrok auth token here: "
    
    if not "%TOKEN%"=="" (
        echo.
        echo Configuring ngrok...
        ngrok config add-authtoken %TOKEN%
        echo.
        echo ========================================
        echo SETUP COMPLETE! Starting tunnel...
        echo ========================================
        echo.
        echo COPY THE URL BELOW:
        echo Look for: https://xxxx.ngrok-free.app
        echo.
        echo Then:
        echo 1. Open https://scholarix-crm.pages.dev
        echo 2. Click "AI Practice"
        echo 3. Setup tab - Select "Ollama"
        echo 4. Paste the ngrok URL
        echo 5. Select model: llama3.2:3b
        echo 6. Start training!
        echo.
        echo ========================================
        echo Starting ngrok now...
        echo ========================================
        echo.
        
        ngrok http 11434
    ) else (
        echo No token provided. Please run this script again.
    )
) else (
    echo.
    echo Ngrok not found yet.
    echo Please complete steps 1-2 above first!
    echo.
)

pause
