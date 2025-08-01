import { DataProcessingService } from '../services/data-processing.service'
import { config } from '../config'

interface TwitterCollectorConfig {
  bearerToken: string
  keywords: string[]
  maxResults: number
  interval: number
}

interface TwitterPost {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  author?: {
    id: string
    username: string
    name: string
    verified: boolean
    public_metrics?: {
      followers_count: number
      following_count: number
    }
  }
  referenced_tweets?: any[]
}

export class TwitterCollector {
  private config: TwitterCollectorConfig
  private isRunning = false
  private dataProcessor: DataProcessingService

  constructor(collectorConfig?: Partial<TwitterCollectorConfig>) {
    this.config = {
      bearerToken: config.twitter.bearerToken,
      keywords: collectorConfig?.keywords || config.collection.keywords,
      maxResults: collectorConfig?.maxResults || config.collection.maxPostsPerCollection,
      interval: collectorConfig?.interval || config.collection.intervalMinutes * 60, // Convert to seconds
    }
    this.dataProcessor = new DataProcessingService()
  }

  async collectPosts(): Promise<TwitterPost[]> {
    if (!this.config.keywords.length) {
      console.warn('No keywords configured for Twitter collection')
      return []
    }

    const searchParams = new URLSearchParams({
      query: this.config.keywords.join(' OR '),
      max_results: Math.min(this.config.maxResults, 100).toString(), // Twitter API limit
      'tweet.fields': 'created_at,public_metrics,author_id,referenced_tweets',
      'user.fields': 'username,name,verified,public_metrics',
      'expansions': 'author_id'
    })

    try {
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.bearerToken}`,
            'User-Agent': 'LaunchRadar/1.0'
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Twitter API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Handle Twitter API v2 response structure
      const tweets = data.data || []
      const users = data.includes?.users || []
      
      // Map user data to tweets
      const tweetsWithAuthors = tweets.map((tweet: any) => ({
        ...tweet,
        author: users.find((user: any) => user.id === tweet.author_id)
      }))

      console.log(`Twitter API returned ${tweetsWithAuthors.length} tweets`)
      return tweetsWithAuthors
    } catch (error) {
      console.error('Twitter collection error:', error)
      
      // Handle rate limiting gracefully
      if (error instanceof Error && error.message.includes('429')) {
        console.log('Twitter API rate limit hit, will retry later')
      }
      
      return []
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log('Starting Twitter collector...')
    console.log(`Keywords: ${this.config.keywords.join(', ')}`)
    console.log(`Interval: ${this.config.interval}s, Max results: ${this.config.maxResults}`)

    const collect = async () => {
      if (!this.isRunning) return

      try {
        const posts = await this.collectPosts()
        console.log(`Collected ${posts.length} Twitter posts`)
        
        if (posts.length > 0) {
          // Store raw posts in database
          await this.dataProcessor.storeRawPosts(posts, 'twitter')
          
          // Process posts into opportunities
          const opportunitiesCreated = await this.dataProcessor.processRawPosts()
          console.log(`Created ${opportunitiesCreated} opportunities from Twitter posts`)
        }
      } catch (error) {
        console.error('Twitter collection cycle error:', error)
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
    console.log('Twitter collector stopped')
  }

  /**
   * Collect posts once (for manual testing or API endpoints)
   */
  async collectOnce(): Promise<{ posts: number; opportunities: number }> {
    try {
      const posts = await this.collectPosts()
      
      if (posts.length > 0) {
        await this.dataProcessor.storeRawPosts(posts, 'twitter')
        const opportunities = await this.dataProcessor.processRawPosts()
        
        return { posts: posts.length, opportunities }
      }
      
      return { posts: 0, opportunities: 0 }
    } catch (error) {
      console.error('Error in Twitter one-time collection:', error)
      throw error
    }
  }
}