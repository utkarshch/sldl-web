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

# Build the shared workspace first (types)
RUN npm run build --workspace=shared

# Build the server workspace
RUN npm run build --workspace=server

# Verify output exists
RUN echo "=== server/dist contents ===" && \
    ls -la server/dist/ && \
    test -f server/dist/index.js && \
    echo "✓ server/dist/index.js confirmed"

# Expose the API port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Run from server directory directly (bypass npm workspace resolution)
WORKDIR /app/server
CMD ["node", "dist/index.js"]
