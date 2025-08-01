'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, SlidersHorizontal, X, Calendar, TrendingUp, Tag } from 'lucide-react'

export interface FilterOptions {
  search: string
  source: string
  category: string
  scoreRange: [number, number]
  dateRange: string
  tags: string[]
  hasNotes: boolean | null
}

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableCategories: string[]
  availableTags: string[]
  opportunityCount: number
  className?: string
}

export function FilterPanel({
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
  opportunityCount,
  className = ""
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const addTag = (tag: string) => {
    if (!localFilters.tags.includes(tag)) {
      updateFilter('tags', [...localFilters.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter('tags', localFilters.tags.filter(t => t !== tag))
  }

  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      search: '',
      source: '',
      category: '',
      scoreRange: [0, 100],
      dateRange: '',
      tags: [],
      hasNotes: null
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.source) count++
    if (localFilters.category) count++
    if (localFilters.scoreRange[0] > 0 || localFilters.scoreRange[1] < 100) count++
    if (localFilters.dateRange) count++
    if (localFilters.tags.length > 0) count++
    if (localFilters.hasNotes !== null) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Search & Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {opportunityCount} opportunities
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
            >
              <SlidersHorizontal className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={localFilters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={localFilters.source === 'twitter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('source', localFilters.source === 'twitter' ? '' : 'twitter')}
          >
            Twitter
          </Button>
          <Button
            variant={localFilters.source === 'reddit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('source', localFilters.source === 'reddit' ? '' : 'reddit')}
          >
            Reddit
          </Button>
          <Button
            variant={localFilters.scoreRange[0] >= 80 ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('scoreRange', 
              localFilters.scoreRange[0] >= 80 ? [0, 100] : [80, 100]
            )}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            High Score
          </Button>
          <Button
            variant={localFilters.hasNotes === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('hasNotes', 
              localFilters.hasNotes === true ? null : true
            )}
          >
            With Notes
          </Button>
        </div>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={localFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            {/* Score Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Score Range: {localFilters.scoreRange[0]} - {localFilters.scoreRange[1]}
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localFilters.scoreRange[0]}
                  onChange={(e) => updateFilter('scoreRange', 
                    [parseInt(e.target.value), localFilters.scoreRange[1]]
                  )}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localFilters.scoreRange[1]}
                  onChange={(e) => updateFilter('scoreRange', 
                    [localFilters.scoreRange[0], parseInt(e.target.value)]
                  )}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <Select
                value={localFilters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </Select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Tag className="h-4 w-4 inline mr-1" />
                Filter by Tags
              </label>
              
              {/* Selected Tags */}
              {localFilters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {localFilters.tags.map(tag => (
                    <Badge 
                      key={tag}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Available Tags */}
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter(tag => !localFilters.tags.includes(tag))
                  .map(tag => (
                    <Badge 
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Notes Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Research Status</label>
              <div className="flex gap-2">
                <Button
                  variant={localFilters.hasNotes === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('hasNotes', 
                    localFilters.hasNotes === true ? null : true
                  )}
                >
                  With Notes
                </Button>
                <Button
                  variant={localFilters.hasNotes === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('hasNotes', 
                    localFilters.hasNotes === false ? null : false
                  )}
                >
                  Without Notes
                </Button>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}