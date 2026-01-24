#!/bin/bash

# Start production environment
echo "🚀 Starting College Portal Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start services
echo "🏗️  Building and starting production services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run database migrations and seeding
echo "🌱 Setting up database..."
docker-compose -f docker-compose.prod.yml exec backend pnpm run seed

# Check service health
echo "🔍 Checking service health..."
echo "Database: $(docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres)"
echo "Backend: $(curl -s http://localhost:8080/health | grep -o '"status":"ok"' || echo "Not ready")"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Not ready")"

echo "✅ College Portal Production is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop: docker-compose -f docker-compose.prod.yml down"
