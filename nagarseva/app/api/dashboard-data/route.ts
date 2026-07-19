import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('📊 API: Fetching dashboard data...')
    
    const supabase = createServerSupabaseClient()
    
    // Fetch wards
    console.log('📊 API: Fetching wards...')
    const { data: wards, error: wardsError } = await supabase
      .from('wards')
      .select('*')
      .order('responsiveness_score', { ascending: false })
    
    if (wardsError) {
      console.error('❌ API: Wards error:', wardsError)
      throw wardsError
    }
    
    console.log('✅ API: Got wards:', wards?.length || 0)
    
    // Fetch stats
    console.log('📊 API: Fetching stats...')
    const { count: totalCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Open', 'In Progress'])
    
    const { count: escalatedCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('is_escalated', true)
    
    const { data: wardsForAvg } = await supabase
      .from('wards')
      .select('responsiveness_score')
    
    const avgScore = wardsForAvg && wardsForAvg.length > 0
      ? wardsForAvg.reduce((sum: number, w: any) => sum + w.responsiveness_score, 0) / wardsForAvg.length
      : 0
    
    console.log('✅ API: Got stats:', { totalCount, escalatedCount, avgScore })
    
    return NextResponse.json({
      wards: wards || [],
      stats: {
        total_active_issues: totalCount || 0,
        issues_escalated_today: escalatedCount || 0,
        city_wide_average_score: Math.round(avgScore * 100) / 100,
      },
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
