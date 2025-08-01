interface ScoringMetrics {
  engagement: number
  relevance: number
  freshness: number
  authority: number
}

interface ScoredOpportunity {
  title: string
  description: string
  source: string
  score: number
  category: string
  personal_tags: string[]
  engagement_data: Record<string, any>
  metadata: Record<string, any>
  discovered_at: string
}

export class PersonalScoringService {
  // Keywords that indicate high-value opportunities
  private readonly highValueKeywords = [
    'validation', 'mvp', 'product-market fit', 'pmf', 'traction',
    'revenue', 'mrr', 'arr', 'customers', 'users', 'growth',
    'launch', 'beta', 'feedback', 'pain point', 'problem',
    'solution', 'market opportunity', 'niche', 'underserved'
  ]

  // Keywords that indicate specific business models
  private readonly businessModelKeywords = {
    saas: ['saas', 'software as a service', 'subscription', 'recurring'],
    marketplace: ['marketplace', 'platform', 'two-sided', 'commission'],
    ecommerce: ['ecommerce', 'e-commerce', 'online store', 'dropshipping'],
    service: ['consulting', 'agency', 'freelance', 'service business'],
    content: ['course', 'ebook', 'newsletter', 'content creation'],
    tool: ['tool', 'app', 'software', 'automation', 'productivity']
  }

  private readonly negativeSignals = [
    'scam', 'pyramid', 'mlm', 'get rich quick', 'investment required',
    'pay to play', 'crypto', 'nft', 'ponzi', 'scheme'
  ]

  /**
   * Calculate engagement score based on social media metrics
   */
  private calculateEngagementScore(engagementData: Record<string, any>, source: string): number {
    let score = 0

    if (source === 'twitter') {
      const { retweet_count = 0, like_count = 0, reply_count = 0, quote_count = 0 } = engagementData
      
      // Weighted scoring for Twitter engagement
      score = (
        retweet_count * 3 +    // Retweets are most valuable
        reply_count * 2.5 +    // Replies indicate discussion
        quote_count * 2 +      // Quotes show interest
        like_count * 1         // Likes are least valuable
      ) / 10

    } else if (source === 'reddit') {
      const { score: redditScore = 0, num_comments = 0 } = engagementData
      
      // Reddit scoring based on upvotes and comments
      score = (redditScore * 2 + num_comments * 3) / 5
    }

    // Normalize to 0-100 scale (capped at reasonable engagement levels)
    return Math.min(100, Math.max(0, score))
  }

  /**
   * Calculate relevance score based on keyword matching
   */
  private calculateRelevanceScore(content: string): number {
    const lowerContent = content.toLowerCase()
    let score = 0

    // Check for high-value keywords
    const highValueMatches = this.highValueKeywords.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    ).length

    score += highValueMatches * 15 // Up to 15 points per high-value keyword

