'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔐 Checking session on root page...')
        
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log('🔐 Session result:', { hasSession: !!session, error: sessionError?.message })

        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          window.location.href = '/auth'
          return
        }

        if (session) {
          console.log('✅ User logged in, redirecting to dashboard')
          window.location.href = '/dashboard'
        } else {
          console.log('⚠️ No session, redirecting to auth')
          window.location.href = '/auth'
        }
      } catch (error) {
        console.error('❌ Error checking session:', error)
        window.location.href = '/auth'
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to ensure DOM is ready
    setTimeout(checkSession, 100)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-xl font-bold text-white">NS</span>
          </div>
          <p className="text-slate-400">Loading NagarSeva...</p>
        </div>
      </div>
    )
  }

  return null
}
