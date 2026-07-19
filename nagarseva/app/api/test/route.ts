import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Test: Checking Supabase connection...')
    
    const supabase = createServerSupabaseClient()
    
    // Try a simple query
    const { data, error } = await supabase
      .from('wards')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Test: Supabase error:', error)
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Test: Supabase connection successful')
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection is working',
      data,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json(
      { status: 'error', message: msg },
      { status: 500 }
    )
  }
}
