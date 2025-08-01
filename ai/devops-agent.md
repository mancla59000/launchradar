# DevOps Agent Activation: LaunchRadar

**Date:** 2025-08-01  
**DevOps Agent:** BMAD Framework DevOps Agent  
**Project Phase:** Development - Infrastructure & Deployment  
**Status:** Activated v1.0  
**Orchestrator:** [ai/development-orchestrator.md](./development-orchestrator.md)

---

## DevOps Agent Mission

**Primary Objective:** Establish and manage the infrastructure for LaunchRadar personal research tool, ensuring cost-effective deployment, monitoring, and maintenance within the strict 56€/month budget while maintaining architecture ready for commercial scaling.

**Infrastructure Budget:** <30€/month (53% of total budget allocation)  
**Target Infrastructure:** Hetzner VPS + Supabase + essential monitoring  
**Timeline:** 8 weeks for production-ready personal infrastructure

---

## Infrastructure Architecture

### **Cost-Optimized Infrastructure Stack**

#### **Primary Infrastructure (20€/month)**
**Hetzner Cloud VPS - CPX21:**
- **CPU:** 3 vCPU AMD
- **RAM:** 8GB DDR4
- **Storage:** 160GB SSD
- **Network:** 20TB bandwidth
- **Cost:** 20€/month
- **Location:** EU (Nuremberg/Helsinki for GDPR compliance)

#### **Database & Backend Services (0-25€/month)**
**Supabase Configuration:**
- **Tier:** Free initially (up to 50MB database, 50k monthly active users)
- **Upgrade Path:** Pro tier (25€/month) when scaling needed
- **Features:** PostgreSQL, Auth, Realtime, Storage, Edge Functions

#### **Essential Services (5-10€/month)**
**Domain & SSL:**
- **Domain:** 10€/year (~1€/month)
- **SSL:** Let's Encrypt (free)
- **DNS:** Cloudflare free tier

**Monitoring & Backup:**
- **Uptime monitoring:** UptimeRobot free tier
- **Backup storage:** Hetzner Storage Box 5€/month (100GB)
- **Log management:** Self-hosted via Docker

**Total Monthly Cost:** 26€/month (54% under budget)

---

## Infrastructure Setup & Configuration

### **Phase 1: Server Provisioning & Hardening**
*Priority: Week 1 - Days 1-2*

#### **Hetzner VPS Setup:**
```bash
#!/bin/bash
# server-setup.sh - Initial server configuration

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git ufw fail2ban nginx docker.io docker-compose

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl start fail2ban

# Setup Docker
systemctl enable docker
systemctl start docker
usermod -aG docker $USER

# Create application user
useradd -m -s /bin/bash launchradar
usermod -aG docker launchradar
```

#### **Security Hardening:**
```bash
#!/bin/bash
# security-hardening.sh

# Disable root login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Change SSH port (optional, but recommended)
sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# Configure automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Setup log rotation
cat > /etc/logrotate.d/launchradar << EOF
/var/log/launchradar/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 launchradar launchradar
    postrotate
        systemctl reload nginx
    endscript
}
EOF

systemctl restart sshd
```

### **Phase 2: Container Infrastructure**
*Priority: Week 1 - Days 3-4*

#### **Docker Compose Configuration:**
```yaml
# docker-compose.yml - Production infrastructure
version: '3.8'

services:
  # Next.js Application
  web:
    image: launchradar/web:latest
    container_name: launchradar-web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
    networks:
      - launchradar

  # Background Data Collection Services
  twitter-collector:
    image: launchradar/collector:latest
    container_name: launchradar-twitter
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - TWITTER_BEARER_TOKEN=${TWITTER_BEARER_TOKEN}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - WORKER_TYPE=twitter
      - COLLECTION_INTERVAL=3600 # 1 hour for personal use
    volumes:
      - ./logs:/app/logs
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  reddit-collector:
    image: launchradar/collector:latest
    container_name: launchradar-reddit
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REDDIT_CLIENT_ID=${REDDIT_CLIENT_ID}
      - REDDIT_CLIENT_SECRET=${REDDIT_CLIENT_SECRET}
      - REDDIT_USERNAME=${REDDIT_USERNAME}
      - REDDIT_PASSWORD=${REDDIT_PASSWORD}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - WORKER_TYPE=reddit
      - COLLECTION_INTERVAL=7200 # 2 hours for personal use
    volumes:
      - ./logs:/app/logs
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Scoring Engine
  scoring-engine:
    image: launchradar/scoring:latest
    container_name: launchradar-scoring
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - PROCESSING_INTERVAL=1800 # 30 minutes
    volumes:
      - ./logs:/app/logs
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1'

  # Redis for caching and session management
  redis:
    image: redis:7-alpine
    container_name: launchradar-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 128mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - launchradar
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: launchradar-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - web
    networks:
      - launchradar

  # Log Management
  log-manager:
    image: busybox
    container_name: launchradar-logs
    volumes:
      - ./logs:/logs
    command: >
      sh -c "
        while true; do
          find /logs -name '*.log' -type f -size +100M -delete
          find /logs -name '*.log.*' -type f -mtime +7 -delete
          sleep 86400
        done
      "
    networks:
      - launchradar

volumes:
  redis_data:

networks:
  launchradar:
    driver: bridge
```

