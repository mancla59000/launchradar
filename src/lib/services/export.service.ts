import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '../supabase/types'

type Opportunity = Database['public']['Tables']['opportunities']['Row']
type ResearchNote = Database['public']['Tables']['research_notes']['Row']

export class ExportService {
  private supabase

  constructor() {
    this.supabase = createServerComponentClient<Database>({ cookies })
  }

  /**
   * Convert array of objects to CSV format
   */
  private arrayToCsv(data: any[]): string {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          // Handle strings with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ''
        }).join(',')
      )
    ].join('\n')

    return csvContent
  }

  /**
   * Export opportunities data
   */
  async exportOpportunities(format: 'csv' | 'json', options: {
    minScore?: number
    category?: string
    source?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
  } = {}): Promise<{ data: string; filename: string; contentType: string }> {
    try {
      let query = this.supabase
        .from('opportunities')
        .select('*')
        .order('score', { ascending: false })

      // Apply filters
      if (options.minScore !== undefined) {
        query = query.gte('score', options.minScore)
      }

      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.source) {
        query = query.eq('source', options.source)
      }

      if (options.dateFrom) {
        query = query.gte('discovered_at', options.dateFrom)
      }

      if (options.dateTo) {
        query = query.lte('discovered_at', options.dateTo)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching opportunities for export:', error)
        throw error
      }

      const opportunities = data || []

      // Flatten complex objects for export
      const flattenedData = opportunities.map(opp => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        source: opp.source,
        score: opp.score,
        category: opp.category,
        personal_tags: opp.personal_tags?.join('; ') || '',
        discovered_at: opp.discovered_at,
        created_at: opp.created_at,
        // Flatten engagement data
        engagement_score: opp.engagement_data?.score || opp.engagement_data?.retweet_count || 0,
        engagement_comments: opp.engagement_data?.num_comments || opp.engagement_data?.reply_count || 0,
        engagement_likes: opp.engagement_data?.like_count || 0,
        // Metadata
        source_url: opp.metadata?.url || opp.metadata?.permalink || '',
        author: opp.metadata?.author || '',
        subreddit: opp.metadata?.subreddit || '',
        scoring_breakdown: JSON.stringify(opp.metadata?.scoring_breakdown || {})
      }))

      const timestamp = new Date().toISOString().split('T')[0]

      if (format === 'csv') {
        return {
          data: this.arrayToCsv(flattenedData),
          filename: `launchradar-opportunities-${timestamp}.csv`,
          contentType: 'text/csv'
        }
      } else {
        return {
          data: JSON.stringify({
            exportedAt: new Date().toISOString(),
            totalRecords: flattenedData.length,
            filters: options,
            data: flattenedData
          }, null, 2),
          filename: `launchradar-opportunities-${timestamp}.json`,
          contentType: 'application/json'
        }
      }

    } catch (error) {
      console.error('Failed to export opportunities:', error)
      throw error
    }
  }

  /**
   * Export research notes data
   */
  async exportResearchNotes(format: 'csv' | 'json', options: {
    tags?: string[]
    dateFrom?: string
    dateTo?: string
    limit?: number
  } = {}): Promise<{ data: string; filename: string; contentType: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      let query = this.supabase
        .from('research_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      // Apply filters
      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags)
      }

      if (options.dateFrom) {
        query = query.gte('created_at', options.dateFrom)
      }

      if (options.dateTo) {
        query = query.lte('created_at', options.dateTo)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching research notes for export:', error)
        throw error
      }

      const notes = data || []

      // Flatten data for export
      const flattenedData = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags?.join('; ') || '',
        opportunity_id: note.opportunity_id || '',
        created_at: note.created_at,
        updated_at: note.updated_at
      }))

      const timestamp = new Date().toISOString().split('T')[0]

      if (format === 'csv') {
        return {
          data: this.arrayToCsv(flattenedData),
          filename: `launchradar-notes-${timestamp}.csv`,
          contentType: 'text/csv'
        }
      } else {
        return {
          data: JSON.stringify({
            exportedAt: new Date().toISOString(),
            totalRecords: flattenedData.length,
            filters: options,
            data: flattenedData
          }, null, 2),
          filename: `launchradar-notes-${timestamp}.json`,
          contentType: 'application/json'
        }
      }

    } catch (error) {
      console.error('Failed to export research notes:', error)
      throw error
    }
  }

  /**
   * Export complete data dump (opportunities + notes)
   */
  async exportComplete(format: 'json'): Promise<{ data: string; filename: string; contentType: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Fetch all data
      const [
        { data: opportunities },
        { data: notes }
      ] = await Promise.all([
        this.supabase
          .from('opportunities')
          .select('*')
          .order('score', { ascending: false }),
        this.supabase
          .from('research_notes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
      ])

      const timestamp = new Date().toISOString().split('T')[0]

      const completeData = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        summary: {
          totalOpportunities: opportunities?.length || 0,
          totalResearchNotes: notes?.length || 0
        },
        opportunities: opportunities || [],
        researchNotes: notes || []
      }

      return {
        data: JSON.stringify(completeData, null, 2),
        filename: `launchradar-complete-${timestamp}.json`,
        contentType: 'application/json'
      }

    } catch (error) {
      console.error('Failed to export complete data:', error)
      throw error
    }
  }

  /**
   * Get export statistics
   */
  async getExportStats(): Promise<{
    totalOpportunities: number
    totalNotes: number
    dataSize: {
      opportunities: string
      notes: string
      total: string
    }
  }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const [
        { count: opportunitiesCount },
        { count: notesCount }
      ] = await Promise.all([
        this.supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true }),
        this.supabase
          .from('research_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ])

      // Estimate data sizes (rough calculation)
      const avgOpportunitySize = 2000 // bytes
      const avgNoteSize = 1000 // bytes
      
      const opportunitiesSize = (opportunitiesCount || 0) * avgOpportunitySize
      const notesSize = (notesCount || 0) * avgNoteSize
      const totalSize = opportunitiesSize + notesSize

      const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      }

      return {
        totalOpportunities: opportunitiesCount || 0,
        totalNotes: notesCount || 0,
        dataSize: {
          opportunities: formatBytes(opportunitiesSize),
          notes: formatBytes(notesSize),
          total: formatBytes(totalSize)
        }
      }

    } catch (error) {
      console.error('Failed to get export stats:', error)
      throw error
    }
  }
}