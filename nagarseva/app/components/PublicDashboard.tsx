'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, BarChart3, AlertCircle } from 'lucide-react'

interface DashboardStats {
  total_active_issues: number
  issues_escalated_today: number
  city_wide_average_score: number
}

interface Ward {
  id: string
  name: string
  total_population: number
  responsiveness_score: number
  escalated_count: number
}

export default function PublicDashboard() {
  const [wards, setWards] = useState<Ward[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('📊 Fetching dashboard data...')
        
        // Try to fetch wards directly
        const response = await fetch('/api/dashboard-data', {
          method: 'GET',
        })
        
        console.log('📊 API response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📊 Received data:', data)
        
        setWards(data.wards || [])
        setStats(data.stats || null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('❌ Error fetching data:', errorMsg)
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
          <h3 className="font-semibold text-red-200 mb-1">Error Loading Data</h3>
          <p className="text-sm text-red-100">{error}</p>
        </div>
      </div>
    )
  }

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
          {wards.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No ward data available</p>
          ) : (
            wards.map((ward, index) => (
              <div
                key={ward.id}
                className={`bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition`}
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
                <div className={`${getScoreBg(ward.responsiveness_score)} border rounded-lg px-4 py-2 text-right`}>
                  <p className={`${getScoreColor(ward.responsiveness_score)} text-2xl font-bold`}>
                    {ward.responsiveness_score.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400">Score</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
