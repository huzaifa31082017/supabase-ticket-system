'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function PublicDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('📊 PublicDashboard mounted')
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="text-slate-400">Loading...</div>
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-200 mb-1">Error</h3>
            <p className="text-sm text-red-100">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Total Active Issues</p>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Escalated Today</p>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm">City Average Score</p>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
      </div>
      <p className="text-slate-400">Dashboard placeholder - debugging in progress</p>
    </div>
  )
}
