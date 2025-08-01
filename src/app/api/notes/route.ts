import { NextRequest, NextResponse } from 'next/server'
import { ResearchNotesService } from '@/lib/services/research-notes.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const options = {
      opportunityId: searchParams.get('opportunityId') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: (searchParams.get('sortBy') as 'created_at' | 'updated_at' | 'title') || 'updated_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    }

    const notesService = new ResearchNotesService()
    const result = await notesService.getNotes(options)

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Research notes GET API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch research notes'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const noteData = await request.json()
    
    // Validate required fields
    if (!noteData.title || !noteData.content) {
      return NextResponse.json({
        success: false,
        error: 'Title and content are required'
      }, { status: 400 })
    }

    const notesService = new ResearchNotesService()
    const note = await notesService.createNote(noteData)

    return NextResponse.json({
      success: true,
      message: 'Research note created successfully',
      data: note
    }, { status: 201 })

  } catch (error) {
    console.error('Research notes POST API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to create research note'
    }, { status: 500 })
  }
}