import { NextResponse } from 'next/server'
import { ResearchNotesService } from '@/lib/services/research-notes.service'

export async function GET() {
  try {
    const notesService = new ResearchNotesService()
    const tags = await notesService.getTags()

    return NextResponse.json({
      success: true,
      data: tags
    })

  } catch (error) {
    console.error('Research notes tags API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch tags'
    }, { status: 500 })
  }
}