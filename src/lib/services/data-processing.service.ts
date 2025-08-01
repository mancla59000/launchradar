import { createClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types'
import { PersonalScoringService } from './scoring.service'
import { config } from '../config'

type RawPost = Database['raw_data']['Tables']['posts']['Insert']
type Opportunity = Database['public']['Tables']['opportunities']['Insert']

export class DataProcessingService {
  private supabase
  private scoringService: PersonalScoringService

  constructor() {
    // Use service role key for backend operations
    this.supabase = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
    this.scoringService = new PersonalScoringService()
  }

  /**
   * Store raw social media posts in the database
   */
  async storeRawPosts(posts: any[], source: 'twitter' | 'reddit'): Promise<void> {
    try {
      const rawPosts: RawPost[] = posts.map(post => {
        if (source === 'twitter') {
          return {
            source: 'twitter',
            external_id: post.id,
            content: post.text,
            author: post.author_id || 'unknown',
            engagement_metrics: post.public_metrics || {},
            raw_metadata: {
              created_at: post.created_at,
              author: post.author || {},
              referenced_tweets: post.referenced_tweets || []
            }
          }
        } else {
          return {
            source: 'reddit',
            external_id: post.id,
            content: `${post.title}\n\n${post.selftext || ''}`,
            author: post.author || 'unknown',
            engagement_metrics: {
              score: post.score || 0,
              num_comments: post.num_comments || 0,
              upvote_ratio: post.upvote_ratio || 0
            },
            raw_metadata: {
              subreddit: post.subreddit,
              url: post.url,
              created_utc: post.created_utc,
              permalink: post.permalink,
              is_self: post.is_self || false
            }
          }
        }
      })

      // Use upsert to handle duplicates gracefully
      const { error } = await this.supabase
        .from('posts')
        .upsert(rawPosts, { 
          onConflict: 'source,external_id',
          ignoreDuplicates: true 
        })

      if (error) {
        console.error('Error storing raw posts:', error)
        throw error
      }

      console.log(`Stored ${rawPosts.length} raw ${source} posts`)
    } catch (error) {
      console.error(`Failed to store raw ${source} posts:`, error)
      throw error
    }
  }

  /**
   * Process unprocessed raw posts into opportunities
   */
  async processRawPosts(): Promise<number> {
    try {
      // Get unprocessed posts
      const { data: unprocessedPosts, error: fetchError } = await this.supabase
        .from('posts')
        .select('*')
        .is('processed_at', null)
        .order('created_at', { ascending: true })
        .limit(100) // Process in batches

      if (fetchError) {
        console.error('Error fetching unprocessed posts:', fetchError)
        throw fetchError
      }

      if (!unprocessedPosts || unprocessedPosts.length === 0) {
        console.log('No unprocessed posts found')
        return 0
      }

      const opportunities: Opportunity[] = []
      const processedPostIds: string[] = []

      // Score and convert posts to opportunities
      for (const post of unprocessedPosts) {
        try {
          const rawPostData = {
            ...post.raw_metadata,
            id: post.external_id,
            text: post.content,
            author_id: post.author,
            public_metrics: post.engagement_metrics,
            // Reddit specific fields
            title: post.raw_metadata?.title || post.content.split('\n')[0],
            selftext: post.raw_metadata?.selftext || '',
            score: post.engagement_metrics?.score,
            num_comments: post.engagement_metrics?.num_comments,
            subreddit: post.raw_metadata?.subreddit,
            created_utc: post.raw_metadata?.created_utc,
            author: post.author,
            url: post.raw_metadata?.url
          }

          const scoredOpportunity = this.scoringService.scorePost(rawPostData, post.source)

          if (scoredOpportunity && scoredOpportunity.score >= config.collection.minimumEngagementScore) {
            opportunities.push({
              ...scoredOpportunity,
              metadata: {
                ...scoredOpportunity.metadata,
                source_post_id: post.id,
                external_id: post.external_id
              }
            })
          }

          processedPostIds.push(post.id)
        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error)
          // Mark as processed even if it failed to avoid reprocessing
          processedPostIds.push(post.id)
        }
      }

      // Store opportunities
      if (opportunities.length > 0) {
        const { error: insertError } = await this.supabase
          .from('opportunities')
          .insert(opportunities)

        if (insertError) {
          console.error('Error inserting opportunities:', insertError)
          throw insertError
        }

        console.log(`Created ${opportunities.length} opportunities from ${unprocessedPosts.length} posts`)
      }

      // Mark posts as processed
      const { error: updateError } = await this.supabase
        .from('posts')
        .update({ processed_at: new Date().toISOString() })
        .in('id', processedPostIds)

      if (updateError) {
        console.error('Error marking posts as processed:', updateError)
        throw updateError
      }

      return opportunities.length
    } catch (error) {
      console.error('Failed to process raw posts:', error)
      throw error
    }
  }

  /**
   * Get opportunities with filtering and pagination
   */
  async getOpportunities(options: {
    page?: number
    limit?: number
    minScore?: number
    category?: string
    tags?: string[]
    source?: string
    sortBy?: 'score' | 'created_at' | 'discovered_at'
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    try {
      console.log('DataProcessingService.getOpportunities called with options:', options);
      console.log('Supabase URL configured, proceeding with query...');
      
      const {
        page = 1,
        limit = 20,
        minScore,
        category,
        tags,
        source,
        sortBy = 'score',
        sortOrder = 'desc'
      } = options

      console.log('Building query for opportunities table...');
      let query = this.supabase
        .from('opportunities')
        .select('*', { count: 'exact' })

      // Apply filters
      if (minScore !== undefined) {
        query = query.gte('score', minScore)
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (tags && tags.length > 0) {
        query = query.overlaps('personal_tags', tags)
      }

      if (source) {
        query = query.eq('source', source)
      }

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1)

      console.log('Executing Supabase query...');
      const { data, error, count } = await query

      console.log('Supabase query result:', { 
        dataLength: data?.length || 0, 
        error: error?.message || null, 
        count 
      });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Failed to get opportunities:', error)
      throw error
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats() {
    try {
      const [
        { count: totalPosts },
        { count: unprocessedPosts },
        { count: totalOpportunities },
        { data: recentOpportunities }
      ] = await Promise.all([
        this.supabase.from('posts').select('*', { count: 'exact', head: true }),
        this.supabase.from('posts').select('*', { count: 'exact', head: true }).is('processed_at', null),
        this.supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        this.supabase
          .from('opportunities')
          .select('score, created_at')
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      // Calculate average score of recent opportunities
      const avgScore = recentOpportunities?.length 
        ? recentOpportunities.reduce((sum, opp) => sum + (opp.score || 0), 0) / recentOpportunities.length
        : 0

      return {
        totalPosts: totalPosts || 0,
        unprocessedPosts: unprocessedPosts || 0,
        totalOpportunities: totalOpportunities || 0,
        processingRate: totalPosts ? ((totalPosts - (unprocessedPosts || 0)) / totalPosts * 100) : 0,
        averageScore: Math.round(avgScore),
        lastProcessedAt: recentOpportunities?.[0]?.created_at || null
      }
    } catch (error) {
      console.error('Failed to get processing stats:', error)
      throw error
    }
  }

  /**
   * Clean up old processed posts to save storage
   */
  async cleanupOldPosts(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { count, error } = await this.supabase
        .from('posts')
        .delete({ count: 'exact' })
        .lt('created_at', cutoffDate.toISOString())
        .not('processed_at', 'is', null) // Only delete processed posts

      if (error) {
        console.error('Error cleaning up old posts:', error)
        throw error
      }

      console.log(`Cleaned up ${count || 0} old posts`)
      return count || 0
    } catch (error) {
      console.error('Failed to cleanup old posts:', error)
      throw error
    }
  }
}