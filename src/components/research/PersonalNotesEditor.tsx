'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, Plus, Edit, Trash2, FileText, Search, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type ResearchNote = Database['public']['Tables']['research_notes']['Row']
type ResearchNoteInsert = Database['public']['Tables']['research_notes']['Insert']

interface PersonalNotesEditorProps {
  opportunityId?: string
  userId: string
  className?: string
}

export function PersonalNotesEditor({ 
  opportunityId, 
  userId, 
  className = "" 
}: PersonalNotesEditorProps) {
  const [notes, setNotes] = useState<ResearchNote[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadNotes()
  }, [opportunityId, userId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('research_notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (opportunityId) {
        query = query.eq('opportunity_id', opportunityId)
      }

      const { data, error } = await query

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      const noteData: ResearchNoteInsert = {
        user_id: userId,
        opportunity_id: opportunityId || null,
        title: title.trim(),
        content: content.trim(),
        tags: tags
      }

      if (editingId) {
        const { error } = await supabase
          .from('research_notes')
          .update({
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('research_notes')
          .insert(noteData)

        if (error) throw error
      }

      // Reset form
      setTitle('')
      setContent('')
      setTags([])
      setNewTag('')
      setIsCreating(false)
      setEditingId(null)
      
      // Reload notes
      await loadNotes()
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const editNote = (note: ResearchNote) => {
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags || [])
    setEditingId(note.id)
    setIsCreating(true)
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('research_notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const cancelEdit = () => {
    setTitle('')
    setContent('')
    setTags([])
    setNewTag('')
    setIsCreating(false)
    setEditingId(null)
  }

  // Get all unique tags from all notes for filtering
  const allTags = [...new Set(notes.flatMap(note => note.tags || []))]

  // Filter notes based on search and tags
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => note.tags?.includes(tag))
    
    return matchesSearch && matchesTags
  })

  const renderMarkdown = (text: string) => {
    // Simple markdown-like formatting for display
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>')
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading notes...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Research Notes
            <Badge variant="secondary">{notes.length}</Badge>
          </CardTitle>
          <Button 
            onClick={() => setIsCreating(true)}
            size="sm"
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filter by tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag))
                    } else {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-6 px-2 text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              
              <Textarea
                placeholder="Write your notes here... You can use *italic*, **bold**, and `code` formatting."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
              />
              
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveNote} disabled={!title.trim() || !content.trim()}>
                  <Save className="h-3 w-3 mr-1" />
                  {editingId ? 'Update' : 'Save'} Note
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes List */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {notes.length === 0 
                ? "No research notes yet. Create your first note to get started!"
                : "No notes match your search criteria."
              }
            </div>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => editNote(note)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteNote(note.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    className="text-sm text-muted-foreground mb-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
                  />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex flex-wrap gap-1">
                      {note.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span>
                      Updated {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}