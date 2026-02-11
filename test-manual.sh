#!/bin/bash

# SLDL Manual Test Commands
# Run these commands one by one to verify functionality

echo "SLDL Manual Testing Commands"
echo "============================"
echo ""

echo "1. TEST BINARY EXECUTION"
echo "------------------------"
echo "Command: ./sldl --version"
echo "Expected: Version number (e.g., 'sldl 2.x.x')"
echo "If 'killed': Binary still blocked - approve in System Settings"
echo ""
read -p "Press Enter to run..."
./sldl --version
echo ""

echo "2. TEST BINARY FROM NODE.JS"
echo "----------------------------"
echo "Command: cd server && node test-binary.js"
echo "Expected: ✅ SUCCESS! Binary executed correctly."
echo ""
read -p "Press Enter to run..."
cd server && node test-binary.js && cd ..
echo ""

echo "3. CHECK SERVER HEALTH"
echo "----------------------"
echo "Command: curl http://localhost:3001/api/health | jq"
echo "Expected: {status: 'ok', configured: true}"
echo ""
read -p "Press Enter to run..."
curl -s http://localhost:3001/api/health | jq
echo ""

echo "4. TEST SIMPLE SEARCH"
echo "---------------------"
echo "Command: Create download job via API"
echo "Expected: Job created with 'queued' state"
echo ""
read -p "Press Enter to run..."
JOB=$(curl -s -X POST http://localhost:3001/api/downloads \
  -H "Content-Type: application/json" \
  -d '{"input":"Pink Floyd - Comfortably Numb","inputType":"search","downloadMode":"normal","flags":{"format":"mp3"}}')
echo "$JOB" | jq
JOB_ID=$(echo "$JOB" | jq -r '.id')
echo ""
echo "Job ID: $JOB_ID"
echo ""

echo "5. CHECK JOB STATUS"
echo "-------------------"
echo "Waiting 3 seconds for job to start..."
sleep 3
echo "Command: curl http://localhost:3001/api/downloads/$JOB_ID | jq"
echo ""
curl -s "http://localhost:3001/api/downloads/$JOB_ID" | jq
echo ""

echo "6. TEST CSV UPLOAD (Web API)"
echo "----------------------------"
echo "Command: Upload test-songs.csv via API"
echo "Expected: 5 rows, columns detected"
echo ""
read -p "Press Enter to run..."
curl -s -X POST http://localhost:3001/api/upload/csv \
  -F "file=@test-songs.csv" | jq
echo ""

echo "7. TEST ALBUM DOWNLOAD FROM CSV (Direct Binary)"
echo "------------------------------------------------"
echo "Command: ./sldl test-albums.csv --album"
echo "Expected: Download complete albums for each artist"
echo "Note: Empty Title column triggers album download mode"
echo ""
read -p "Press Enter to run..."
./sldl test-albums.csv --album --artist-col Artist --album-col Album --print tracks
echo ""

echo "8. TEST SINGLE TRACK DOWNLOAD FROM CSV (Direct Binary)"
echo "-------------------------------------------------------"
echo "Command: ./sldl test-songs.csv"
echo "Expected: Download individual songs"
echo ""
read -p "Press Enter to run..."
./sldl test-songs.csv --artist-col Artist --title-col Title --album-col Album --print tracks
echo ""

echo "============================"
echo "Manual testing complete!"
echo ""
echo "Next steps:"
echo "  - Open http://localhost:5173 in browser"
echo "  - Test search in web UI"
echo "  - Test CSV upload in web UI"
echo "  - Check download directory for files"
echo ""
echo "CSV Download Tips:"
echo "  - For ALBUMS: Leave Title column empty in CSV"
echo "  - For TRACKS: Include both Artist and Title"
echo "  - Use --album flag for album downloads"
echo "  - Column names are auto-detected if standard (Artist, Title, Album, Length)"
