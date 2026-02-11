#!/bin/bash
set -e

echo "🧪 SLDL End-to-End Testing Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project directory
cd "$(dirname "$0")"

# Test 1: Binary Execution
echo "📦 Test 1: Binary Execution"
echo "----------------------------"
if ./sldl --version 2>&1 | grep -q "killed"; then
  echo -e "${RED}❌ Binary is being killed by macOS!${NC}"
  echo ""
  echo "Please approve the binary in System Settings:"
  echo "  1. Open System Settings → Privacy & Security"
  echo "  2. Look for message about 'sldl' being blocked"
  echo "  3. Click 'Open Anyway'"
  echo "  4. Run this script again"
  exit 1
else
  echo -e "${GREEN}✅ Binary executes${NC}"
fi
echo ""

# Test 2: Node.js Binary Spawn
echo "📦 Test 2: Binary Execution from Node.js"
echo "-----------------------------------------"
cd server
if node test-binary.js; then
  echo -e "${GREEN}✅ Binary works from Node.js${NC}"
else
  echo -e "${RED}❌ Binary blocked in Node.js${NC}"
  exit 1
fi
cd ..
echo ""

# Test 3: Server Health
echo "🏥 Test 3: Server Health Check"
echo "-------------------------------"
# Check if server is running
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Server not running. Please start with:${NC}"
  echo "  npm run dev"
  echo ""
  echo "Then run this script again."
  exit 1
fi

HEALTH=$(curl -s http://localhost:3001/api/health)
echo "$HEALTH" | jq '.'

if echo "$HEALTH" | jq -e '.configured == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server configured${NC}"
else
  echo -e "${RED}❌ Server not configured${NC}"
  echo "Please configure Soulseek credentials in Settings"
  exit 1
fi
echo ""

# Test 4: Simple Search
echo "🔍 Test 4: Search Functionality"
echo "--------------------------------"
JOB=$(curl -s -X POST http://localhost:3001/api/downloads \
  -H "Content-Type: application/json" \
  -d '{"input":"test","inputType":"search","downloadMode":"normal","flags":{"format":"mp3"}}')
JOB_ID=$(echo "$JOB" | jq -r '.id')
echo "Created job: $JOB_ID"

# Wait for job to start
echo "Waiting for job to start..."
sleep 3

STATUS=$(curl -s "http://localhost:3001/api/downloads/$JOB_ID" | jq -r '.state')
echo "Job state: $STATUS"

if [ "$STATUS" == "failed" ]; then
  echo -e "${RED}❌ Job failed immediately!${NC}"
  echo "This likely means the binary is still blocked."
  exit 1
elif [ "$STATUS" == "running" ] || [ "$STATUS" == "completed" ]; then
  echo -e "${GREEN}✅ Job started successfully${NC}"
else
  echo -e "${YELLOW}⚠️  Job in state: $STATUS${NC}"
fi
echo ""

# Test 5: CSV Upload
echo "📄 Test 5: CSV Upload"
echo "---------------------"
if [ ! -f "test-songs.csv" ]; then
  echo -e "${RED}❌ test-songs.csv not found${NC}"
  exit 1
fi

UPLOAD=$(curl -s -X POST http://localhost:3001/api/upload/csv \
  -F "file=@test-songs.csv")
UPLOAD_ID=$(echo "$UPLOAD" | jq -r '.uploadId')
ROW_COUNT=$(echo "$UPLOAD" | jq -r '.rowCount')

if [ "$UPLOAD_ID" != "null" ] && [ "$ROW_COUNT" == "5" ]; then
  echo -e "${GREEN}✅ CSV uploaded successfully${NC}"
  echo "Upload ID: $UPLOAD_ID"
  echo "Rows: $ROW_COUNT"
else
  echo -e "${RED}❌ CSV upload failed${NC}"
  echo "$UPLOAD" | jq '.'
  exit 1
fi
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}✨ All tests passed!${NC}"
echo ""
echo "Your SLDL setup is working correctly."
echo "You can now use the web UI to search and download music."
echo ""
echo "Access the UI at: http://localhost:5173"
echo "=================================================="
