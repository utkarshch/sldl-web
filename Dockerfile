# Use Node.js 20 slim image
FROM node:20-slim

# Install system dependencies required for build and sldl binary
RUN apt-get update && apt-get install -y curl unzip && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files (root and workspaces)
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
COPY shared/package.json shared/

# Install dependencies (including dev deps for build)
RUN npm ci

# Copy source code
COPY . .

# Download sldl binary using the script
RUN chmod +x railway-build.sh && ./railway-build.sh

# Clean any stale build artifacts that might confuse tsc -b
RUN rm -rf server/dist shared/dist server/tsconfig.tsbuildinfo shared/tsconfig.tsbuildinfo

# Build shared types first, then server (run directly via npx to avoid workspace resolution issues)
WORKDIR /app/shared
RUN npx tsc -b

WORKDIR /app/server
RUN npx tsc -b

# Verify output exists
RUN ls -la dist/ && test -f dist/index.js && echo "BUILD OK: dist/index.js exists"

# Expose the API port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the server (WORKDIR is already /app/server)
CMD ["node", "dist/index.js"]
