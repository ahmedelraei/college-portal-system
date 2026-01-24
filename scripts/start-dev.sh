#!/bin/bash

# Start development environment
echo "🚀 Starting College Portal Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
echo "Database: $(docker-compose exec -T postgres pg_isready -U postgres)"
echo "Backend: $(curl -s http://localhost:8080/health | grep -o '"status":"ok"' || echo "Not ready")"
echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Not ready")"

echo "✅ College Portal is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🗄️  Database: localhost:5432"
echo ""
echo "Demo accounts:"
echo "👨‍🎓 Student: STU001 / password123"
echo "👨‍💼 Admin: ADM001 / admin123"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
