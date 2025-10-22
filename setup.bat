@echo off
REM FairLens Setup Script for Windows
REM This script sets up the FairLens development environment

echo 🚀 FairLens Setup Script
echo ========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Create logs directory
echo 📁 Creating logs directory...
if not exist logs mkdir logs

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Install Python dependencies
echo 🐍 Installing Python dependencies...
pip install pyteal==0.20.0 pytest
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env file with your Algorand API keys
echo 2. Start backend: cd backend ^&^& node server-simple.js
echo 3. Start frontend: cd frontend ^&^& npm start
echo 4. Deploy contract: python scripts/deploy_testnet.py
echo.
echo 📚 Read README.md for detailed instructions
pause
