#!/bin/bash
set -e

echo "Downloading sldl binary for Linux..."
curl -L -o sldl.zip https://github.com/fiso64/slsk-batchdl/releases/download/v2.4.2/sldl_linux-x64.zip
unzip -o sldl.zip
chmod +x sldl
rm sldl.zip
echo "sldl binary ready."
