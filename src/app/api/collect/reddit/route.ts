import { NextRequest, NextResponse } from 'next/server'
import { RedditCollector } from '@/lib/collectors/reddit'
import { validateConfig } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // Validate environment configuration
    validateConfig()

    const { subreddits, keywords } = await request.json().catch(() => ({}))

    const collector = new RedditCollector({
      subreddits,
      keywords
    })

    const result = await collector.collectOnce()

    return NextResponse.json({
      success: true,
      message: `Collected ${result.posts} Reddit posts, created ${result.opportunities} opportunities`,
      data: result
    })

  } catch (error) {
    console.error('Reddit collection API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to collect Reddit data'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/collect/reddit',
    method: 'POST',
    description: 'Collect Reddit posts and process them into opportunities',
    parameters: {
      subreddits: 'Optional array of subreddits to search (default from config)',
      keywords: 'Optional array of keywords to filter posts (default from config)'
    },
    example: {
      subreddits: ['entrepreneur', 'startups', 'SaaS'],
      keywords: ['validation', 'mvp', 'feedback']
    }
  })
}