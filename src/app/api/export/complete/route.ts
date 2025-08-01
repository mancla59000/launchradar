import { NextRequest, NextResponse } from 'next/server'
import { ExportService } from '@/lib/services/export.service'

export async function GET(request: NextRequest) {
  try {
    const exportService = new ExportService()
    const result = await exportService.exportComplete('json')

    // Return as downloadable file
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`
      }
    })

  } catch (error) {
    console.error('Export complete API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to export complete data'
    }, { status: 500 })
  }
}