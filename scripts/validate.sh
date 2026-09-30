#!/bin/bash

# Full validation script for the AI Full-Stack Starter

set -e

echo "========================================="
echo "AI Full-Stack Starter - Full Validation"
echo "========================================="
echo ""

# Validate Backend
echo "📦 Backend Validation"
echo "---"

cd backend

echo "✓ Checking with Ruff..."
ruff check . || exit 1

echo "✓ Formatting check..."
ruff format --check . || exit 1

echo "✓ Type checking with Pyright..."
pyright || exit 1

echo "✓ Running tests..."
pytest -v || exit 1

cd ..

echo ""
echo "✓ Backend validation passed!"
echo ""

# Validate Frontend
echo "📦 Frontend Validation"
echo "---"

cd frontend

echo "✓ Linting with ESLint..."
npm run lint || exit 1

echo "✓ Type checking..."
npm run type-check || exit 1

echo "✓ Running tests..."
npm run test || exit 1

echo "✓ Building..."
npm run build || exit 1

cd ..

echo ""
echo "========================================="
echo "✅ All validations passed!"
echo "========================================="
