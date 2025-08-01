#!/bin/bash

# LaunchRadar Backend Setup Script
# Automates initial backend configuration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 LaunchRadar Backend Setup${NC}"
echo "============================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "\n${YELLOW}📋 Creating environment configuration...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys before continuing${NC}"
else
    echo -e "${GREEN}✅ Environment file already exists${NC}"
fi

# Check Node.js version
echo -e "\n${YELLOW}🔍 Checking Node.js version...${NC}"
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 18 ]; then
    echo -e "${GREEN}✅ Node.js version OK: $(node -v)${NC}"
else
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Check TypeScript configuration
echo -e "\n${YELLOW}🔧 Checking TypeScript configuration...${NC}"
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript configuration valid${NC}"
else
    echo -e "${RED}❌ TypeScript configuration issues detected${NC}"
fi

# Test build
echo -e "\n${YELLOW}🏗️  Testing build process...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "\n${BLUE}📚 Setup Complete!${NC}"
echo -e "${GREEN}✨ LaunchRadar Backend is ready${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Configure your .env.local file with API keys:"
echo "   - Supabase: URL, Anon Key, Service Role Key"
echo "   - Twitter: Bearer Token"
echo "   - Reddit: Client ID, Secret, Username, Password"
echo ""
echo "2. Set up your Supabase database:"
echo "   - Apply migration: supabase/migrations/001_initial_schema.sql"
echo "   - Or use Supabase CLI: supabase migration up"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Test the API endpoints:"
echo "   ./scripts/test-api.sh"
echo ""
echo "5. Visit the setup guide:"
echo "   Open BACKEND_SETUP.md for detailed instructions"

echo -e "\n${BLUE}🎯 Ready to launch your personal business intelligence system!${NC}"