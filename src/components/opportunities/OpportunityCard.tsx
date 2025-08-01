'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, ExternalLink, MessageSquare, Heart, Share, TrendingUp } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type OpportunityType = Database['public']['Tables']['opportunities']['Row']

interface OpportunityCardProps {
  opportunity: OpportunityType
  onUpdateNotes?: (id: string, notes: string) => void
  onAddTag?: (id: string, tag: string) => void
  onRemoveTag?: (id: string, tag: string) => void
}

export function OpportunityCard({ 
  opportunity, 
  onUpdateNotes, 
  onAddTag, 
  onRemoveTag 
}: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [newTag, setNewTag] = useState('')

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number | null) => {
    if (!score) return 'bg-gray-100'
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const handleSaveNotes = () => {
    if (onUpdateNotes && notes.trim()) {
      onUpdateNotes(opportunity.id, notes)
    }
    setIsEditingNotes(false)
    setNotes('')
  }

  const handleAddTag = () => {
    if (onAddTag && newTag.trim()) {
      onAddTag(opportunity.id, newTag.trim())
      setNewTag('')
    }
  }

  const formatEngagementData = (data: Record<string, any>) => {
    const { likes = 0, comments = 0, shares = 0, replies = 0 } = data
    return { likes, comments, shares, replies }
  }

  const engagement = formatEngagementData(opportunity.engagement_data)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight mb-2">
              {opportunity.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                {opportunity.source}
              </Badge>
              <Badge variant="secondary">
                {opportunity.category}
              </Badge>
              <span>•</span>
              <span>{format(new Date(opportunity.discovered_at), 'MMM dd, yyyy')}</span>
            </div>
          </div>
          <div className={`ml-4 flex-shrink-0 px-3 py-1 rounded-full ${getScoreBackground(opportunity.score)}`}>
            <span className={`text-sm font-bold ${getScoreColor(opportunity.score)}`}>
              {opportunity.score ? `${opportunity.score}/100` : 'N/A'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {opportunity.description}
            </p>
            {opportunity.description.length > 150 && (
              <Button
                variant="ghost"
                size="sm" 
                className="h-6 px-0 text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Engagement Metrics */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{engagement.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{engagement.comments || engagement.replies}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              <span>{engagement.shares}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className={getScoreColor(opportunity.score)}>
                Score: {opportunity.score || 'Unscored'}
              </span>
            </div>
          </div>

          {/* Personal Tags */}
          {opportunity.personal_tags && opportunity.personal_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {opportunity.personal_tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="success"
                  className="text-xs cursor-pointer hover:bg-green-200"
                  onClick={() => onRemoveTag?.(opportunity.id, tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}

          {/* Add new tag input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add personal tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="text-xs h-8"
            >
              Add Tag
            </Button>
          </div>

          {/* Notes Section */}
          <div className="border-t pt-3">
            {!isEditingNotes ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-6"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Add research notes
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add your research notes, insights, or analysis..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsEditingNotes(false)
                      setNotes('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Source
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <BookOpen className="h-3 w-3 mr-1" />
              Research
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}