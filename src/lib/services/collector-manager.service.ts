import { TwitterCollector } from '../collectors/twitter'
import { RedditCollector } from '../collectors/reddit'
import { DataProcessingService } from './data-processing.service'

interface CollectorStatus {
  twitter: {
    isRunning: boolean
    lastCollection: string | null
    totalCollected: number
  }
  reddit: {
    isRunning: boolean
    lastCollection: string | null
    totalCollected: number
  }
}

export class CollectorManagerService {
  private twitterCollector: TwitterCollector
  private redditCollector: RedditCollector
  private dataProcessor: DataProcessingService
  private status: CollectorStatus = {
    twitter: { isRunning: false, lastCollection: null, totalCollected: 0 },
    reddit: { isRunning: false, lastCollection: null, totalCollected: 0 }
  }

  constructor() {
    this.twitterCollector = new TwitterCollector()
    this.redditCollector = new RedditCollector()
    this.dataProcessor = new DataProcessingService()
  }

  /**
   * Start Twitter collector
   */
  async startTwitter(): Promise<void> {
    if (this.status.twitter.isRunning) {
      throw new Error('Twitter collector is already running')
    }

    try {
      await this.twitterCollector.start()
      this.status.twitter.isRunning = true
      console.log('Twitter collector started successfully')
    } catch (error) {
      console.error('Failed to start Twitter collector:', error)
      throw error
    }
  }

  /**
   * Stop Twitter collector
   */
  stopTwitter(): void {
    this.twitterCollector.stop()
    this.status.twitter.isRunning = false
    console.log('Twitter collector stopped')
  }

  /**
   * Start Reddit collector
   */
  async startReddit(): Promise<void> {
    if (this.status.reddit.isRunning) {
      throw new Error('Reddit collector is already running')
    }

    try {
      await this.redditCollector.start()
      this.status.reddit.isRunning = true
      console.log('Reddit collector started successfully')
    } catch (error) {
      console.error('Failed to start Reddit collector:', error)
      throw error
    }
  }

  /**
   * Stop Reddit collector
   */
  stopReddit(): void {
    this.redditCollector.stop()
    this.status.reddit.isRunning = false
    console.log('Reddit collector stopped')
  }

  /**
   * Start all collectors
   */
  async startAll(): Promise<void> {
    const results = await Promise.allSettled([
      this.startTwitter(),
      this.startReddit()
    ])

    const failures = results
      .map((result, index) => ({ result, service: index === 0 ? 'Twitter' : 'Reddit' }))
      .filter(({ result }) => result.status === 'rejected')

    if (failures.length > 0) {
      const errors = failures.map(({ service, result }) => 
        `${service}: ${(result as PromiseRejectedResult).reason}`
      )
      console.warn('Some collectors failed to start:', errors.join(', '))
    }

    console.log('Collection services initialization completed')
  }

  /**
   * Stop all collectors
   */
  stopAll(): void {
    this.stopTwitter()
    this.stopReddit()
    console.log('All collectors stopped')
  }

  /**
   * Get collector status
   */
  async getStatus(): Promise<CollectorStatus & { 
    processing: { 
      totalPosts: number
      unprocessedPosts: number
      totalOpportunities: number
      processingRate: number
    }
  }> {
    try {
      const processingStats = await this.dataProcessor.getProcessingStats()
      
      return {
        ...this.status,
        processing: {
          totalPosts: processingStats.totalPosts,
          unprocessedPosts: processingStats.unprocessedPosts,
          totalOpportunities: processingStats.totalOpportunities,
          processingRate: processingStats.processingRate
        }
      }
    } catch (error) {
      console.error('Failed to get processing stats:', error)
      return {
        ...this.status,
        processing: {
          totalPosts: 0,
          unprocessedPosts: 0,
          totalOpportunities: 0,
          processingRate: 0
        }
      }
    }
  }

  /**
   * Collect once from all sources
   */
  async collectOnce(): Promise<{
    twitter: { posts: number; opportunities: number }
    reddit: { posts: number; opportunities: number }
    total: { posts: number; opportunities: number }
  }> {
    try {
      const [twitterResult, redditResult] = await Promise.allSettled([
        this.twitterCollector.collectOnce(),
        this.redditCollector.collectOnce()
      ])

      const twitter = twitterResult.status === 'fulfilled' 
        ? twitterResult.value 
        : { posts: 0, opportunities: 0 }

      const reddit = redditResult.status === 'fulfilled' 
        ? redditResult.value 
        : { posts: 0, opportunities: 0 }

      // Update status
      if (twitter.posts > 0) {
        this.status.twitter.lastCollection = new Date().toISOString()
        this.status.twitter.totalCollected += twitter.posts
      }

      if (reddit.posts > 0) {
        this.status.reddit.lastCollection = new Date().toISOString()
        this.status.reddit.totalCollected += reddit.posts
      }

      return {
        twitter,
        reddit,
        total: {
          posts: twitter.posts + reddit.posts,
          opportunities: twitter.opportunities + reddit.opportunities
        }
      }
    } catch (error) {
      console.error('Failed to collect from all sources:', error)
      throw error
    }
  }

  /**
   * Process any unprocessed posts
   */
  async processUnprocessed(): Promise<number> {
    try {
      return await this.dataProcessor.processRawPosts()
    } catch (error) {
      console.error('Failed to process unprocessed posts:', error)
      throw error
    }
  }

  /**
   * Clean up old processed posts
   */
  async cleanup(daysToKeep: number = 30): Promise<number> {
    try {
      return await this.dataProcessor.cleanupOldPosts(daysToKeep)
    } catch (error) {
      console.error('Failed to cleanup old posts:', error)
      throw error
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy'
    services: {
      twitter: 'healthy' | 'unhealthy'
      reddit: 'healthy' | 'unhealthy'
      database: 'healthy' | 'unhealthy'
    }
    issues: string[]
  }> {
    const issues: string[] = []
    const services = {
      twitter: 'healthy' as 'healthy' | 'unhealthy',
      reddit: 'healthy' as 'healthy' | 'unhealthy',
      database: 'healthy' as 'healthy' | 'unhealthy'
    }

    try {
      // Test Twitter API
      try {
        await this.twitterCollector.collectPosts()
      } catch (error) {
        services.twitter = 'unhealthy'
        issues.push(`Twitter API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Test Reddit API
      try {
        await this.redditCollector.collectPosts()
      } catch (error) {
        services.reddit = 'unhealthy'
        issues.push(`Reddit API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Test Database
      try {
        await this.dataProcessor.getProcessingStats()
      } catch (error) {
        services.database = 'unhealthy'
        issues.push(`Database: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      const healthyServices = Object.values(services).filter(status => status === 'healthy').length
      const totalServices = Object.keys(services).length

      let overall: 'healthy' | 'degraded' | 'unhealthy'
      if (healthyServices === totalServices) {
        overall = 'healthy'
      } else if (healthyServices > 0) {
        overall = 'degraded'
      } else {
        overall = 'unhealthy'
      }

      return { overall, services, issues }
    } catch (error) {
      return {
        overall: 'unhealthy',
        services,
        issues: [...issues, `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }
}