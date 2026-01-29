#!/bin/bash

# Setup script for iMessage Scheduler Monorepo
# Run from project root: ./gateway/scripts/setup.sh

cd "$(dirname "$0")/../.."

echo "🚀 Setting up iMessage Scheduler Monorepo..."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  Warning: This application requires macOS for iMessage functionality"
    echo "   You can still run the frontend, but messages won't be sent"
    echo ""
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Error: Node.js 22.x or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
yarn install

# Install gateway dependencies
echo "📦 Installing gateway dependencies..."
cd gateway
yarn install
cd ..

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📄 Creating .env.local..."
    cp .env.example .env.local
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Monorepo Structure:"
echo "   • Frontend:  src/features/Scheduler/"
echo "   • Backend:   src/app/api/"
echo "   • Gateway:   gateway/"
echo ""
echo "🏃 To run the application:"
echo ""
echo "   Terminal 1 - Frontend + Backend (Next.js):"
echo "   $ yarn dev"
echo ""
echo "   Terminal 2 - Gateway (Express + AppleScript):"
echo "   $ cd gateway && yarn dev"
echo ""
echo "   Then open: http://localhost:3000"
echo ""
echo "⚠️  Important: Make sure Messages.app is open and signed in!"
echo ""
echo "🧪 Test the system:"
echo "   $ ./gateway/scripts/test.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
