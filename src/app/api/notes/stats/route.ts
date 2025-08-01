import { NextResponse } from 'next/server'
import { ResearchNotesService } from '@/lib/services/research-notes.service'

export async function GET() {
  try {
    const notesService = new ResearchNotesService()
    const stats = await notesService.getStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Research notes stats API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',  
      message: 'Failed to fetch research notes statistics'
    }, { status: 500 })
  }
}