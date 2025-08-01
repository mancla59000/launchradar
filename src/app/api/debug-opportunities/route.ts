import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('=== DEBUG OPPORTUNITIES ENDPOINT ===');
    
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('Service Key:', supabaseKey ? 'SET' : 'NOT SET');
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
          serviceKey: supabaseKey ? 'SET' : 'NOT SET'
        }
      }, { status: 500 });
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    
    console.log('Supabase client created');
    
    // Test connection with simple query
    console.log('Testing Supabase connection...');
    const { data, error, count } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('Query result:', { 
      dataLength: data?.length || 0, 
      error: error?.message || null,
      count 
    });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint
        }
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      data: {
        count: count || 0,
        opportunities: data || [],
        environment: {
          supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
          serviceKeyPrefix: supabaseKey?.substring(0, 20) + '...'
        }
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}