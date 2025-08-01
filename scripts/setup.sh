#!/bin/bash

# LaunchRadar Development Setup Script
set -e

echo "🚀 LaunchRadar Development Setup"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local from example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual configuration values"
else
    echo "✅ .env.local already exists"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p logs/nginx
mkdir -p docker/nginx/ssl
mkdir -p docker/nginx/conf.d
mkdir -p supabase/migrations

# Setup Git hooks (if in git repo)
if [ -d .git ]; then
    echo "🔧 Setting up Git hooks..."
    npx husky install
    npx husky add .husky/pre-commit "npm run lint && npm run type-check"
fi

# Check Docker installation
if command -v docker &> /dev/null; then
    echo "✅ Docker detected"
    if ! docker ps &> /dev/null; then
        echo "⚠️  Docker is installed but not running. Please start Docker."
    fi
else
    echo "⚠️  Docker not found. Install Docker for full development experience."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase and API credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "For production deployment:"
echo "1. Configure your Hetzner VPS (see ai/devops-agent.md)"
echo "2. Run the deployment scripts in /scripts"
echo ""
echo "Budget status: Targeting <56€/month operational cost"

# Create nginx configuration inline if needed
if [ ! -f docker/nginx/nginx.conf ]; then
    echo "📄 Creating nginx.conf..."
    cat > docker/nginx/nginx.conf << 'NGINX_CONF_EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=2r/s;

    include /etc/nginx/conf.d/*.conf;
}
NGINX_CONF_EOF
fi

if [ ! -f docker/nginx/conf.d/launchradar.conf ]; then
    echo "📄 Creating site configuration..."
    cat > docker/nginx/conf.d/launchradar.conf << 'SITE_CONF_EOF'
upstream launchradar_web {
    server web:3000;
    keepalive 32;
}

upstream uptime_kuma {
    server uptime-kuma:3001;
    keepalive 8;
}

server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://launchradar_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        limit_req zone=web burst=10 nodelay;
    }

    location /api/ {
        proxy_pass http://launchradar_web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        limit_req zone=api burst=20 nodelay;
    }

    location /api/health {
        proxy_pass http://launchradar_web;
        proxy_set_header Host $host;
        access_log off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://launchradar_web;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}

server {
    listen 443 ssl http2;
    server_name monitor.your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://uptime_kuma;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
SITE_CONF_EOF
fi

echo ""
echo "🌟 LaunchRadar setup completed!"
echo "For Hetzner deployment: ./scripts/deploy-hetzner.sh"

# Create the Hetzner deployment script
if [ ! -f scripts/deploy-hetzner.sh ]; then
    echo "📄 Creating Hetzner deployment script..."
fi
echo "For Hetzner deployment: ./scripts/deploy-hetzner.sh"

