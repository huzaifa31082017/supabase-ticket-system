'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import PublicDashboard from '@/app/components/PublicDashboard'
import TicketTracker from '@/app/components/TicketTracker'
import { BarChart3, Ticket } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('public')
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session check error:', sessionError)
          setAuthError(sessionError.message)
          router.push('/auth')
          return
        }

        if (!session) {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setAuthError(errorMsg)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-100">
          <p>Authentication Error: {authError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor SLA compliance and ticket escalations</p>
      </div>

      {/* Tabs */}
         <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 p-1">
          <TabsTrigger
            value="public"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Public Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Ticket Tracker</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
        </TabsList>

        {/* Public Dashboard Tab */}
        <TabsContent value="public" className="mt-6">
          <PublicDashboard />
        </TabsContent>

        {/* Ticket Tracker Tab */}
        <TabsContent value="tickets" className="mt-6">
          <TicketTracker />
        </TabsContent>
      </Tabs>
    </div>
  )
}
