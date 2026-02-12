#!/bin/bash

# Configuration
URL="${1:-https://soulseekdownload.com}"
HEALTH_ENDPOINT="$URL/api/health"

echo "🔍 Verifying deployment at: $URL"
echo "----------------------------------------"

# Check Health
echo "Testing Health Endpoint..."
# Use -L to follow redirects (307/301) and show effective URL
HTTP_RESPONSE=$(curl -sL -w "\n%{http_code}" "$HEALTH_ENDPOINT")
# Extract body (all lines except last)
HTTP_BODY=$(echo "$HTTP_RESPONSE" | sed '$d')
# Extract status (last line)
HTTP_STATUS=$(echo "$HTTP_RESPONSE" | tail -n 1)

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Health Check Failed! Status Code: $HTTP_STATUS"
    echo "Response: $HTTP_BODY"
    exit 1
fi

# Check if response is HTML (Common misconfiguration where API hits Frontend)
if echo "$HTTP_BODY" | grep -q "<!DOCTYPE html>"; then
    echo "❌ Received HTML instead of JSON!"
    echo "⚠️  You are likely targeting the Frontend URL ($URL) but it is not proxying to the Backend."
    echo "   Please set VITE_API_URL in your Vercel settings to your Railway Backend URL."
    exit 1
fi

echo "✅ Health Check Passed!"

# Parse JSON (requires jq, fallback to grep/sed if missing)
if command -v jq &> /dev/null; then
    VERSION=$(echo "$HTTP_BODY" | jq -r '.version')
    BUILD_DATE=$(echo "$HTTP_BODY" | jq -r '.buildDate')
    DB_STATUS=$(echo "$HTTP_BODY" | jq -r '.database')
else
    # Simple extraction for users without jq
    VERSION=$(echo "$HTTP_BODY" | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')
    BUILD_DATE=$(echo "$HTTP_BODY" | sed -n 's/.*"buildDate":"\([^"]*\)".*/\1/p')
    DB_STATUS=$(echo "$HTTP_BODY" | sed -n 's/.*"database":"\([^"]*\)".*/\1/p')
fi

echo "----------------------------------------"
echo "📦 Version:    $VERSION"
echo "🗓️  Build Date: $BUILD_DATE"
echo "🗄️  Database:   $DB_STATUS"
echo "----------------------------------------"

if [ "$DB_STATUS" != "connected" ]; then
    echo "❌ Database is NOT connected. Check your Supabase configuration and credentials."
else 
    echo "✅ Database is connected."
fi

echo "✅ Deployment verification complete."
