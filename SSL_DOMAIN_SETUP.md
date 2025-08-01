# SSL Certificate & Domain Setup for LaunchRadar

## Current Status ✅
- **Self-signed SSL certificate** configured and working on `https://91.98.17.240`
- **Nginx reverse proxy** configured with security headers
- **HTTP to HTTPS redirect** enabled
- **Next.js app** updated to use HTTPS

## When Domain is Available

### 1. Configure Domain DNS
Point your domain (e.g., `launchradar.com`) to server IP: `91.98.17.240`

### 2. Update Nginx Configuration
```bash
# Edit /etc/nginx/sites-available/launchradar
server_name your-domain.com www.your-domain.com;
```

### 3. Get Let's Encrypt Certificate
```bash
# Automatic configuration with domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify certificate
sudo certbot certificates

# Test renewal
sudo certbot --dry-run
```

### 4. Update Environment Variables
```bash
# In /opt/launchradar/start-standalone.sh
export NEXTAUTH_URL=https://your-domain.com
```

### 5. Auto-renewal Setup
Certbot timer is already enabled:
```bash
sudo systemctl status certbot.timer
```

## Current SSL Configuration
- **Protocol**: TLS 1.2/1.3
- **Certificate**: Self-signed (valid for 365 days)
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **HTTP**: Redirects to HTTPS

## Testing Commands
```bash
# Test HTTPS locally
curl -k https://91.98.17.240/api/health

# Test externally  
curl -k https://91.98.17.240/api/health

# Check certificate
openssl s_client -connect 91.98.17.240:443 -servername 91.98.17.240
```

## Production Ready 🚀
The application is now secure and production-ready with HTTPS enabled!