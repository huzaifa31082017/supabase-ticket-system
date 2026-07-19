'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { Ward, Ticket, DashboardStats, TicketWithTimeRemaining } from '@/app/types'

// ============================================================================
// WARD OPERATIONS
// ============================================================================

/**
 * Fetch all wards ordered by responsiveness score (descending)
 */
export async function getWards(): Promise<Ward[]> {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .order('responsiveness_score', { ascending: false })
    
    if (error) {
      console.error('Supabase error fetching wards:', error.message, error.code)
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching wards:', error)
    throw new Error(`Failed to fetch wards: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get a single ward by ID
 */
export async function getWardById(wardId: string): Promise<Ward | null> {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .eq('id', wardId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    return data || null
  } catch (error) {
    console.error('Error fetching ward:', error)
    return null
  }
}

/**
 * Update ward responsiveness score
 */
async function updateWardResponsivenessScore(wardId: string, score: number): Promise<void> {
  const supabase = createServerSupabaseClient()
  
  try {
    const { error } = await supabase
      .from('wards')
      .update({
        responsiveness_score: Math.max(0, Math.min(100, score)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wardId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error updating ward score:', error)
    throw error
  }
}

// ============================================================================
// TICKET OPERATIONS
// ============================================================================

/**
 * Fetch all active tickets (Open or In Progress) with ward names
 */
export async function getTickets(): Promise<TicketWithTimeRemaining[]> {
  const supabase = createServerSupabaseClient()
  
  try {
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
    
    if (error) throw error
    
    return (data || []).map((ticket: any) => ({
      ...ticket,
      ward_name: ticket.wards?.name || 'Unknown',
      responsiveness_score: ticket.wards?.responsiveness_score || 0,
      hours_remaining: calculateHoursRemaining(ticket.sla_deadline),
      is_overdue: new Date(ticket.sla_deadline) < new Date(),
    }))
  } catch (error) {
    console.error('Error fetching tickets:', error)
    throw new Error('Failed to fetch tickets')
  }
}

/**
 * Fetch all tickets (including resolved ones)
 */
export async function getAllTickets(): Promise<Ticket[]> {
  const supabase = createServerSupabaseClient()
  
  try {
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
        wards:ward_id(id, name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((ticket: any) => ({
      ...ticket,
      ward_name: ticket.wards?.name || 'Unknown',
    }))
  } catch (error) {
    console.error('Error fetching all tickets:', error)
    throw new Error('Failed to fetch tickets')
  }
}

/**
 * Get tickets by ward ID
 */
export async function getTicketsByWard(wardId: string): Promise<TicketWithTimeRemaining[]> {
  const supabase = createServerSupabaseClient()
  
  try {
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
      .eq('ward_id', wardId)
      .in('status', ['Open', 'In Progress'])
      .order('sla_deadline', { ascending: true })
    
    if (error) throw error
    
    return (data || []).map((ticket: any) => ({
      ...ticket,
      ward_name: ticket.wards?.name || 'Unknown',
      responsiveness_score: ticket.wards?.responsiveness_score || 0,
      hours_remaining: calculateHoursRemaining(ticket.sla_deadline),
      is_overdue: new Date(ticket.sla_deadline) < new Date(),
    }))
  } catch (error) {
    console.error('Error fetching tickets by ward:', error)
    return []
  }
}

// ============================================================================
// ESCALATION LOGIC
// ============================================================================

/**
 * Evaluate and process escalations
 * - Checks all Open/In Progress tickets
 * - If SLA deadline has passed and not escalated, marks as escalated
 * - Deducts points from ward responsiveness score
 */
export async function evaluateEscalations(): Promise<{
  escalated_count: number
  updated_wards: number
}> {
  const supabase = createServerSupabaseClient()
  let escalated_count = 0
  let updated_wards = 0
  
  try {
    // Get all non-escalated overdue tickets
    const { data: overdueTickets, error: fetchError } = await supabase
      .from('tickets')
      .select('id, ward_id, sla_deadline, title')
      .in('status', ['Open', 'In Progress'])
      .eq('is_escalated', false)
      .lt('sla_deadline', new Date().toISOString())
    
    if (fetchError) throw fetchError
    
    if (!overdueTickets || overdueTickets.length === 0) {
      return { escalated_count: 0, updated_wards: 0 }
    }
    
    // Group by ward to calculate score deductions
    const wardDeductions: { [key: string]: number } = {}
    
    for (const ticket of overdueTickets) {
      if (!wardDeductions[ticket.ward_id]) {
        wardDeductions[ticket.ward_id] = 0
      }
      wardDeductions[ticket.ward_id] += 5 // Deduct 5 points per escalated ticket
    }
    
    // Update tickets as escalated
    for (const ticket of overdueTickets) {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          is_escalated: true,
          escalated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticket.id)
      
      if (!updateError) {
        escalated_count++
        
        // Log the escalation
        await supabase
          .from('escalation_logs')
          .insert({
            ticket_id: ticket.id,
            ward_id: ticket.ward_id,
            reason: `SLA deadline passed: ${ticket.title}`,
            escalated_at: new Date().toISOString(),
          })
      }
    }
    
    // Update ward scores
    for (const [wardId, deduction] of Object.entries(wardDeductions)) {
      const ward = await getWardById(wardId)
      if (ward) {
        const newScore = Math.max(0, ward.responsiveness_score - deduction)
        await updateWardResponsivenessScore(wardId, newScore)
        updated_wards++
        
        // Update escalated count
        await supabase
          .from('wards')
          .update({ escalated_count: (ward.escalated_count || 0) + (deduction / 5) })
          .eq('id', wardId)
      }
    }
    
    return { escalated_count, updated_wards }
  } catch (error) {
    console.error('Error evaluating escalations:', error)
    throw new Error('Failed to evaluate escalations')
  }
}

/**
 * Manually escalate a ticket
 */
export async function escalateTicket(ticketId: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, ward_id, title, is_escalated')
      .eq('id', ticketId)
      .single()
    
    if (fetchError) throw fetchError
    
    if (ticket.is_escalated) {
      throw new Error('Ticket already escalated')
    }
    
    // Update ticket
    const { error: updateError } = await supabase
      .from('tickets')
      .update({
        is_escalated: true,
        escalated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
    
    if (updateError) throw updateError
    
    // Log escalation
    await supabase
      .from('escalation_logs')
      .insert({
        ticket_id: ticketId,
        ward_id: ticket.ward_id,
        reason: `Manually escalated: ${ticket.title}`,
        escalated_at: new Date().toISOString(),
      })
    
    // Deduct points from ward
    const ward = await getWardById(ticket.ward_id)
    if (ward) {
      await updateWardResponsivenessScore(ticket.ward_id, ward.responsiveness_score - 5)
      await supabase
        .from('wards')
        .update({ escalated_count: (ward.escalated_count || 0) + 1 })
        .eq('id', ticket.ward_id)
    }
  } catch (error) {
    console.error('Error escalating ticket:', error)
    throw error
  }
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient()
  
  try {
    console.log('Fetching dashboard stats...')
    
    // Total active issues
    const { count: totalCount, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Open', 'In Progress'])
    
    if (countError) {
      console.error('Error fetching ticket count:', countError)
    }
    
    // Issues escalated today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: escalatedTodayCount, error: escalatedError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('is_escalated', true)
      .gte('escalated_at', today.toISOString())
    
    if (escalatedError) {
      console.error('Error fetching escalated count:', escalatedError)
    }
    
    // City-wide average score
    const { data: wards, error: wardsError } = await supabase
      .from('wards')
      .select('responsiveness_score')
    
    if (wardsError) {
      console.error('Error fetching wards for average:', wardsError)
    }
    
    const avgScore = wards && wards.length > 0
      ? wards.reduce((sum, w) => sum + w.responsiveness_score, 0) / wards.length
      : 0
    
    return {
      total_active_issues: totalCount || 0,
      issues_escalated_today: escalatedTodayCount || 0,
      city_wide_average_score: Math.round(avgScore * 100) / 100,
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      total_active_issues: 0,
      issues_escalated_today: 0,
      city_wide_average_score: 0,
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate hours remaining until SLA deadline
 */
function calculateHoursRemaining(slaDeadline: string): number {
  const deadline = new Date(slaDeadline)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.round(diffMs / (1000 * 60 * 60))
}

/**
 * Create a new ticket
 */
export async function createTicket(ticketData: {
  title: string
  description: string
  category: string
  ward_id: string
  sla_hours: number
}): Promise<Ticket> {
  const supabase = createServerSupabaseClient()
  
  try {
    const slaDeadline = new Date()
    slaDeadline.setHours(slaDeadline.getHours() + ticketData.sla_hours)
    
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        status: 'Open',
        ward_id: ticketData.ward_id,
        sla_deadline: slaDeadline.toISOString(),
        is_escalated: false,
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(ticketId: string, status: 'Open' | 'In Progress' | 'Resolved'): Promise<void> {
  const supabase = createServerSupabaseClient()
  
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }
    
    if (status === 'Resolved') {
      updateData.resolved_at = new Date().toISOString()
    }
    
    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
    
    if (error) throw error
  } catch (error) {
    console.error('Error updating ticket status:', error)
    throw error
  }
}
