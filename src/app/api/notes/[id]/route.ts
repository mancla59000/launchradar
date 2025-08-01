import { NextRequest, NextResponse } from 'next/server'
import { ResearchNotesService } from '@/lib/services/research-notes.service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const notesService = new ResearchNotesService()
    const note = await notesService.getNote(params.id)

    if (!note) {
      return NextResponse.json({
        success: false,
        error: 'Research note not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: note
    })

  } catch (error) {
    console.error('Research note GET API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch research note'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const updates = await request.json()
    
    const notesService = new ResearchNotesService()
    const note = await notesService.updateNote(params.id, updates)

    return NextResponse.json({
      success: true,
      message: 'Research note updated successfully',
      data: note
    })

  } catch (error) {
    console.error('Research note PUT API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to update research note'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const notesService = new ResearchNotesService()
    await notesService.deleteNote(params.id)

    return NextResponse.json({
      success: true,
      message: 'Research note deleted successfully'
    })

  } catch (error) {
    console.error('Research note DELETE API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to delete research note'
    }, { status: 500 })
  }
}