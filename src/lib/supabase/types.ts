export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          preferences: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          preferences?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          preferences?: Record<string, any>
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          title: string
          description: string
          source: string
          score: number | null
          category: string
          personal_tags: string[]
          engagement_data: Record<string, any>
          metadata: Record<string, any>
          discovered_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          source: string
          score?: number | null
          category: string
          personal_tags?: string[]
          engagement_data: Record<string, any>
          metadata?: Record<string, any>
          discovered_at: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          source?: string
          score?: number | null
          category?: string
          personal_tags?: string[]
          engagement_data?: Record<string, any>
          metadata?: Record<string, any>
        }
      }
      research_notes: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string | null
          title: string
          content: string
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id?: string | null
          title: string
          content: string
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          tags?: string[]
          updated_at?: string
        }
      }
    }
  }
  raw_data: {
    Tables: {
      posts: {
        Row: {
          id: string
          source: 'twitter' | 'reddit'
          external_id: string
          content: string
          author: string
          engagement_metrics: Record<string, any>
          raw_metadata: Record<string, any> | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          source: 'twitter' | 'reddit'
          external_id: string
          content: string
          author: string
          engagement_metrics: Record<string, any>
          raw_metadata?: Record<string, any> | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          processed_at?: string | null
        }
      }
    }
  }
}