#### **Nginx Configuration:**
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;" always;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name launchradar.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # Main application server
    server {
        listen 443 ssl http2;
        server_name launchradar.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Next.js application
        location / {
            proxy_pass http://web:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://web:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login endpoint rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://web:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://web:3000;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://web:3000;
        }
    }
}
```

### **Phase 3: SSL & Domain Configuration**
*Priority: Week 1 - Day 5*

#### **Let's Encrypt SSL Setup:**
```bash
#!/bin/bash
# ssl-setup.sh

# Install certbot
apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
systemctl stop nginx

# Generate certificate
certbot certonly --standalone -d launchradar.yourdomain.com --email your@email.com --agree-tos --non-interactive

# Setup automatic renewal
cat > /etc/cron.d/certbot << EOF
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

# Copy certificates to nginx directory
mkdir -p /home/launchradar/nginx/ssl
cp /etc/letsencrypt/live/launchradar.yourdomain.com/fullchain.pem /home/launchradar/nginx/ssl/
cp /etc/letsencrypt/live/launchradar.yourdomain.com/privkey.pem /home/launchradar/nginx/ssl/
chown -R launchradar:launchradar /home/launchradar/nginx/ssl

# Start nginx
systemctl start nginx
```

---

## CI/CD Pipeline Configuration

### **Phase 4: Deployment Automation**
*Priority: Week 2*

#### **GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Web image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.web
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

    - name: Build and push Collector image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.collector
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/collector:latest

    - name: Build and push Scoring image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./Dockerfile.scoring
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/scoring:latest

    - name: Deploy to server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        port: ${{ secrets.SERVER_PORT }}
        script: |
          cd /home/launchradar
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker-compose pull
          docker-compose up -d --remove-orphans
          docker image prune -f
          
    - name: Verify deployment
      run: |
        sleep 30
        curl -f https://launchradar.yourdomain.com/health || exit 1
```

#### **Deployment Scripts:**
```bash
#!/bin/bash
# deploy.sh - Local deployment helper

set -e

echo "Starting LaunchRadar deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose pull

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start new containers
echo "Starting new containers..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Health check
echo "Performing health check..."
if curl -f http://localhost/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed"
    docker-compose logs
    exit 1
fi

# Cleanup old images
echo "Cleaning up old Docker images..."
docker image prune -f

echo "Deployment completed successfully!"
```

---

## Monitoring & Alerting

### **Phase 5: Monitoring Infrastructure**
*Priority: Week 3*

#### **Health Monitoring Setup:**
```bash
#!/bin/bash
# monitoring-setup.sh

# Create monitoring directory
mkdir -p /home/launchradar/monitoring

# Simple health check script
cat > /home/launchradar/monitoring/health-check.sh << 'EOF'
#!/bin/bash
# health-check.sh - Comprehensive health monitoring

LOG_FILE="/home/launchradar/logs/health-check.log"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK_URL}" # Optional: Discord notifications

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Function to send Discord notification
notify() {
    if [ -n "$DISCORD_WEBHOOK" ]; then
        curl -H "Content-Type: application/json" \
             -X POST \
             -d "{\"content\":\"🚨 LaunchRadar Alert: $1\"}" \
             "$DISCORD_WEBHOOK"
    fi
}

# Check web service
if ! curl -f -s http://localhost/health > /dev/null; then
    log "ERROR: Web service health check failed"
    notify "Web service is down"
    exit 1
fi

# Check Docker containers
CONTAINERS=("launchradar-web" "launchradar-nginx" "launchradar-redis")
for container in "${CONTAINERS[@]}"; do
    if [ "$(docker ps -q -f name=$container)" == "" ]; then
        log "ERROR: Container $container is not running"
        notify "Container $container is down"
        exit 1
    fi
done

# Check disk space
DISK_USAGE=$(df /home | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    log "WARNING: Disk usage is ${DISK_USAGE}%"
    notify "High disk usage: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", ($3/$2) * 100.0)}')
if [ "${MEMORY_USAGE%.*}" -gt 85 ]; then
    log "WARNING: Memory usage is ${MEMORY_USAGE}%"
    notify "High memory usage: ${MEMORY_USAGE}%"
fi

log "Health check completed successfully"
EOF

chmod +x /home/launchradar/monitoring/health-check.sh

# Setup cron job for health checks
cat > /etc/cron.d/launchradar-monitoring << 'EOF'
# LaunchRadar monitoring cron jobs
*/5 * * * * launchradar /home/launchradar/monitoring/health-check.sh
0 */6 * * * launchradar /home/launchradar/monitoring/backup.sh
EOF
```

