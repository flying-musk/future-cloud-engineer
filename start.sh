#!/bin/bash

# Cloud Learning Tracker - Startup Script

echo "🚀 Starting Cloud Learning Tracker..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Start backend
echo "📦 Starting backend server..."
cd backend

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f ".deps_installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
fi

# Start backend in background
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers started!"
echo "📡 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:5173"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Trap Ctrl+C and cleanup
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait
wait

