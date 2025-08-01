import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '../supabase/types'

type ResearchNote = Database['public']['Tables']['research_notes']['Row']
type ResearchNoteInsert = Database['public']['Tables']['research_notes']['Insert']
type ResearchNoteUpdate = Database['public']['Tables']['research_notes']['Update']

export class ResearchNotesService {
  private supabase

  constructor() {
    this.supabase = createServerComponentClient<Database>({ cookies })
  }

  /**
   * Create a new research note
   */
  async createNote(note: Omit<ResearchNoteInsert, 'user_id'>): Promise<ResearchNote> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('research_notes')
        .insert({
          ...note,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating research note:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to create research note:', error)
      throw error
    }
  }

  /**
   * Get all research notes for the current user
   */
  async getNotes(options: {
    opportunityId?: string
    tags?: string[]
    search?: string
    page?: number
    limit?: number
    sortBy?: 'created_at' | 'updated_at' | 'title'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{
    data: ResearchNote[]
    count: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const {
        opportunityId,
        tags,
        search,
        page = 1,
        limit = 20,
        sortBy = 'updated_at',
        sortOrder = 'desc'
      } = options

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      let query = this.supabase
        .from('research_notes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Apply filters
      if (opportunityId) {
        query = query.eq('opportunity_id', opportunityId)
      }

      if (tags && tags.length > 0) {
        query = query.overlaps('tags', tags)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      }

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching research notes:', error)
        throw error
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Failed to get research notes:', error)
      throw error
    }
  }

  /**
   * Get a specific research note by ID
   */
  async getNote(id: string): Promise<ResearchNote | null> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('research_notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Note not found
        }
        console.error('Error fetching research note:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to get research note:', error)
      throw error
    }
  }

  /**
   * Update a research note
   */
  async updateNote(id: string, updates: ResearchNoteUpdate): Promise<ResearchNote> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('research_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating research note:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to update research note:', error)
      throw error
    }
  }

  /**
   * Delete a research note
   */
  async deleteNote(id: string): Promise<void> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { error } = await this.supabase
        .from('research_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting research note:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to delete research note:', error)
      throw error
    }
  }

  /**
   * Get all unique tags used by the current user
   */
  async getTags(): Promise<string[]> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('research_notes')
        .select('tags')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching tags:', error)
        throw error
      }

      // Extract and flatten all unique tags
      const allTags = new Set<string>()
      data?.forEach(note => {
        note.tags?.forEach((tag: string) => allTags.add(tag))
      })

      return Array.from(allTags).sort()
    } catch (error) {
      console.error('Failed to get tags:', error)
      throw error
    }
  }

  /**
   * Get research notes statistics for the current user
   */
  async getStats(): Promise<{
    totalNotes: number
    totalTags: number
    notesThisWeek: number
    notesThisMonth: number
    topTags: Array<{ tag: string; count: number }>
  }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const [
        { count: totalNotes },
        { count: notesThisWeek },
        { count: notesThisMonth },
        { data: allNotes }
      ] = await Promise.all([
        this.supabase
          .from('research_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
          
        this.supabase
          .from('research_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString()),
          
        this.supabase
          .from('research_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneMonthAgo.toISOString()),
          
        this.supabase
          .from('research_notes')
          .select('tags')
          .eq('user_id', user.id)
      ])

      // Calculate tag statistics
      const tagCounts = new Map<string, number>()
      allNotes?.forEach(note => {
        note.tags?.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      })

      const topTags = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalNotes: totalNotes || 0,
        totalTags: tagCounts.size,
        notesThisWeek: notesThisWeek || 0,
        notesThisMonth: notesThisMonth || 0,
        topTags
      }
    } catch (error) {
      console.error('Failed to get notes stats:', error)
      throw error
    }
  }
}