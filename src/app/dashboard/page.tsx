'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { FilterPanel, type FilterOptions } from '@/components/opportunities/FilterPanel'
import { PersonalNotesEditor } from '@/components/research/PersonalNotesEditor'
import { ExportButton } from '@/components/dashboard/ExportButton'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    source: '',
    category: '',
    scoreRange: [0, 100],
    dateRange: '',
    tags: [],
    hasNotes: null
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadData(user)
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

  const loadData = async (currentUser: any = user) => {
    if (!currentUser) return
    
    try {
      // Load opportunities
      const { data: opportunitiesData, error: oppError } = await supabase
        .from('opportunities')
        .select('*')
        .order('discovered_at', { ascending: false })

      if (oppError) throw oppError
      setOpportunities(opportunitiesData || [])

      // Load research notes
      const { data: notesData, error: notesError } = await supabase
        .from('research_notes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false })

      if (notesError) throw notesError
      setNotes(notesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const updateOpportunityNotes = async (opportunityId: string, noteContent: string) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('research_notes')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          title: `Notes for ${opportunities.find(o => o.id === opportunityId)?.title || 'Opportunity'}`,
          content: noteContent,
          tags: []
        })

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const updateOpportunityTags = async (opportunityId: string, newTags: string[]) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ personal_tags: newTags })
        .eq('id', opportunityId)

      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Error updating tags:', error)
    }
  }

  const addTag = async (opportunityId: string, tag: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId)
    if (opportunity) {
      const currentTags = opportunity.personal_tags || []
      if (!currentTags.includes(tag)) {
        await updateOpportunityTags(opportunityId, [...currentTags, tag])
      }
    }
  }

  const removeTag = async (opportunityId: string, tag: string) => {
    const opportunity = opportunities.find(o => o.id === opportunityId)
    if (opportunity) {
      const currentTags = opportunity.personal_tags || []
      await updateOpportunityTags(opportunityId, currentTags.filter((t: string) => t !== tag))
    }
  }

  // Filter opportunities based on current filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Search filter
    if (filters.search && !opp.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !opp.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Source filter
    if (filters.source && opp.source !== filters.source) {
      return false
    }

    // Category filter
    if (filters.category && opp.category !== filters.category) {
      return false
    }

    // Score range filter
    if (opp.score !== null) {
      if (opp.score < filters.scoreRange[0] || opp.score > filters.scoreRange[1]) {
        return false
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const oppDate = new Date(opp.discovered_at)
      const now = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          if (oppDate.toDateString() !== now.toDateString()) return false
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (oppDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (oppDate < monthAgo) return false
          break
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          if (oppDate < quarterAgo) return false
          break
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const oppTags = opp.personal_tags || []
      if (!filters.tags.some(tag => oppTags.includes(tag))) {
        return false
      }
    }

    // Notes filter
    if (filters.hasNotes !== null) {
      const hasNotes = notes.some(note => note.opportunity_id === opp.id)
      if (filters.hasNotes !== hasNotes) {
        return false
      }
    }

    return true
  })

  // Get unique categories and tags for filters
  const availableCategories = [...new Set(opportunities.map(o => o.category).filter(Boolean))]
  const availableTags = [...new Set(opportunities.flatMap(o => o.personal_tags || []))]

  // Calculate stats
  const highScoreOpportunities = filteredOpportunities.filter(o => o.score && o.score >= 80).length
  const opportunitiesWithNotes = filteredOpportunities.filter(o => 
    notes.some(note => note.opportunity_id === o.id)
  ).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Personal Research Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredOpportunities.length}</div>
            <div className="text-xs text-muted-foreground">
              {filteredOpportunities.length !== opportunities.length && 
                `${opportunities.length} total`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High-Score Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highScoreOpportunities}</div>
            <div className="text-xs text-muted-foreground">
              Score ≥ 80
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Research Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
            <div className="text-xs text-muted-foreground">
              {opportunitiesWithNotes} opportunities researched
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {opportunities.length > 0 ? '✅' : '⚠️'}
            </div>
            <div className="text-xs text-muted-foreground">
              {opportunities.length > 0 ? 'Active' : 'Not Configured'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Filters & Export */}
        <div className="xl:col-span-1 space-y-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={availableCategories}
            availableTags={availableTags}
            opportunityCount={filteredOpportunities.length}
          />
          
          <ExportButton
            opportunities={filteredOpportunities}
            notes={notes}
          />
        </div>

        {/* Right Column - Opportunities & Notes */}
        <div className="xl:col-span-3 space-y-6">
          {/* Opportunities List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Opportunities ({filteredOpportunities.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOpportunities.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  {opportunities.length === 0 
                    ? "No opportunities found yet. Data collection will begin once configured."
                    : "No opportunities match your current filters. Try adjusting your search criteria."
                  }
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onUpdateNotes={updateOpportunityNotes}
                      onAddTag={addTag}
                      onRemoveTag={removeTag}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Research Notes */}
          <PersonalNotesEditor
            userId={user?.id}
          />
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Personal Research Tool | Current User: {user?.email}</p>
        <p>Data updates automatically when collection is configured</p>
      </div>
    </div>
  )
}