#### **Cost Monitoring Script:**
```bash
#!/bin/bash
# cost-monitor.sh - Track infrastructure costs

COST_LOG="/home/launchradar/logs/cost-monitor.log"
BUDGET_LIMIT="56" # EUR per month
ALERT_THRESHOLD="45" # EUR per month

# Function to log costs
log_cost() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $COST_LOG
}

# Calculate monthly costs (example values)
HETZNER_COST="20.00"
SUPABASE_COST="0.00" # Free tier initially
DOMAIN_COST="0.83" # 10 EUR/year
BACKUP_COST="5.00"

TOTAL_COST=$(echo "$HETZNER_COST + $SUPABASE_COST + $DOMAIN_COST + $BACKUP_COST" | bc)

log_cost "Monthly cost breakdown:"
log_cost "  Hetzner VPS: €$HETZNER_COST"
log_cost "  Supabase: €$SUPABASE_COST"
log_cost "  Domain: €$DOMAIN_COST"
log_cost "  Backup: €$BACKUP_COST"
log_cost "  Total: €$TOTAL_COST / €$BUDGET_LIMIT budget"

# Check if approaching budget limit
if [ "$(echo "$TOTAL_COST > $ALERT_THRESHOLD" | bc)" -eq 1 ]; then
    log_cost "WARNING: Approaching budget limit (€$TOTAL_COST > €$ALERT_THRESHOLD)"
    # Send alert notification
    notify "Cost alert: Monthly spend €$TOTAL_COST approaching €$BUDGET_LIMIT budget"
fi

# Generate cost report
cat > /home/launchradar/logs/monthly-cost-report.txt << EOF
LaunchRadar Monthly Cost Report
Generated: $(date)

Infrastructure Costs:
- Hetzner CPX21 VPS: €20.00/month
- Supabase Database: €$SUPABASE_COST/month
- Domain & DNS: €0.83/month
- Backup Storage: €5.00/month

Total Monthly Cost: €$TOTAL_COST
Budget Remaining: €$(echo "$BUDGET_LIMIT - $TOTAL_COST" | bc)
Budget Utilization: $(echo "scale=1; $TOTAL_COST * 100 / $BUDGET_LIMIT" | bc)%

Status: $([ "$(echo "$TOTAL_COST <= $BUDGET_LIMIT" | bc)" -eq 1 ] && echo "✅ Within Budget" || echo "❌ Over Budget")
EOF
```

### **Backup & Recovery System**
*Priority: Week 4*

#### **Automated Backup Strategy:**
```bash
#!/bin/bash
# backup.sh - Comprehensive backup system

BACKUP_DIR="/home/launchradar/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS="30"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
echo "Starting backup process..."

# 1. Backup Docker volumes
docker run --rm -v launchradar_redis_data:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/redis_data_$DATE.tar.gz -C /data .

# 2. Backup configuration files
tar czf $BACKUP_DIR/config_$DATE.tar.gz \
    /home/launchradar/docker-compose.yml \
    /home/launchradar/.env.production \
    /home/launchradar/nginx/ \
    /home/launchradar/monitoring/

# 3. Backup Supabase data (via API)
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    # Export personal data
    curl -X GET "https://your-project.supabase.co/rest/v1/opportunities?select=*" \
         -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
         > $BACKUP_DIR/opportunities_$DATE.json
    
    curl -X GET "https://your-project.supabase.co/rest/v1/research_notes?select=*" \
         -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
         -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
         > $BACKUP_DIR/research_notes_$DATE.json
fi

# 4. Backup logs (last 7 days)
find /home/launchradar/logs -name "*.log" -mtime -7 -type f | tar czf $BACKUP_DIR/logs_$DATE.tar.gz -T -

# 5. Upload to Hetzner Storage Box (optional)
if [ -n "$STORAGE_BOX_USER" ] && [ -n "$STORAGE_BOX_HOST" ]; then
    rsync -avz --delete $BACKUP_DIR/ $STORAGE_BOX_USER@$STORAGE_BOX_HOST:/backups/launchradar/
fi

# 6. Cleanup old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.json" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully"
```

