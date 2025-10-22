# Multi-stage Dockerfile for FairLens
# Builds both frontend and backend in a single container

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Stage 3: Production image
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    libffi-dev \
    openssl-dev

# Install Python dependencies for PyTeal
RUN pip3 install pyteal==0.20.0

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fairlens -u 1001

# Set working directory
WORKDIR /app

# Copy backend from builder stage
COPY --from=backend-builder --chown=fairlens:nodejs /app/backend ./

# Copy frontend build from builder stage
COPY --from=frontend-builder --chown=fairlens:nodejs /app/frontend/build ./public

# Copy smart contracts
COPY --chown=fairlens:nodejs contracts/ ./contracts/

# Copy deployment scripts
COPY --chown=fairlens:nodejs scripts/ ./scripts/

# Copy environment files
COPY --chown=fairlens:nodejs env.production.example ./.env.example

# Create logs directory
RUN mkdir -p logs && chown fairlens:nodejs logs

# Switch to non-root user
USER fairlens

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server.js"]
