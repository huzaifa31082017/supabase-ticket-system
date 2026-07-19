import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🎫 API: Fetching tickets...')
    
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        sla_deadline,
        ward_id,
        is_escalated,
        escalated_at,
        resolved_at,
        updated_at,
        wards:ward_id(id, name, responsiveness_score)
      `)
      .in('status', ['Open', 'In Progress'])
      .order('sla_deadline', { ascending: true })
    
    if (error) {
      console.error('❌ API: Tickets error:', error)
      throw error
    }
    
    console.log('✅ API: Got tickets:', data?.length || 0)
    
    // Transform the data
    const tickets = (data || []).map((ticket: any) => ({
      ...ticket,
      ward_name: ticket.wards?.name || 'Unknown',
      responsiveness_score: ticket.wards?.responsiveness_score || 0,
      hours_remaining: calculateHoursRemaining(ticket.sla_deadline),
      is_overdue: new Date(ticket.sla_deadline) < new Date(),
    }))
    
    return NextResponse.json({
      tickets,
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

function calculateHoursRemaining(slaDeadline: string): number {
  const deadline = new Date(slaDeadline)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.round(diffMs / (1000 * 60 * 60))
}
