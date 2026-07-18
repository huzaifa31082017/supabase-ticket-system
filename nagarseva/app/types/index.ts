// Type definitions for NagarSeva AI Citizen Advocate

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved'
export type TicketCategory = 'Roads' | 'Utilities' | 'Sanitation' | 'Parks' | 'Water' | 'Infrastructure' | 'Public Safety' | 'Other'
export type UserRole = 'citizen' | 'admin' | 'commissioner'

export interface Ward {
  id: string
  name: string
  total_population: number
  responsiveness_score: number
  escalated_count: number
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: TicketCategory
  status: TicketStatus
  created_at: string
  updated_at: string
  sla_deadline: string
  ward_id: string
  ward_name?: string
  responsiveness_score?: number
  is_escalated: boolean
  escalated_at: string | null
  resolved_at?: string | null
}

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  ward_id: string | null
  created_at: string
  updated_at: string
}

export interface EscalationLog {
  id: string
  ticket_id: string
  ward_id: string
  escalated_at: string
  reason: string
  created_at: string
}

export interface DashboardStats {
  total_active_issues: number
  issues_escalated_today: number
  city_wide_average_score: number
}

export interface TicketWithTimeRemaining extends Ticket {
  hours_remaining: number
  is_overdue: boolean
}

export interface EscalationSummary {
  totalActiveIssues: number
  issuesEscalatedToday: number
  cityWideAverageScore: number
}
