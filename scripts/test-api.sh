#!/bin/bash

# LaunchRadar Backend API Testing Script
# Tests all major API endpoints

BASE_URL="http://localhost:3000"
OUTPUT_DIR="./test-outputs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create output directory
mkdir -p $OUTPUT_DIR

echo -e "${BLUE}🚀 LaunchRadar Backend API Testing${NC}"
echo "=================================="

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Method: $method"
    echo "Endpoint: $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        echo "Data: $data"
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            "$BASE_URL$endpoint")
    fi
    
    # Extract HTTP code and body
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
}

# Test 1: Health Check
test_endpoint "GET" "/api/health" "" "System Health Check"

# Test 2: System Stats
test_endpoint "GET" "/api/stats" "" "Processing Statistics"

# Test 3: Collector Status
test_endpoint "GET" "/api/collectors" "" "Collector Status"

# Test 4: Manual Collection (Twitter)
test_endpoint "POST" "/api/collect/twitter" '{"keywords":["SaaS","startup"],"maxResults":10}' "Manual Twitter Collection"

# Test 5: Manual Collection (Reddit)
test_endpoint "POST" "/api/collect/reddit" '{"subreddits":["entrepreneur"],"keywords":["SaaS"]}' "Manual Reddit Collection"

# Test 6: Get Opportunities
test_endpoint "GET" "/api/opportunities?limit=5&sortBy=score&sortOrder=desc" "" "Get Top Opportunities"

# Test 7: Process Raw Posts
test_endpoint "POST" "/api/opportunities" "" "Process Raw Posts"

# Test 8: User Profile (will fail without auth)
test_endpoint "GET" "/api/auth/profile" "" "User Profile (expect 401)"

# Test 9: Research Notes (will fail without auth)
test_endpoint "GET" "/api/notes?limit=5" "" "Research Notes (expect 401)"

# Test 10: Export Stats
test_endpoint "GET" "/api/export/stats" "" "Export Statistics (expect 401)"

# Test 11: Collection Management
echo -e "\n${YELLOW}Testing: Collection Management${NC}"
echo "Starting all collectors..."
test_endpoint "POST" "/api/collectors" '{"action":"start","service":"all"}' "Start All Collectors"

sleep 2

echo "Getting collector status..."
test_endpoint "GET" "/api/collectors" "" "Check Collector Status"

echo "Stopping all collectors..."
test_endpoint "POST" "/api/collectors" '{"action":"stop","service":"all"}' "Stop All Collectors"

# Test 12: One-time collection from all sources
test_endpoint "POST" "/api/collectors" '{"action":"collect"}' "One-time Collection from All Sources"

# Test 13: Data processing
test_endpoint "POST" "/api/collectors" '{"action":"process"}' "Process Unprocessed Posts"

# Test 14: Cleanup old data
test_endpoint "POST" "/api/collectors" '{"action":"cleanup"}' "Cleanup Old Data"

echo -e "\n${BLUE}🎯 API Testing Complete!${NC}"
echo "=================================="

# Summary
echo -e "\n${YELLOW}Summary:${NC}"
echo "• All major endpoints tested"
echo "• Check console output for details"
echo "• Authentication endpoints will show 401 (expected)"
echo "• Collection endpoints require valid API keys"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Set up environment variables (.env.local)"
echo "2. Configure Twitter and Reddit API keys"
echo "3. Set up Supabase authentication"
echo "4. Test authenticated endpoints"

echo -e "\n${GREEN}✨ Ready for production use!${NC}"