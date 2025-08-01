import { DataProcessingService } from '../services/data-processing.service'
import { config } from '../config'

interface RedditCollectorConfig {
  clientId: string
  clientSecret: string
  username: string
  password: string
  subreddits: string[]
  keywords: string[]
  interval: number
}

interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  created_utc: number
  score: number
  num_comments: number
  subreddit: string
  url: string
  permalink: string
  upvote_ratio: number
  is_self: boolean
  author_karma?: number
}

export class RedditCollector {
  private config: RedditCollectorConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private isRunning = false
  private dataProcessor: DataProcessingService

  constructor(collectorConfig?: Partial<RedditCollectorConfig>) {
    this.config = {
      clientId: config.reddit.clientId,
      clientSecret: config.reddit.clientSecret,
      username: config.reddit.username,
      password: config.reddit.password,
      subreddits: collectorConfig?.subreddits || config.collection.subreddits,
      keywords: collectorConfig?.keywords || config.collection.keywords,
      interval: collectorConfig?.interval || config.collection.intervalMinutes * 60, // Convert to seconds
    }
    this.dataProcessor = new DataProcessingService()
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now()
    
    // Return existing token if still valid
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
    
    try {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LaunchRadar/1.0'
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.config.username,
          password: this.config.password
        })
      })

      if (!response.ok) {
        throw new Error(`Reddit auth error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`Reddit auth error: ${data.error}`)
      }

      this.accessToken = data.access_token
      this.tokenExpiry = now + (data.expires_in * 1000) - 60000 // Refresh 1 minute before expiry
      
      console.log('Reddit access token refreshed')
      return this.accessToken!
    } catch (error) {
      console.error('Failed to get Reddit access token:', error)
      throw error
    }
  }

  async collectPosts(): Promise<RedditPost[]> {
    if (!this.config.subreddits.length) {
      console.warn('No subreddits configured for Reddit collection')
      return []
    }

    try {
      const token = await this.getAccessToken()
      const allPosts: RedditPost[] = []

      for (const subreddit of this.config.subreddits) {
        try {
          const response = await fetch(
            `https://oauth.reddit.com/r/${subreddit}/new.json?limit=25`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'LaunchRadar/1.0'
              }
            }
          )

          if (!response.ok) {
            console.warn(`Failed to fetch from r/${subreddit}: ${response.status}`)
            continue
          }

          const data = await response.json()
          const posts = data.data?.children || []

          // Filter posts by keywords if configured
          let relevantPosts = posts.map((child: any) => child.data)

          if (this.config.keywords.length > 0) {
            relevantPosts = relevantPosts.filter((post: any) => {
              const text = `${post.title} ${post.selftext || ''}`.toLowerCase()
              return this.config.keywords.some(keyword => 
                text.includes(keyword.toLowerCase())
              )
            })
          }

          // Add additional fields for processing
          const enrichedPosts = relevantPosts.map((post: any) => ({
            ...post,
            author_karma: post.author_flair_text || 0, // Approximate - Reddit doesn't expose karma in API
            permalink: `https://reddit.com${post.permalink}`,
            upvote_ratio: post.upvote_ratio || 1
          }))

          allPosts.push(...enrichedPosts)
          console.log(`Collected ${enrichedPosts.length} posts from r/${subreddit}`)

          // Rate limiting - Reddit allows 60 requests per minute
          await new Promise(resolve => setTimeout(resolve, 1100))
        } catch (error) {
          console.error(`Error collecting from r/${subreddit}:`, error)
          continue
        }
      }

      console.log(`Reddit API returned ${allPosts.length} total posts`)
      return allPosts
    } catch (error) {
      console.error('Reddit collection error:', error)
      return []
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Starting Reddit collector...')
    console.log(`Subreddits: ${this.config.subreddits.join(', ')}`)
    console.log(`Keywords: ${this.config.keywords.join(', ')}`)
    console.log(`Interval: ${this.config.interval}s`)

    const collect = async () => {
      if (!this.isRunning) return

      try {
        const posts = await this.collectPosts()
        console.log(`Collected ${posts.length} Reddit posts`)
        
        if (posts.length > 0) {
          // Store raw posts in database
          await this.dataProcessor.storeRawPosts(posts, 'reddit')
          
          // Process posts into opportunities
          const opportunitiesCreated = await this.dataProcessor.processRawPosts()
          console.log(`Created ${opportunitiesCreated} opportunities from Reddit posts`)
        }
      } catch (error) {
        console.error('Reddit collection cycle error:', error)
      }

      // Schedule next collection
      if (this.isRunning) {
        setTimeout(collect, this.config.interval * 1000)
      }
    }

    // Start first collection
    collect()
  }

  stop(): void {
    this.isRunning = false
    this.accessToken = null
    this.tokenExpiry = 0
    console.log('Reddit collector stopped')
  }

  /**
   * Collect posts once (for manual testing or API endpoints)
   */
  async collectOnce(): Promise<{ posts: number; opportunities: number }> {
    try {
      const posts = await this.collectPosts()
      
      if (posts.length > 0) {
        await this.dataProcessor.storeRawPosts(posts, 'reddit')
        const opportunities = await this.dataProcessor.processRawPosts()
        
        return { posts: posts.length, opportunities }
      }
      
      return { posts: 0, opportunities: 0 }
    } catch (error) {
      console.error('Error in Reddit one-time collection:', error)
      throw error
    }
  }
}