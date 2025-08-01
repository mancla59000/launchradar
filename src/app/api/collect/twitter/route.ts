import { NextRequest, NextResponse } from 'next/server'
import { TwitterCollector } from '@/lib/collectors/twitter'
import { validateConfig } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    validateConfig()

    const { keywords, maxResults } = await request.json().catch(() => ({}))

    const collector = new TwitterCollector({
      keywords,
      maxResults
    })

    const result = await collector.collectOnce()

    return NextResponse.json({
      success: true,
      message: `Collected ${result.posts} Twitter posts, created ${result.opportunities} opportunities`,
      data: result
    })

  } catch (error) {
    console.error('Twitter collection API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to collect Twitter data'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/collect/twitter',
    method: 'POST',
    description: 'Collect Twitter posts and process them into opportunities',
    parameters: {
      keywords: 'Optional array of keywords to search for',
      maxResults: 'Optional maximum number of results (default from config)'
    },
    example: {
      keywords: ['SaaS', 'startup', 'MVP'],
      maxResults: 50
    }
  })
}