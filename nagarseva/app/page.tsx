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
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // User is not authenticated, redirect to auth
          router.push('/auth')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

  // Loading state with minimal UI
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

  // Should not render this as we redirect in useEffect
  return null
}
