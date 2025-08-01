#!/bin/bash

# Production LaunchRadar Standalone Server Start Script
# Uses Next.js standalone mode with environment variables
# BMAD Framework - DevOps Agent

set -e

# Environment Configuration
export NODE_ENV=production
export PORT=3000

# Supabase Configuration
export NEXT_PUBLIC_SUPABASE_URL=https://jjgcomspyeuwizwhyjbn.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2NvbXNweWV1d2l6d2h5amJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTE5MzMsImV4cCI6MjA2OTYyNzkzM30.sLf6Yska4_BVnw6ELvP3mHM-PoyfwxGSgmWCaAWsRDw
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZ2NvbXNweWV1d2l6d2h5amJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA1MTkzMywiZXhwIjoyMDY5NjI3OTMzfQ.iOMGLuiep-mYg9YJWKbvb4bEyoVxEZB8yZIo8Z5kaG8

# Twitter API v2 (Placeholder - Update when configuring)
export TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Reddit API (Placeholder - Update when configuring)
export REDDIT_CLIENT_ID=your_reddit_client_id
export REDDIT_CLIENT_SECRET=your_reddit_client_secret
export REDDIT_USERNAME=your_reddit_username
export REDDIT_PASSWORD=your_reddit_password

# Data Collection Configuration
export COLLECTION_INTERVAL_MINUTES=30
export MAX_POSTS_PER_COLLECTION=100

# Keywords and Preferences
export SEARCH_KEYWORDS="SaaS,micro-SaaS,startup,indie hacker,product launch,solopreneur,bootstrap,validation,MVP,PMF"
export DEFAULT_SUBREDDITS="entrepreneur,SaaS,startups,indiehackers,sideproject,microsaas"
export MINIMUM_ENGAGEMENT_SCORE=5

# Security Configuration
export NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters_long
export NEXTAUTH_URL=http://91.98.17.240:3000

# Analytics & Monitoring
export NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Sentry Configuration
export SENTRY_DSN=https://your-dsn-key@sentry.io/your-project-id
export NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-key@sentry.io/your-project-id
export SENTRY_ORG=your-sentry-org
export SENTRY_PROJECT=launchradar
export SENTRY_AUTH_TOKEN=your-sentry-auth-token

echo "=== LaunchRadar Standalone Server Starting ==="
echo "Node Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "Using standalone mode with server.js"

# Start the Next.js standalone server
exec node server.js