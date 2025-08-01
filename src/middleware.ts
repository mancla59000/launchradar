import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/opportunities',
  '/api/notes',
  '/api/export',
  '/api/collectors',
  '/api/collect'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/api/health',
  '/api/stats',
  '/api/debug-opportunities'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Allow public routes without authentication
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }
  
  // For protected routes, check authentication
  if (isProtectedRoute) {
    try {
      // Get auth token from cookies or headers
      const authHeader = request.headers.get('authorization')
      const sessionCookie = request.cookies.get('sb-access-token')
      
      let token = null
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      } else if (sessionCookie) {
        token = sessionCookie.value
      }
      
      if (!token) {
        return redirectToLogin(request)
      }
      
      // Verify token with Supabase
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        console.error('Auth verification failed:', error?.message)
        return redirectToLogin(request)
      }
      
      // Add user info to headers for downstream use
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-email', user.email || '')
      
      return response
      
    } catch (error) {
      console.error('Middleware auth error:', error)
      return redirectToLogin(request)
    }
  }
  
  return NextResponse.next()
}

function redirectToLogin(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  
  // For API routes, return 401
  if (pathname.startsWith('/api/')) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      }),
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
  
  // For pages, redirect to login with return URL
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname + search)
  
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}