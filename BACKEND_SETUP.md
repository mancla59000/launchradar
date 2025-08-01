# LaunchRadar Backend Setup Guide

## Overview
LaunchRadar backend provides API services for personal data collection from Twitter and Reddit, intelligent scoring of opportunities, research notes management, and data export functionality.

## Features
- **Data Collection**: Twitter API v2 and Reddit API integration
- **Intelligent Scoring**: Personal scoring algorithm for opportunity ranking
- **Research Notes**: Personal notes management with tagging
- **Data Export**: CSV and JSON export functionality
- **Real-time Processing**: Automated data processing pipeline
- **Health Monitoring**: Comprehensive health checks and statistics

## Prerequisites
1. **Supabase Project** (Free tier)
2. **Twitter Developer Account** (Free tier)
3. **Reddit Developer Account** (Free tier)
4. **Node.js 18+**

## Quick Setup

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Twitter API v2 (Free Tier)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Reddit API (Free Tier)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password

# Collection Configuration
COLLECTION_INTERVAL_MINUTES=30
MAX_POSTS_PER_COLLECTION=100
SEARCH_KEYWORDS=SaaS,micro-SaaS,startup,indie hacker,product launch
DEFAULT_SUBREDDITS=entrepreneur,SaaS,startups,indiehackers,sideproject
MINIMUM_ENGAGEMENT_SCORE=5
```

### 2. Database Setup

The database schema is already defined in `supabase/migrations/001_initial_schema.sql`.

Apply the migration to your Supabase project:

```bash
# Using Supabase CLI
supabase migration up

# Or apply manually in Supabase Dashboard > SQL Editor
```

### 3. API Keys Setup

#### Twitter API Setup:
1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create a new app (Free tier allows 1,500 tweets/month)
3. Generate Bearer Token
4. Add to `TWITTER_BEARER_TOKEN` in `.env.local`

#### Reddit API Setup:
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Create a "script" application
3. Get Client ID and Secret
4. Use your Reddit username/password
5. Add credentials to `.env.local`

#### Supabase Setup:
1. Create project at [Supabase](https://supabase.com)
2. Go to Settings > API
3. Copy Project URL and Anon Key
4. Copy Service Role Key (keep secret!)
5. Add to `.env.local`

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - System health status

### Data Collection
- `POST /api/collect/twitter` - Collect Twitter posts
- `POST /api/collect/reddit` - Collect Reddit posts
- `GET/POST /api/collectors` - Manage collection services

### Opportunities
- `GET /api/opportunities` - List opportunities with filtering
- `POST /api/opportunities` - Process raw posts into opportunities
- `GET /api/stats` - Processing statistics

### Research Notes
- `GET /api/notes` - List research notes
- `POST /api/notes` - Create research note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note
- `GET /api/notes/tags` - Get all tags
- `GET /api/notes/stats` - Notes statistics

### Data Export
- `GET /api/export/opportunities?format=csv|json` - Export opportunities
- `GET /api/export/notes?format=csv|json` - Export research notes
- `GET /api/export/complete` - Export all data
- `GET /api/export/stats` - Export statistics

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

## Usage Examples

### Start Data Collection
```bash
curl -X POST http://localhost:3000/api/collectors \\
  -H "Content-Type: application/json" \\
  -d '{"action": "start", "service": "all"}'
```

### Collect Data Once
```bash
curl -X POST http://localhost:3000/api/collectors \\
  -H "Content-Type: application/json" \\
  -d '{"action": "collect"}'
```

### Get Opportunities
```bash
curl "http://localhost:3000/api/opportunities?minScore=50&limit=10"
```

### Create Research Note
```bash
curl -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Interesting SaaS Idea",
    "content": "Found a gap in project management tools...",
    "tags": ["saas", "project-management", "high-priority"]
  }'
```

### Export Data
```bash
# Export opportunities as CSV
curl "http://localhost:3000/api/export/opportunities?format=csv" > opportunities.csv

# Export complete data as JSON
curl "http://localhost:3000/api/export/complete" > complete-data.json
```

## Personal Scoring Algorithm

The scoring algorithm evaluates opportunities based on:

### Scoring Components (0-100 scale):
1. **Relevance (40%)**: Keyword matching for business opportunities
2. **Engagement (30%)**: Social media metrics (likes, comments, shares)
3. **Authority (20%)**: Author credibility and follower metrics
4. **Freshness (10%)**: How recent the post is

### High-Value Keywords:
- Business: validation, mvp, product-market fit, traction, revenue
- SaaS: saas, subscription, recurring, mrr, arr
- Startup: launch, beta, feedback, customers, growth

### Categories:
- SaaS, Marketplace, E-commerce, Service, Content, Tool

### Personal Tags:
- Priority: high-priority, medium-priority, low-priority
- Stage: early-stage, mvp-stage, traction-stage
- Type: problem-discovery, solution-proposed, market-analysis

## Database Schema

### Main Tables:
- `profiles` - User profiles and preferences
- `opportunities` - Processed business opportunities
- `research_notes` - Personal research notes
- `raw_data.posts` - Raw social media posts

### Key Features:
- Row Level Security (RLS) enabled
- Automatic timestamps
- Optimized indexes for performance
- Personal data isolation

## Free Tier Limits

### Twitter API v2 (Free):
- 1,500 tweets/month (recent search)
- Rate limit: 300 requests/15 minutes

### Reddit API (Free):
- 60 requests/minute
- No monthly limit

### Supabase (Free):
- 50,000 monthly active users
- 500MB database storage
- 1GB bandwidth

## Deployment

### Local Development:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
npm start
```

### Docker:
```bash
docker build -t launchradar .
docker run -p 3000:3000 launchradar
```

## Monitoring & Maintenance

### Health Checks:
- System: `GET /api/health`
- Services: `GET /api/collectors`
- Statistics: `GET /api/stats`

### Data Management:
- Process unprocessed posts: `POST /api/opportunities`
- Cleanup old data: `POST /api/collectors` with `{"action": "cleanup"}`

### Performance Optimization:
- Database indexes optimized for common queries
- Background processing for data pipeline
- Automatic cleanup of old processed posts

## Security

### Authentication:
- Supabase Auth integration
- Row Level Security (RLS)
- Personal data isolation

### API Security:
- Environment variable validation
- Input sanitization
- Error handling without data exposure

### Data Privacy:
- Personal use only
- No data sharing
- Local processing
- Export functionality for data portability

## Troubleshooting

### Common Issues:

1. **Twitter API Errors**:
   - Check Bearer Token validity
   - Verify rate limits not exceeded
   - Ensure keywords are properly formatted

2. **Reddit API Errors**:
   - Verify credentials (client ID/secret)
   - Check username/password
   - Ensure subreddits exist and are accessible

3. **Database Connection**:
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure migrations are applied

4. **Environment Variables**:
   - Use `GET /api/health` to check configuration
   - Verify all required variables are set
   - Check for typos in variable names

### Debug Commands:
```bash
# Check system health
curl http://localhost:3000/api/health

# Check collector status
curl http://localhost:3000/api/collectors

# View processing stats
curl http://localhost:3000/api/stats
```

## Support

For issues or questions:
1. Check the health endpoint for system status
2. Review the console logs for detailed error messages
3. Verify environment configuration
4. Check API rate limits and quotas

---

**LaunchRadar Backend v1.0** - Personal Business Intelligence for Micro-SaaS Opportunities