---

## Performance Optimization

### **Resource Optimization**
*Priority: Week 5-6*

#### **Container Resource Limits:**
```yaml
# Optimized resource allocation for 8GB server
version: '3.8'

services:
  web:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.5'
        reservations:
          memory: 1G
          cpus: '0.5'

  twitter-collector:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

  redis:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
        reservations:
          memory: 128M
          cpus: '0.1'
```

#### **System Optimization Script:**
```bash
#!/bin/bash
# optimize-system.sh

# Optimize system for personal usage
echo "Optimizing system for LaunchRadar personal usage..."

# Adjust swappiness for SSD
echo 'vm.swappiness=10' >> /etc/sysctl.conf

# Optimize file descriptor limits
echo 'fs.file-max = 65536' >> /etc/sysctl.conf

# Network optimizations
echo 'net.core.rmem_default = 262144' >> /etc/sysctl.conf
echo 'net.core.wmem_default = 262144' >> /etc/sysctl.conf

# Docker daemon optimization
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

# Apply changes
sysctl -p
systemctl restart docker

echo "System optimization completed"
```

---

## Development Support

### **Local Development Environment**
*Priority: Week 7*

#### **Development Docker Compose:**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
    networks:
      - launchradar

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - launchradar

networks:
  launchradar:
    driver: bridge
```

#### **Development Scripts:**
```bash
#!/bin/bash
# dev-setup.sh - Development environment setup

echo "Setting up development environment..."

# Install development dependencies
npm install

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"

# Setup environment files
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "Created .env.local - please update with your configuration"
fi

# Start development services
docker-compose -f docker-compose.dev.yml up -d redis

echo "Development environment ready!"
echo "Run 'npm run dev' to start the development server"
```

---

## Security & Compliance

### **Security Hardening Checklist**
*Priority: Week 8*

#### **Security Monitoring:**
```bash
#!/bin/bash
# security-audit.sh

# Check for security updates
apt list --upgradable 2>/dev/null | grep -i security

# Verify firewall status
ufw status verbose

# Check fail2ban status
fail2ban-client status

# Docker security check
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /usr/local/bin/docker:/usr/local/bin/docker -v /usr/bin/docker:/usr/bin/docker aquasec/trivy image launchradar/web:latest

# SSL certificate expiry check
echo | openssl s_client -servername launchradar.yourdomain.com -connect launchradar.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Check for open ports
nmap -sT -O localhost

echo "Security audit completed"
```

#### **GDPR Compliance Setup:**
```bash
#!/bin/bash
# gdpr-compliance.sh

# Setup data retention policies
cat > /home/launchradar/scripts/data-retention.sh << 'EOF'
#!/bin/bash
# Automated data cleanup for GDPR compliance

# Clean up old data (>2 years)
# This would typically be done via Supabase functions
echo "Running GDPR data retention cleanup..."

# Log retention (30 days for system logs)
find /home/launchradar/logs -name "*.log" -mtime +30 -delete

# Backup retention (90 days)
find /home/launchradar/backups -name "*.tar.gz" -mtime +90 -delete

echo "GDPR cleanup completed"
EOF

chmod +x /home/launchradar/scripts/data-retention.sh

