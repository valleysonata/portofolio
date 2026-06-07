@echo off
REM Cloudflare Worker Deployment Script for Windows
REM This script will deploy your Raka Agent backend proxy

echo ========================================
echo Raka Agent - Cloudflare Worker Deploy
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found
echo.

REM Check if Wrangler is installed
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Wrangler CLI...
    call npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Wrangler
        pause
        exit /b 1
    )
)

echo Wrangler found
echo.

REM Login to Cloudflare
echo Step 1: Login to Cloudflare
echo A browser window will open. Login and authorize.
echo.
call wrangler login
if %errorlevel% neq 0 (
    echo ERROR: Login failed
    pause
    exit /b 1
)

echo.
echo Step 2: Set API Key as Secret
echo You'll be prompted to enter your Groq API key.
echo Get one at: https://console.groq.com
echo.
call wrangler secret put GROQ_API_KEY
if %errorlevel% neq 0 (
    echo ERROR: Failed to set secret
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying Worker...
echo.
call wrangler deploy
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo Your Worker URL is shown above.
echo It looks like: https://raka-agent-proxy.YOUR_SUBDOMAIN.workers.dev
echo.
echo NEXT STEPS:
echo 1. Copy your Worker URL
echo 2. Open js\config.js in your portfolio
echo 3. Replace YOUR_SUBDOMAIN with your actual subdomain
echo 4. Save the file
echo 5. Commit and push to GitHub
echo.
pause
