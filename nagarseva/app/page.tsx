'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const checkSession = async () => {
      try {
        const msg1 = '🔐 Root page: Starting session check...'
        console.log(msg1)
        setDebugInfo(msg1)

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        const msg2 = `🔐 Root page: Session check result - hasSession: ${!!session}, error: ${sessionError?.message || 'none'}`
        console.log(msg2)
        setDebugInfo((prev) => prev + '\n' + msg2)

        if (sessionError) {
          const msg3 = `❌ Root page: Session error detected: ${sessionError.message}`
          console.error(msg3)
          setDebugInfo((prev) => prev + '\n' + msg3)
          // Wait a moment then redirect
          setTimeout(() => {
            window.location.href = '/auth'
          }, 500)
          return
        }

        if (session) {
          const msg4 = `✅ Root page: User logged in (${session.user.email}), redirecting to dashboard`
          console.log(msg4)
          setDebugInfo((prev) => prev + '\n' + msg4)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 500)
        } else {
          const msg5 = '⚠️ Root page: No session, redirecting to auth'
          console.log(msg5)
          setDebugInfo((prev) => prev + '\n' + msg5)
          setTimeout(() => {
            window.location.href = '/auth'
          }, 500)
        }
      } catch (error) {
        const msg = `❌ Root page: Error checking session: ${error instanceof Error ? error.message : JSON.stringify(error)}`
        console.error(msg)
        setDebugInfo((prev) => prev + '\n' + msg)
        setTimeout(() => {
          window.location.href = '/auth'
        }, 500)
      } finally {
        setIsLoading(false)
      }
    }

    // Start check immediately
    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto animate-pulse">
          <span className="text-xl font-bold text-white">NS</span>
        </div>
        <p className="text-slate-400">Loading NagarSeva...</p>
        {debugInfo && (
          <div className="mt-6 text-left bg-slate-800/50 border border-slate-700/50 rounded p-4 max-w-md mx-auto">
            <p className="text-xs text-slate-400 whitespace-pre-wrap font-mono">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  )
}
