'use client'

import { ReactNode } from 'react'
import DashboardNav from '@/app/components/DashboardNav'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>
      <DashboardNav />
      <main className="min-h-screen bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </>
  )
}

