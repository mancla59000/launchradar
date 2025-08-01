import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getUserProfile, createUserProfile, updateUserProfile } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    let profile = await getUserProfile(user.id)
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = await createUserProfile({
        id: user.id,
        email: user.email || ''
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile
      }
    })

  } catch (error) {
    console.error('Profile GET API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to fetch user profile'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const updates = await request.json()
    
    const profile = await updateUserProfile(user.id, updates)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    })

  } catch (error) {
    console.error('Profile PUT API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to update user profile'
    }, { status: 500 })
  }
}