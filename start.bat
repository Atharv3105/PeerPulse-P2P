@echo off
title PeerPulse v2.0 - Full Platform Runner
echo ========================================================
echo   Starting PeerPulse P2P Platform (All 3 Services)
echo   1. Python ACIE Engine (Port 8001)
echo   2. Node.js Backend Gateway (Port 3001)
echo   3. React Vite Frontend (Port 5173)
echo ========================================================
echo.

if not exist node_modules (
    echo [Setup] Installing root runner dependencies...
    call npm install
)

echo [Launch] Starting ACIE, Backend, and Frontend concurrently...
npm start