# Schedule monthly GDPR cleanup
echo "0 2 1 * * /home/launchradar/scripts/data-retention.sh" | crontab -
```

---

## Sprint Planning & Deliverables

### **Sprint 1: Infrastructure Foundation (Week 1)**
**Deliverables:**
- [ ] Hetzner VPS provisioned and hardened
- [ ] Docker infrastructure configured
- [ ] SSL certificates installed
- [ ] Basic monitoring setup
- [ ] Domain and DNS configuration

**Acceptance Criteria:**
- Server accessible via HTTPS
- All containers running and healthy
- SSL certificates valid and auto-renewing
- Basic health checks functional

### **Sprint 2: CI/CD Pipeline (Week 2)**
**Deliverables:**
- [ ] GitHub Actions workflow configured
- [ ] Automated deployment pipeline
- [ ] Container registry setup
- [ ] Rollback procedures documented
- [ ] Deployment verification automated

**Acceptance Criteria:**
- Code pushes trigger automatic deployment
- Deployment completes without manual intervention
- Health checks verify successful deployment
- Rollback possible within 5 minutes

### **Sprint 3: Monitoring & Alerting (Week 3)**
**Deliverables:**
- [ ] Comprehensive health monitoring
- [ ] Cost tracking system
- [ ] Performance monitoring
- [ ] Alert notifications setup
- [ ] Log management system

**Acceptance Criteria:**
- Health checks run every 5 minutes
- Cost monitoring tracks budget usage
- Alerts sent for critical issues
- Logs properly rotated and archived

### **Sprint 4: Backup & Recovery (Week 4)**
**Deliverables:**
- [ ] Automated backup system
- [ ] Recovery procedures tested
- [ ] Data retention policies implemented
- [ ] Off-site backup storage
- [ ] Recovery time objectives validated

**Acceptance Criteria:**
- Daily backups completed automatically
- Recovery tested and documented
- Backup retention follows schedule
- RTO <1 hour for critical services

### **Sprint 5: Performance Optimization (Week 5-6)**
**Deliverables:**
- [ ] Resource optimization implemented
- [ ] Performance monitoring configured
- [ ] Caching strategies deployed
- [ ] Load testing completed
- [ ] Scaling procedures documented

**Acceptance Criteria:**
- Server resource utilization <70% under normal load
- Page load times <2 seconds
- API response times <500ms
- System handles expected personal usage load

### **Sprint 6: Security & Documentation (Week 7-8)**
**Deliverables:**
- [ ] Security hardening completed
- [ ] GDPR compliance measures
- [ ] Development environment setup
- [ ] Comprehensive documentation
- [ ] Handover procedures

**Acceptance Criteria:**
- Security audit passes all checks
- GDPR compliance measures active
- Development environment functional
- Documentation complete and accurate

---

## Budget Tracking & Optimization

### **Monthly Cost Breakdown:**
```
Infrastructure Costs (Personal MVP):
├── Hetzner CPX21 VPS: €20.00/month
├── Domain registration: €0.83/month (€10/year)
├── Backup storage: €5.00/month
├── SSL certificates: €0.00 (Let's Encrypt)
├── Monitoring tools: €0.00 (self-hosted)
└── DNS services: €0.00 (Cloudflare free)

Total Monthly Cost: €25.83/month
Budget Remaining: €30.17/month (54% under budget)
Future Scaling Buffer: €30.17/month available
```

### **Cost Optimization Strategies:**
- Use Supabase free tier initially (0-25€ when scaling)
- Self-hosted monitoring instead of paid services
- Efficient resource allocation and container limits
- Automated cleanup and optimization scripts
- Reserved capacity planning for future growth

---

## Success Criteria

### **Infrastructure Success Criteria:**

**Reliability & Performance:**
- [ ] 95%+ uptime for personal usage
- [ ] SSL certificates valid and auto-renewing
- [ ] Automated backups successful
- [ ] Health monitoring functional
- [ ] Performance within acceptable limits

**Cost Control:**
- [ ] Monthly costs <30€ (54% under budget)
- [ ] Cost monitoring and alerting active
- [ ] Resource utilization optimized
- [ ] Budget headroom for scaling

**Security & Compliance:**
- [ ] Server hardened and secure
- [ ] GDPR compliance measures active
- [ ] Regular security updates applied
- [ ] Access controls properly configured

### **Development Support:**
- [ ] CI/CD pipeline functional
- [ ] Development environment ready
- [ ] Documentation complete
- [ ] Deployment automation working

**Commercial Readiness:**
- [ ] Architecture scalable for multi-user
- [ ] Monitoring ready for increased load
- [ ] Infrastructure automation suitable for growth
- [ ] Security framework enterprise-ready

---

**DevOps Agent Status:** ✅ ACTIVATED - Ready for infrastructure deployment  
**Next Action:** Begin Sprint 1 - Hetzner VPS provisioning and hardening  
**Success Target:** Production-ready infrastructure within 8 weeks, <30€/month operational cost  
**Integration:** Supporting Backend Agent and Frontend Agent with reliable, scalable infrastructure

---

*DevOps Agent activated and ready for LaunchRadar personal research tool infrastructure. Focus on cost-effective, secure, and scalable infrastructure suitable for personal use and future commercialization.*