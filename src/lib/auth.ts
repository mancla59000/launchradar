import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './supabase/types'

export async function getServerSession() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Failed to get server session:', error)
    return null
  }
}

export async function getCurrentUser() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Profile not found
      }
      console.error('Error getting user profile:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to get user profile:', error)
    throw error
  }
}

export async function createUserProfile(user: { id: string; email: string }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        preferences: {
          theme: 'light',
          notifications: {
            email: true,
            push: false
          },
          collection: {
            autoStart: false,
            interval: 30
          }
        }
      })
      .select()
      .single()
      
    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to create user profile:', error)
    throw error
  }
}

export async function updateUserProfile(userId: string, updates: {
  preferences?: Record<string, any>
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}

export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return session
}

export async function requireUser() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('User authentication required')
  }
  
  return user
}