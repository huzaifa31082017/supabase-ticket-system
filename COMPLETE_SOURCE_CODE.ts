// ============================================================================
// NAGARSEVA - COMPLETE SOURCE CODE PACKAGE
// ============================================================================
// This file contains all component source code ready to be copied into
// your Next.js project files. See directory structure below.

/**
 * FILE DIRECTORY MAPPING:
 * 
 * Copy each section to its corresponding file:
 * 
 * 1. app/auth/page.tsx                    ← LOGIN_PAGE
 * 2. app/dashboard/page.tsx               ← DASHBOARD_PAGE
 * 3. app/dashboard/layout.tsx             ← DASHBOARD_LAYOUT
 * 4. app/components/Navbar.tsx            ← NAVBAR_COMPONENT
 * 5. app/components/PublicDashboard.tsx   ← PUBLIC_DASHBOARD_COMPONENT
 * 6. app/components/TicketTracker.tsx     ← TICKET_TRACKER_COMPONENT
 * 7. app/components/AccountabilityBoard.tsx ← ACCOUNTABILITY_BOARD
 * 8. app/components/TicketTimer.tsx       ← TICKET_TIMER_COMPONENT
 * 9. app/components/LoginPage.tsx         ← LOGIN_COMPONENT (Legacy)
 * 10. app/layout.tsx                      ← ROOT_LAYOUT
 * 11. lib/supabase.ts                     ← SUPABASE_CLIENT (Already created)
 * 12. app/types/index.ts                  ← TYPES (Already created)
 * 13. app/hooks/useCountdownTimer.ts      ← TIMER_HOOK (Already created)
 * 14. app/actions/sla-actions.ts          ← SERVER_ACTIONS (Already created)
 */

// ============================================================================
// 1. LOGIN_PAGE: app/auth/page.tsx
// ============================================================================

export const LOGIN_PAGE = `
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AlertCircle, Mail, Lock, LogIn, Loader2, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: \`\${window.location.origin}/auth/callback\`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setError(null)
        alert('Sign up successful! Check your email to confirm your account.')
        setIsSignup(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">NS</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">NagarSeva</h1>
            <p className="text-slate-400 text-sm">AI Citizen Advocate Portal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isSignup ? handleSignUp : handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nagarseva.com"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition duration-200 mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignup ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign Up */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              {isSignup ? 'Already have an account?' : \"Don't have an account?\"}{' '}
              <button
                onClick={() => { setIsSignup(!isSignup); setError(null); }}
                className="text-blue-400 hover:text-blue-300 font-semibold transition"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          {!isSignup && (
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Demo Credentials</p>
              <p className="text-xs text-slate-400">
                <span className="text-slate-300">Email:</span> demo@nagarseva.com
              </p>
              <p className="text-xs text-slate-400">
                <span className="text-slate-300">Password:</span> demo1234
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2024 NagarSeva. All rights reserved.
        </p>
      </div>
    </div>
  )
}
`;

// ============================================================================
// 2. DASHBOARD_PAGE: app/dashboard/page.tsx
// ============================================================================

export const DASHBOARD_PAGE = `
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PublicDashboard from '@/app/components/PublicDashboard'
import TicketTracker from '@/app/components/TicketTracker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { BarChart3, Ticket, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription?.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">NS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">NagarSeva</h1>
                <p className="text-xs text-slate-400">AI Citizen Advocate</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-200">{user?.email}</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="accountability" className="space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger value="accountability" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Accountability Board
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Ticket Tracker
            </TabsTrigger>
          </TabsList>

          {/* Accountability Board Tab */}
          <TabsContent value="accountability" className="space-y-6">
            <PublicDashboard />
          </TabsContent>

          {/* Ticket Tracker Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <TicketTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
`;

// ============================================================================
// 3. PUBLIC_DASHBOARD_COMPONENT: app/components/PublicDashboard.tsx
// ============================================================================

