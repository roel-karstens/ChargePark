#!/bin/bash

# Test runner script

set -e

echo "Running tests..."
echo ""

# Backend tests
echo "📦 Backend Tests"
cd backend
pytest -v --cov=app tests/
cd ..

echo ""

# Frontend tests
echo "📦 Frontend Tests"
cd frontend
npm run test
cd ..

echo ""
echo "✅ All tests passed!"
