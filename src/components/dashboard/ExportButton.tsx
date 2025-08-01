'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, FileText, Table, Loader2, Check } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type OpportunityType = Database['public']['Tables']['opportunities']['Row']
type ResearchNote = Database['public']['Tables']['research_notes']['Row']

interface ExportButtonProps {
  opportunities: OpportunityType[]
  notes?: ResearchNote[]
  selectedOpportunities?: string[]
  className?: string
}

export function ExportButton({ 
  opportunities, 
  notes = [], 
  selectedOpportunities,
  className = "" 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const dataToExport = selectedOpportunities 
    ? opportunities.filter(opp => selectedOpportunities.includes(opp.id))
    : opportunities

  const exportToCSV = () => {
    const csvData = dataToExport.map(opp => ({
      Title: opp.title,
      Description: opp.description.replace(/,/g, ';').replace(/\n/g, ' '),
      Source: opp.source,
      Category: opp.category,
      Score: opp.score || 'N/A',
      Tags: opp.personal_tags?.join('; ') || '',
      Likes: opp.engagement_data.likes || 0,
      Comments: opp.engagement_data.comments || opp.engagement_data.replies || 0,
      Shares: opp.engagement_data.shares || 0,
      'Discovered Date': new Date(opp.discovered_at).toLocaleDateString(),
      'Created Date': new Date(opp.created_at).toLocaleDateString()
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
      )
    ].join('\n')

    downloadFile(csvContent, 'launchradar-opportunities.csv', 'text/csv')
  }

  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalOpportunities: dataToExport.length,
      totalNotes: notes.length,
      opportunities: dataToExport.map(opp => ({
        ...opp,
        relatedNotes: notes.filter(note => note.opportunity_id === opp.id)
      }))
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    downloadFile(jsonContent, 'launchradar-export.json', 'application/json')
  }

  const exportResearchReport = () => {
    // Create a formatted research report
    const reportLines = [
      '# LaunchRadar Research Report',
      `Generated on: ${new Date().toLocaleDateString()}`,
      `Total Opportunities: ${dataToExport.length}`,
      `Total Research Notes: ${notes.length}`,
      '',
      '## Executive Summary',
      `This report contains ${dataToExport.length} opportunities discovered through automated monitoring of Twitter and Reddit.`,
      `${dataToExport.filter(opp => opp.score && opp.score >= 80).length} opportunities have high scores (80+).`,
      `${dataToExport.filter(opp => opp.personal_tags && opp.personal_tags.length > 0).length} opportunities have been tagged for follow-up.`,
      '',
      '## Opportunities by Category',
    ]

    // Group by category
    const byCategory = dataToExport.reduce((acc, opp) => {
      const cat = opp.category || 'Uncategorized'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(opp)
      return acc
    }, {} as Record<string, OpportunityType[]>)

    Object.entries(byCategory).forEach(([category, opps]) => {
      reportLines.push(`### ${category} (${opps.length} opportunities)`)
      opps.forEach(opp => {
        reportLines.push(`**${opp.title}**`)
        reportLines.push(`Score: ${opp.score || 'Unscored'} | Source: ${opp.source}`)
        reportLines.push(`${opp.description.substring(0, 200)}...`)
        if (opp.personal_tags && opp.personal_tags.length > 0) {
          reportLines.push(`Tags: ${opp.personal_tags.join(', ')}`)
        }
        reportLines.push('')
      })
    })

    // Add research notes section
    if (notes.length > 0) {
      reportLines.push('## Research Notes')
      notes.forEach(note => {
        reportLines.push(`### ${note.title}`)
        reportLines.push(note.content)
        if (note.tags && note.tags.length > 0) {
          reportLines.push(`Tags: ${note.tags.join(', ')}`)
        }
        reportLines.push('')
      })
    }

    const reportContent = reportLines.join('\n')
    downloadFile(reportContent, 'launchradar-research-report.md', 'text/markdown')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (format: 'csv' | 'json' | 'report') => {
    setIsExporting(true)
    setExportFormat(format === 'report' ? 'json' : format)

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      switch (format) {
        case 'csv':
          exportToCSV()
          break
        case 'json':
          exportToJSON()
          break
        case 'report':
          exportResearchReport()
          break
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  if (dataToExport.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-muted-foreground">
          No opportunities to export
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Download className="h-4 w-4" />
            <span className="font-medium">Export Data</span>
            <span className="text-sm text-muted-foreground">
              ({dataToExport.length} opportunities)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting && exportFormat === 'csv' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : showSuccess ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Table className="h-3 w-3" />
              )}
              CSV Spreadsheet
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting && exportFormat === 'json' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : showSuccess ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              JSON Data
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('report')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting && exportFormat === 'json' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : showSuccess ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              Research Report
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>CSV:</strong> Spreadsheet format for analysis in Excel/Google Sheets</p>
            <p><strong>JSON:</strong> Complete data with metadata for technical analysis</p>
            <p><strong>Report:</strong> Formatted markdown report with insights and notes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}