#!/bin/bash

# Test script for iMessage Scheduler Monorepo
# Run from project root: ./gateway/scripts/test.sh
# Make sure both services are running first!

cd "$(dirname "$0")/../.."

echo "🧪 Testing iMessage Scheduler Monorepo..."
echo ""

# Test 1: Check frontend
echo "1️⃣  Testing frontend..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND" = "200" ]; then
    echo "   ✅ Frontend is running on http://localhost:3000"
else
    echo "   ❌ Frontend not responding (got $FRONTEND)"
    echo "      Run: yarn dev"
fi
echo ""

# Test 2: Check gateway
echo "2️⃣  Testing gateway..."
GATEWAY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$GATEWAY" = "200" ]; then
    echo "   ✅ Gateway is running on http://localhost:3001"
else
    echo "   ❌ Gateway not responding (got $GATEWAY)"
    echo "      Run: cd gateway && yarn dev"
fi
echo ""

# Test 3: Check Messages.app status
echo "3️⃣  Checking Messages.app..."
if [ "$GATEWAY" = "200" ]; then
    STATUS=$(curl -s http://localhost:3001/status)
    if echo "$STATUS" | grep -q '"ready":true'; then
        echo "   ✅ Messages.app is ready"
    else
        echo "   ⚠️  Messages.app may not be ready"
        echo "      Make sure Messages.app is open and signed in"
    fi
else
    echo "   ⏭️  Skipped (gateway not running)"
fi
echo ""

# Test 4: Check API endpoints
echo "4️⃣  Testing API endpoints..."
if [ "$FRONTEND" = "200" ]; then
    MESSAGES=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/messages)
    CONFIG=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/config)
    QUEUE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/queue/status)
    
    if [ "$MESSAGES" = "200" ] && [ "$CONFIG" = "200" ] && [ "$QUEUE" = "200" ]; then
        echo "   ✅ All API endpoints responding"
    else
        echo "   ⚠️  Some API endpoints may have issues"
        echo "      /api/messages: $MESSAGES"
        echo "      /api/config: $CONFIG"
        echo "      /api/queue/status: $QUEUE"
    fi
else
    echo "   ⏭️  Skipped (frontend not running)"
fi
echo ""

# Test 5: Check data directory
echo "5️⃣  Checking data directory..."
if [ -d "data" ]; then
    echo "   ✅ Data directory exists"
    if [ -f "data/messages.json" ]; then
        COUNT=$(jq '. | length' data/messages.json 2>/dev/null || echo "?")
        echo "   📊 Messages stored: $COUNT"
    fi
    if [ -f "data/config.json" ]; then
        RATE=$(jq '.messagesPerHour' data/config.json 2>/dev/null || echo "?")
        echo "   ⚙️  Messages per hour: $RATE"
    fi
else
    echo "   ⚠️  Data directory not found (will be created on first use)"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
if [ "$FRONTEND" = "200" ] && [ "$GATEWAY" = "200" ]; then
    echo "✅ System is operational!"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Schedule a test message"
    echo "3. Process the queue: curl http://localhost:3000/api/queue/process"
elif [ "$FRONTEND" = "200" ]; then
    echo "⚠️  Frontend running, but gateway is offline"
    echo "   Start gateway: cd gateway && yarn dev"
elif [ "$GATEWAY" = "200" ]; then
    echo "⚠️  Gateway running, but frontend is offline"
    echo "   Start frontend: yarn dev"
else
    echo "❌ Neither service is running"
    echo "   Start both services using the README instructions"
fi
