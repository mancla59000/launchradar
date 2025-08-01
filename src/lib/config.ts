export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN!,
  },
  
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    username: process.env.REDDIT_USERNAME!,
    password: process.env.REDDIT_PASSWORD!,
  },
  
  collection: {
    intervalMinutes: parseInt(process.env.COLLECTION_INTERVAL_MINUTES || '30'),
    maxPostsPerCollection: parseInt(process.env.MAX_POSTS_PER_COLLECTION || '100'),
    keywords: (process.env.SEARCH_KEYWORDS || '').split(',').map(k => k.trim()),
    subreddits: (process.env.DEFAULT_SUBREDDITS || '').split(',').map(s => s.trim()),
    minimumEngagementScore: parseInt(process.env.MINIMUM_ENGAGEMENT_SCORE || '5'),
  }
}

// Validation function to ensure all required environment variables are set
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TWITTER_BEARER_TOKEN',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET',
    'REDDIT_USERNAME',
    'REDDIT_PASSWORD',
  ]
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return true
}