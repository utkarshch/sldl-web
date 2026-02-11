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

# Build the shared workspace first (types)
RUN npm run build --workspace=shared && \
    echo "✓ Shared build complete" && \
    ls -la shared/dist || echo "⚠ shared/dist not found"

# Build the server workspace
RUN npm run build --workspace=server && \
    echo "✓ Server build complete" && \
    ls -la server/dist || echo "⚠ server/dist not found" && \
    ls -la server/dist/index.js || echo "⚠ server/dist/index.js not found"


# Expose the API port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start", "--workspace=server"]
