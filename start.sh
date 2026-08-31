#!/usr/bin/env bash
echo "========================================================"
echo "  Starting PeerPulse P2P Platform (All 3 Services)"
echo "  1. Python ACIE Engine (Port 8000)"
echo "  2. Node.js Backend Gateway (Port 3001)"
echo "  3. React Vite Frontend (Port 5173)"
echo "========================================================"

if [ ! -d "node_modules" ]; then
    echo "[Setup] Installing root runner dependencies..."
    npm install
fi

echo "[Launch] Starting ACIE, Backend, and Frontend concurrently..."
npm start
