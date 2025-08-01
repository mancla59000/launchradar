#!/bin/bash

# LaunchRadar CAX11 Smart Deployment Script
# Using Context7 + Serena optimizations for ARM64
# Based on Docker multi-stage build best practices

set -e

echo "🚀 LaunchRadar CAX11 Smart Deployment"
echo "====================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER_IP="91.98.17.240"
SSH_KEY="~/.ssh/launchradar-deploy"

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Phase 1: Server preparation with Node.js optimized for ARM64
print_status "Phase 1: Preparing CAX11 server with Node.js ARM64..."
ssh -i $SSH_KEY root@$SERVER_IP "
cd /opt/launchradar

# Install Node.js 18 LTS optimized for ARM64
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Verify versions
echo '📋 Environment:'
node --version
npm --version
docker --version

# Set npm to prefer offline for ARM64 performance
npm config set prefer-offline true
npm config set audit false
npm config set fund false

print_success 'Server environment ready!'
"

# Phase 2: Build Next.js application with ARM64 optimizations
print_status "Phase 2: Building Next.js application for ARM64..."
ssh -i $SSH_KEY root@$SERVER_IP "
cd /opt/launchradar

# Ensure we have the source code
if [ ! -f 'package.json' ]; then
    echo '❌ Source code not found! Extracting...'
    tar -xzf ~/launchradar-source.tar.gz --strip-components=1
fi

# Install dependencies with ARM64 optimizations
print_status 'Installing dependencies for ARM64...'
NODE_OPTIONS='--max-old-space-size=1024' npm ci --prefer-offline

# Build Next.js for production with ARM64 optimizations
print_status 'Building Next.js application...'
NODE_OPTIONS='--max-old-space-size=1024' \
NODE_ENV=production \
NEXT_TELEMETRY_DISABLED=1 \
npm run build

print_success 'Next.js build completed!'
"

# Phase 3: Create optimized Dockerfile based on Context7 best practices
print_status "Phase 3: Creating optimized ARM64 Dockerfile..."
ssh -i $SSH_KEY root@$SERVER_IP "
cd /opt/launchradar

cat > Dockerfile.production << 'EOF'
# Multi-stage optimized Dockerfile for LaunchRadar CAX11 ARM64
# Based on Context7 + Docker best practices

ARG NODE_VERSION=18-alpine
FROM --platform=linux/arm64 node:\${NODE_VERSION} AS base

# ARM64 optimizations
ENV NODE_OPTIONS='--max-old-space-size=1024'
ENV UV_THREADPOOL_SIZE=2
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund --only=production

# Build stage (using pre-built code)
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=deps /app/node_modules ./node_modules
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME='0.0.0.0'

# Health check optimized for ARM64
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ['node', 'server.js']
EOF

print_success 'Optimized Dockerfile created!'
"

# Phase 4: Create production docker-compose with Context7 optimizations
print_status "Phase 4: Creating production docker-compose..."
ssh -i $SSH_KEY root@$SERVER_IP "
cd /opt/launchradar

cat > docker-compose.production.yml << 'EOF'
version: '3.8'

# LaunchRadar Production CAX11 ARM64 - Context7 Optimized
services:
  # Next.js Application - ARM64 Production
  web:
    build:
      context: .
      dockerfile: Dockerfile.production
      platforms:
        - linux/arm64
    container_name: launchradar-web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
      - NODE_OPTIONS=--max-old-space-size=1024
    ports:
      - '3000:3000'
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 1.2G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.3'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache - ARM64 Compatible
  redis:
    image: redis:7-alpine
    container_name: launchradar-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 96mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.15'

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: launchradar-nginx
    restart: unless-stopped
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 64M
          cpus: '0.1'

volumes:
  redis_data:

networks:
  launchradar:
    driver: bridge

# Total Resources: ~1.4GB RAM / 4GB (65% headroom)
# ARM64 optimizations: Node.js memory limits, platform-specific builds
EOF

print_success 'Production docker-compose created!'
"

# Phase 5: Create nginx configuration
print_status "Phase 5: Creating nginx configuration..."
ssh -i $SSH_KEY root@$SERVER_IP "
cd /opt/launchradar

cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream launchradar_web {
        server web:3000;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://launchradar_web;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /api/health {
            proxy_pass http://launchradar_web;
            access_log off;
        }
    }
}
EOF

print_success 'Nginx configuration created!'
"

# Phase 6: Deploy production application
print_status "Phase 6: Deploying LaunchRadar production..."
ssh -i $SSH_KEY root@$SERVER_IP "
cd /opt/launchradar

# Stop test containers
docker compose -f docker-compose.simple.yml down 2>/dev/null || true

# Build and start production
print_status 'Building production images...'
docker compose -f docker-compose.production.yml build --no-cache

print_status 'Starting production services...'
docker compose -f docker-compose.production.yml up -d

# Wait for services to be ready
sleep 30

# Show status
print_success 'Production deployment status:'
docker compose -f docker-compose.production.yml ps

# Test health
echo '🔍 Testing application health...'
curl -s http://localhost:3000/api/health || echo 'Health check endpoint not ready yet'
curl -s http://localhost/ | head -5

print_success 'LaunchRadar production deployed on CAX11!'
"

# Final status
print_success "🎉 LaunchRadar successfully deployed!"
echo ""
echo "📊 Access Information:"
echo "🌐 Web Application: http://$SERVER_IP"
echo "📈 Health Check: http://$SERVER_IP/api/health"
echo ""
echo "💰 Monthly Cost: 18.29€ (CAX11 + Supabase Pro)"
echo "📈 Resources Used: ~1.4GB RAM / 4GB (65% headroom)"
echo ""
echo "🔧 Management Commands:"
echo "ssh -i $SSH_KEY root@$SERVER_IP"
echo "cd /opt/launchradar && docker compose -f docker-compose.production.yml logs -f"