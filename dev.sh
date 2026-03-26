#!/bin/bash
set -e

echo "🚀 Starting CalSync dev environment..."

# Start MongoDB via Docker
echo "📦 Starting MongoDB..."
docker compose up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
until docker compose exec -T mongodb mongosh --eval "db.runCommand({ ping: 1 })" &>/dev/null; do
  sleep 1
done
echo "✅ MongoDB ready"

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
  echo "📥 Installing backend dependencies..."
  (cd backend && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "📥 Installing frontend dependencies..."
  (cd frontend && npm install)
fi

# Start backend and frontend
echo "🔧 Starting backend on :5000..."
(cd backend && npm run dev) &
BACKEND_PID=$!

echo "🎨 Starting frontend on :3000..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✅ CalSync is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   MongoDB:  mongodb://localhost:27017/calsync"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose stop; echo '🛑 Stopped'" EXIT

wait
