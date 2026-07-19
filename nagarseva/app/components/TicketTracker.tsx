'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function TicketTracker() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🎫 TicketTracker mounted')
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">Loading tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-100">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
        <p className="text-slate-400">Tickets placeholder - debugging in progress</p>
      </div>
    </div>
  )
}
