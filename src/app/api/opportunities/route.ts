import { NextRequest, NextResponse } from 'next/server'
import { DataProcessingService } from '@/lib/services/data-processing.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Cap at 100
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
      category: searchParams.get('category') || undefined,
      source: searchParams.get('source') || undefined,
      sortBy: (searchParams.get('sortBy') as 'score' | 'created_at' | 'discovered_at') || 'score',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined
    }

    const dataProcessor = new DataProcessingService()
    const result = await dataProcessor.getOpportunities(options)

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Opportunities API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch opportunities'
    }, { status: 500 })
  }
}

// Process any unprocessed raw posts
export async function POST() {
  try {
    const dataProcessor = new DataProcessingService()
    const opportunitiesCreated = await dataProcessor.processRawPosts()

    return NextResponse.json({
      success: true,
      message: `Processed raw posts and created ${opportunitiesCreated} new opportunities`,
      opportunitiesCreated
    })

  } catch (error) {
    console.error('Process opportunities API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to process opportunities'
    }, { status: 500 })
  }
}