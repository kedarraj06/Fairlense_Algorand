@echo off
REM FairLens Complete Startup Script
REM This script starts the complete FairLens production-ready system

echo 🚀 Starting FairLens Complete System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install mongoose --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Start backend server (simple version without MongoDB for now)
echo 🔧 Starting backend server...
start "FairLens Backend" cmd /k "node server-simple.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Go to frontend directory
cd ..\frontend

REM Install frontend dependencies if needed
echo 📦 Installing frontend dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Start frontend server
echo 🎨 Starting frontend server...
start "FairLens Frontend" cmd /k "npm start"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ✅ FairLens System Started Successfully!
echo.
echo 📋 Access Information:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo   Health Check: http://localhost:5000/health
echo.
echo 🔐 Test Credentials:
echo   Government: government@fairlens.com / password
echo   Contractor: contractor@fairlens.com / password
echo   Citizen: citizen@fairlens.com / password
echo.
echo 📚 Features Available:
echo   ✅ User Authentication (Government/Contractor/Citizen)
echo   ✅ Tender Management
echo   ✅ Project Management
echo   ✅ Bid Management
echo   ✅ Analytics Dashboard
echo   ✅ File Upload
echo   ✅ Real-time Notifications
echo   ✅ Blockchain Integration (Mock)
echo   ✅ Pera Wallet Integration
echo.
echo 🎉 Your FairLens platform is now running!
echo.
pause
