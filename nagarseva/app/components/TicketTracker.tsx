'use client'

import { useEffect, useState } from 'react'
import { Ticket, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface TicketData {
  id: string
  title: string
  description: string
  category: string
  status: string
  created_at: string
  sla_deadline: string
  ward_id: string
  is_escalated: boolean
  escalated_at: string | null
  resolved_at: string | null
  updated_at: string
  ward_name: string
  responsiveness_score: number
  hours_remaining: number
  is_overdue: boolean
}

export default function TicketTracker() {
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress'>('all')
  const [sortBy, setSortBy] = useState<'sla' | 'created'>('sla')

  const fetchTickets = async () => {
    try {
      setLoading(true)
      console.log('🎫 Fetching tickets...')
      
      const response = await fetch('/api/tickets')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Got tickets:', data.tickets?.length || 0)
      
      setTickets(data.tickets || [])
      setError(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error fetching tickets:', errorMsg)
      setError(errorMsg)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'open') return t.status === 'Open'
    if (filter === 'in-progress') return t.status === 'In Progress'
    return true
  })

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'sla') {
      return new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime()
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">Loading tickets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            In Progress
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="sla">Sort: SLA Deadline</option>
            <option value="created">Sort: Date Created</option>
          </select>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-100">{error}</p>
        </div>
      )}

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sortedTickets.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
            <p className="text-slate-400">No tickets in this view</p>
          </div>
        ) : (
          sortedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition"
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{ticket.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{ticket.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                        {ticket.category}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                        {ticket.ward_name}
                      </span>
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {ticket.is_escalated ? (
                      <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-full font-semibold">
                        🔴 Escalated
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Timer & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className={`text-sm font-medium ${
                      ticket.is_overdue ? 'text-red-400' : 'text-slate-300'
                    }`}>
                      {ticket.hours_remaining > 0 
                        ? `${ticket.hours_remaining}h remaining`
                        : 'Overdue'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:ml-auto">
                    {ticket.status !== 'Resolved' && (
                      <>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition">
                          {ticket.status === 'Open' ? 'Start' : 'Resolve'}
                        </button>
                        {!ticket.is_escalated && (
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition">
                            Escalate
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
