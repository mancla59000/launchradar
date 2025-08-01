import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/lib/services/export.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const format = (searchParams.get('format') as 'csv' | 'json') || 'json'
    const options = {
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
      category: searchParams.get('category') || undefined,
      source: searchParams.get('source') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    }

    const exportService = new ExportService()
    const result = await exportService.exportOpportunities(format, options)

    // Return as downloadable file
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`
      }
    })

  } catch (error) {
    console.error('Export opportunities API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to export opportunities'
    }, { status: 500 })
  }
}