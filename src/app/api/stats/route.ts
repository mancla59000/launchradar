import { NextResponse } from 'next/server'
import { DataProcessingService } from '@/lib/services/data-processing.service'

export async function GET() {
  try {
    const dataProcessor = new DataProcessingService()
    const stats = await dataProcessor.getProcessingStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Stats API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch statistics'
    }, { status: 500 })
  }
}