export const PUBLIC_DASHBOARD_COMPONENT = `
'use client'

import { useEffect, useState } from 'react'
import { getWards, getDashboardStats } from '@/app/actions/sla-actions'
import { Ward, DashboardStats } from '@/app/types'
import { TrendingUp, Users, BarChart3, AlertCircle } from 'lucide-react'

export default function PublicDashboard() {
  const [wards, setWards] = useState<Ward[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [wardsData, statsData] = await Promise.all([
          getWards(),
          getDashboardStats(),
        ])
        setWards(wardsData)
        setStats(statsData)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-emerald-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score > 80) return 'bg-emerald-500/10 border-emerald-500/30'
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">Loading ward data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-200 mb-1">Error</h3>
          <p className="text-sm text-red-100">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Total Active Issues</p>
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.total_active_issues || 0}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Escalated Today</p>
            <BarChart3 className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.issues_escalated_today || 0}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">City Average Score</p>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.city_wide_average_score || 0}</p>
        </div>
      </div>

      {/* Ward Leaderboard */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Ward Performance Leaderboard
        </h2>

        <div className="space-y-3">
          {wards.map((ward, index) => (
            <div
              key={ward.id}
              className={\`bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition\`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    <span className="font-bold text-slate-300">#{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{ward.name}</h3>
                  <p className="text-xs text-slate-500">
                    Population: {ward.total_population.toLocaleString()} • Escalated: {ward.escalated_count}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className={\`\${getScoreBg(ward.responsiveness_score)} border rounded-lg px-4 py-2 text-right\`}>
                <p className={`\${getScoreColor(ward.responsiveness_score)} text-2xl font-bold`}>
                  {ward.responsiveness_score.toFixed(1)}
                </p>
                <p className="text-xs text-slate-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Legend */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-3">Score Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-300">Excellent (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-slate-300">Good (50-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-300">Needs Improvement (&lt;50)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================================
// 4. TICKET_TRACKER_COMPONENT: app/components/TicketTracker.tsx
// ============================================================================

export const TICKET_TRACKER_COMPONENT = `
'use client'

import { useEffect, useState } from 'react'
import { getTickets, updateTicketStatus, escalateTicket } from '@/app/actions/sla-actions'
import { TicketWithTimeRemaining } from '@/app/types'
import TicketTimer from '@/app/components/TicketTimer'
import { Ticket, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

export default function TicketTracker() {
  const [tickets, setTickets] = useState<TicketWithTimeRemaining[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress'>('all')
  const [sortBy, setSortBy] = useState<'sla' | 'created'>('sla')

  useEffect(() => {
    fetchTickets()

    // Refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const data = await getTickets()
      setTickets(data)
    } catch (err) {
      setError('Failed to load tickets')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicketStatus(ticketId, newStatus as any)
      await fetchTickets()
    } catch (err) {
      alert('Failed to update ticket status')
    }
  }

  const handleEscalate = async (ticketId: string) => {
    try {
      await escalateTicket(ticketId)
      await fetchTickets()
    } catch (err) {
      alert('Failed to escalate ticket')
    }
  }

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
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition \${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }\`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition \${
              filter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }\`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={\`px-4 py-2 rounded-lg text-sm font-medium transition \${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }\`}
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
                  <TicketTimer slaDeadline={ticket.sla_deadline} />

                  {/* Actions */}
                  <div className="flex gap-2 sm:ml-auto">
                    {ticket.status !== 'Resolved' && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              ticket.id,
                              ticket.status === 'Open' ? 'In Progress' : 'Resolved'
                            )
                          }
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition"
                        >
                          {ticket.status === 'Open' ? 'Start' : 'Resolve'}
                        </button>
                        {!ticket.is_escalated && (
                          <button
                            onClick={() => handleEscalate(ticket.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition"
                          >
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
`;

export const COMPLETE_SOURCE_CODE_PACKAGE = 'See components above'