    // Check for business model indicators
    let businessModelScore = 0
    Object.entries(this.businessModelKeywords).forEach(([model, keywords]) => {
      const matches = keywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      ).length
      if (matches > 0) {
        businessModelScore += 20 // Bonus for clear business model
      }
    })

    score += Math.min(40, businessModelScore) // Cap business model bonus

    // Penalty for negative signals
    const negativeMatches = this.negativeSignals.filter(signal => 
      lowerContent.includes(signal.toLowerCase())
    ).length

    score -= negativeMatches * 25 // Heavy penalty for negative signals

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Calculate freshness score based on post age
   */
  private calculateFreshnessScore(discoveredAt: string): number {
    const now = new Date()
    const postDate = new Date(discoveredAt)
    const ageInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60)

    // Freshness decays over time
    if (ageInHours <= 1) return 100
    if (ageInHours <= 6) return 90
    if (ageInHours <= 24) return 70
    if (ageInHours <= 72) return 50
    if (ageInHours <= 168) return 30 // 1 week
    return 10
  }

  /**
   * Calculate authority score based on author metrics
   */
  private calculateAuthorityScore(metadata: Record<string, any>, source: string): number {
    let score = 50 // Base score

    if (source === 'twitter') {
      const { verified = false, followers_count = 0, following_count = 0 } = metadata
      
      if (verified) score += 20
      
      // Follower ratio scoring
      const followerRatio = followers_count / Math.max(1, following_count)
      if (followerRatio > 10) score += 20
      else if (followerRatio > 3) score += 10
      else if (followerRatio > 1) score += 5

      // Follower count bonus (diminishing returns)
      if (followers_count > 100000) score += 15
      else if (followers_count > 10000) score += 10
      else if (followers_count > 1000) score += 5

    } else if (source === 'reddit') {
      const { subreddit = '', author_karma = 0 } = metadata
      
      // Subreddit authority bonus
      const authorativeSubreddits = ['entrepreneur', 'startups', 'indiehackers', 'saas']
      if (authorativeSubreddits.includes(subreddit.toLowerCase())) {
        score += 15
      }

      // Author karma bonus
      if (author_karma > 10000) score += 15
      else if (author_karma > 1000) score += 10
      else if (author_karma > 100) score += 5
    }

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Determine opportunity category based on content analysis
   */
  private categorizeOpportunity(content: string): string {
    const lowerContent = content.toLowerCase()

    // Check business model categories
    for (const [category, keywords] of Object.entries(this.businessModelKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
        return category
      }
    }

    // Default categories based on context
    if (lowerContent.includes('idea') || lowerContent.includes('concept')) {
      return 'idea'
    }
    if (lowerContent.includes('feedback') || lowerContent.includes('review')) {
      return 'validation'
    }
    if (lowerContent.includes('help') || lowerContent.includes('advice')) {
      return 'help-request'
    }

    return 'other'
  }

  /**
   * Generate personal tags based on content analysis
   */
  private generatePersonalTags(content: string, category: string, score: number): string[] {
    const tags: string[] = []
    const lowerContent = content.toLowerCase()

    // Priority tags based on score
    if (score >= 80) tags.push('high-priority')
    else if (score >= 60) tags.push('medium-priority')
    else tags.push('low-priority')

    // Stage tags
    if (lowerContent.includes('idea') || lowerContent.includes('concept')) {
      tags.push('early-stage')
    }
    if (lowerContent.includes('mvp') || lowerContent.includes('beta')) {
      tags.push('mvp-stage')
    }
    if (lowerContent.includes('revenue') || lowerContent.includes('customers')) {
      tags.push('traction-stage')
    }

    // Business model tag
    tags.push(`bm-${category}`)

    // Opportunity type tags
    if (lowerContent.includes('pain point') || lowerContent.includes('problem')) {
      tags.push('problem-discovery')
    }
    if (lowerContent.includes('solution') || lowerContent.includes('solve')) {
      tags.push('solution-proposed')
    }
    if (lowerContent.includes('market') || lowerContent.includes('opportunity')) {
      tags.push('market-analysis')
    }

    return tags
  }

  /**
   * Main scoring function that processes raw post data into scored opportunities
   */
  public scorePost(
    rawPost: any,
    source: 'twitter' | 'reddit'
  ): ScoredOpportunity | null {
    try {
      // Extract content based on source
      let content = ''
      let title = ''
      let engagementData = {}
      let metadata = {}
      let discoveredAt = ''

      if (source === 'twitter') {
        content = rawPost.text || ''
        title = content.substring(0, 100) + (content.length > 100 ? '...' : '')
        engagementData = rawPost.public_metrics || {}
        metadata = {
          author_id: rawPost.author_id,
          verified: rawPost.author?.verified || false,
          followers_count: rawPost.author?.public_metrics?.followers_count || 0,
          following_count: rawPost.author?.public_metrics?.following_count || 0
        }
        discoveredAt = rawPost.created_at
      } else {
        content = `${rawPost.title} ${rawPost.selftext || ''}`
        title = rawPost.title
        engagementData = {
          score: rawPost.score || 0,
          num_comments: rawPost.num_comments || 0
        }
        metadata = {
          subreddit: rawPost.subreddit,
          author: rawPost.author,
          url: rawPost.url,
          author_karma: rawPost.author_karma || 0
        }
        discoveredAt = new Date(rawPost.created_utc * 1000).toISOString()
      }

      // Calculate individual scores
      const engagementScore = this.calculateEngagementScore(engagementData, source)
      const relevanceScore = this.calculateRelevanceScore(content)
      const freshnessScore = this.calculateFreshnessScore(discoveredAt)
      const authorityScore = this.calculateAuthorityScore(metadata, source)

      // Calculate weighted final score
      const finalScore = Math.round(
        relevanceScore * 0.4 +      // 40% weight on relevance
        engagementScore * 0.3 +     // 30% weight on engagement
        authorityScore * 0.2 +      // 20% weight on authority
        freshnessScore * 0.1        // 10% weight on freshness
      )

      // Skip low-quality opportunities
      if (finalScore < 20) {
        return null
      }

      const category = this.categorizeOpportunity(content)
      const personalTags = this.generatePersonalTags(content, category, finalScore)

      return {
        title: title.trim(),
        description: content.trim(),
        source,
        score: finalScore,
        category,
        personal_tags: personalTags,
        engagement_data: engagementData,
        metadata: {
          ...metadata,
          scoring_breakdown: {
            engagement: engagementScore,
            relevance: relevanceScore,
            freshness: freshnessScore,
            authority: authorityScore
          }
        },
        discovered_at: discoveredAt
      }

    } catch (error) {
      console.error('Error scoring post:', error)
      return null
    }
  }
}