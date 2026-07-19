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
        // First check if database is initialized
        const dbCheck = await fetch('/api/init-db', { method: 'POST' })
        const dbData = await dbCheck.json()

        if (!dbCheck.ok) {
          // Database not initialized, go to setup
          router.push('/setup')
          return
        }

        // Database is ready, check session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          router.push('/dashboard')
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Error during initialization:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [router])

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
