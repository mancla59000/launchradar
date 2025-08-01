import { NextResponse } from 'next/server'
import { ExportService } from '@/lib/services/export.service'

export async function GET() {
  try {
    const exportService = new ExportService()
    const stats = await exportService.getExportStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Export stats API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch export statistics'
    }, { status: 500 })
  }
}