'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RootPage() {
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking')
  const [details, setDetails] = useState<string[]>([])

  useEffect(() => {
    const checkAndRedirect = async () => {
      const logs: string[] = []

      try {
        logs.push('📍 Root page mounted')
        logs.push('🔐 Attempting to get session...')
        setDetails([...logs])

        // Get session with explicit error handling
        const { data, error } = await supabase.auth.getSession()
        const session = data?.session

        if (error) {
          logs.push(`❌ Session error: ${error.message}`)
          setDetails([...logs])
          logs.push('⏱️ Waiting 1 second before redirect...')
          setDetails([...logs])
          await new Promise((resolve) => setTimeout(resolve, 1000))
          logs.push('→ Redirecting to /auth')
          setDetails([...logs])
          setStatus('redirecting')
          window.location.href = '/auth'
          return
        }

        if (session) {
          logs.push(`✅ Session found: ${session.user.email}`)
          logs.push(`🆔 User ID: ${session.user.id}`)
          setDetails([...logs])
          logs.push('⏱️ Waiting 1 second before redirect...')
          setDetails([...logs])
          await new Promise((resolve) => setTimeout(resolve, 1000))
          logs.push('→ Redirecting to /dashboard')
          setDetails([...logs])
          setStatus('redirecting')
          window.location.href = '/dashboard'
          return
        }

        // No session
        logs.push('⚠️ No session found')
        logs.push('🔍 User is not authenticated')
        setDetails([...logs])
        logs.push('⏱️ Waiting 1 second before redirect...')
        setDetails([...logs])
        await new Promise((resolve) => setTimeout(resolve, 1000))
        logs.push('→ Redirecting to /auth')
        setDetails([...logs])
        setStatus('redirecting')
        window.location.href = '/auth'
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        logs.push(`❌ Exception: ${error}`)
        setDetails([...logs])
        logs.push('⏱️ Waiting 2 seconds before redirect...')
        setDetails([...logs])
        await new Promise((resolve) => setTimeout(resolve, 2000))
        logs.push('→ Redirecting to /auth (error recovery)')
        setDetails([...logs])
        setStatus('error')
        window.location.href = '/auth'
      }
    }

    checkAndRedirect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-4">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-xl font-bold text-white">NS</span>
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-slate-400 text-sm font-medium">
              {status === 'checking' && '🔐 Checking authentication...'}
              {status === 'redirecting' && '⏭️ Redirecting...'}
              {status === 'error' && '⚠️ Authentication check'}
            </p>
          </div>

          {/* Debug Details */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-1 min-h-32">
            {details.map((detail, idx) => (
              <div key={idx} className="text-xs text-slate-300 font-mono">
                {detail}
              </div>
            ))}
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              {status === 'checking' && 'Please wait...'}
              {status === 'redirecting' && 'Redirecting to appropriate page...'}
              {status === 'error' && 'An error occurred. Attempting recovery...'}
            </p>
          </div>

          {/* Manual Redirect Buttons (Fallback) */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-700">
            <button
              onClick={() => {
                window.location.href = '/auth'
              }}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                window.location.href = '/dashboard'
              }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded font-medium transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
