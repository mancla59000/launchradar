#!/bin/bash

# LaunchRadar CAX11 ARM64 Deployment Script
# Hetzner CAX11: 2 CPU ARM, 4GB RAM, 40GB SSD - 3.29€/mois
# Optimized for personal use with budget constraints

set -e

echo "🚀 LaunchRadar CAX11 ARM64 Deployment"
echo "====================================="
echo "Target: Hetzner CAX11 (ARM64, 4GB RAM, 3.29€/mois)"
echo "Total Budget: ~18.29€/mois (CAX11 + Supabase Pro)"
echo ""

# Configuration
SERVER_TYPE="cax11"
LOCATION="nbg1"  # Nuremberg (closest to France)
IMAGE="ubuntu-22.04"
SSH_KEY_NAME="launchradar-deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is required but not installed."
        exit 1
    fi
    
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found. Creating from example..."
        cp .env.example .env.production
        print_warning "Please update .env.production with your actual values"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Build ARM64 images locally for testing
build_arm64_images() {
    print_status "Building ARM64 optimized images..."
    
    # Enable experimental Docker features for cross-platform builds
    export DOCKER_CLI_EXPERIMENTAL=enabled
    
    # Create builder instance for ARM64
    docker buildx create --name launchradar-builder --use --bootstrap
    
    print_status "Building Next.js web application (ARM64)..."
    docker buildx build \
        --platform linux/arm64 \
        --file Dockerfile.web.arm64 \
        --tag launchradar-web:arm64 \
        --load \
        .
    
    print_success "ARM64 images built successfully"
}

# Prepare deployment files
prepare_deployment() {
    print_status "Preparing deployment files..."
    
    # Create deployment directory
    mkdir -p deployment/cax11
    
    # Copy optimized docker-compose for CAX11
    cp docker/docker-compose.cax11.yml deployment/cax11/docker-compose.yml
    
    # Copy environment file
    cp .env.production deployment/cax11/.env
    
    # Copy nginx configuration
    cp -r docker/nginx deployment/cax11/
    
    # Create deployment archive
    tar -czf deployment/launchradar-cax11.tar.gz -C deployment/cax11 .
    
    print_success "Deployment files prepared"
}

# Display resource allocation
show_resource_allocation() {
    print_status "CAX11 Resource Allocation:"
    echo ""
    echo "Service              | Memory | CPU   | Notes"
    echo "-------------------- | ------ | ----- | -----"
    echo "Next.js Web          | 1.2GB  | 1.0   | Main application"
    echo "Twitter Collector    | 256MB  | 0.25  | Every 2h"
    echo "Reddit Collector     | 256MB  | 0.25  | Every 3h"
    echo "Scoring Engine       | 512MB  | 0.5   | Every 1h"
    echo "Redis Cache          | 128MB  | 0.15  | Optimized"
    echo "Nginx Proxy          | 64MB   | 0.1   | Lightweight"
    echo "Uptime Monitor       | 128MB  | 0.15  | Optional"
    echo "-------------------- | ------ | ----- | -----"
    echo "TOTAL USAGE          | 2.4GB  | 2.4   | 60% RAM, burst CPU"
    echo "AVAILABLE            | 1.6GB  | -     | 40% safety margin"
    echo ""
    echo "💰 Monthly Cost: 3.29€ (CAX11) + 15€ (Supabase) = 18.29€/mois"
    echo ""
}

# Generate deployment commands
generate_deployment_commands() {
    print_status "Generating deployment commands..."
    
    cat > deployment/cax11/deploy-commands.sh << 'EOF'
#!/bin/bash
# Commands to run on CAX11 server after file transfer

set -e

echo "🔧 Setting up CAX11 ARM64 environment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker for ARM64
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Setup application directory
sudo mkdir -p /opt/launchradar
sudo chown $USER:$USER /opt/launchradar
cd /opt/launchradar

# Extract application files
tar -xzf ~/launchradar-cax11.tar.gz

# Set proper permissions
chmod +x *.sh

# Start services with ARM64 optimizations
echo "🚀 Starting LaunchRadar services..."
docker compose up -d

# Show status
echo "📊 Service Status:"
docker compose ps

echo "✅ LaunchRadar deployed successfully on CAX11!"
echo "🌐 Access your application at: http://$(curl -s ifconfig.me)"
echo "📈 Monitor at: http://$(curl -s ifconfig.me):3001"
echo ""
echo "💰 Monthly cost: 3.29€/mois (CAX11 ARM64 optimized)"
EOF

    chmod +x deployment/cax11/deploy-commands.sh
    
    print_success "Deployment commands generated"
}

# Show next steps
show_next_steps() {
    echo ""
    print_success "🎉 CAX11 Deployment Preparation Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure your Hetzner Cloud API token"
    echo "2. Run MCP Hetzner deployment:"
    echo "   - Create CAX11 server"
    echo "   - Transfer deployment files"
    echo "   - Execute deployment commands"
    echo ""
    echo "📁 Files ready in: ./deployment/cax11/"
    echo "📦 Deployment archive: ./deployment/launchradar-cax11.tar.gz"
    echo ""
    echo "🔧 Manual deployment option:"
    echo "1. Create CAX11 server in Hetzner Console"
    echo "2. scp deployment/launchradar-cax11.tar.gz user@server:~/"
    echo "3. ssh user@server 'bash deploy-commands.sh'"
    echo ""
    echo "💡 ARM64 optimizations applied:"
    echo "   ✅ Memory usage: 2.4GB/4GB (40% margin)"
    echo "   ✅ Longer collection intervals"
    echo "   ✅ Reduced batch sizes"
    echo "   ✅ Platform-specific builds"
    echo ""
    echo "💰 Total monthly cost: 18.29€ (vs 41€ with CPX21)"
    echo "   - CAX11: 3.29€/mois"
    echo "   - Supabase Pro: 15€/mois"
    echo "   💾 Savings: 22.71€/mois (55% reduction!)"
}

# Main execution
main() {
    check_prerequisites
    show_resource_allocation
    build_arm64_images
    prepare_deployment
    generate_deployment_commands
    show_next_steps
}

# Check if running directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi