'use client'

import { ReactNode, useState } from 'react'

interface TabsProps {
  defaultValue?: string
  className?: string
  children: ReactNode
}

interface TabsListProps {
  className?: string
  children: ReactNode
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: ReactNode
}

interface TabsContentProps {
  value: string
  className?: string
  children: ReactNode
}

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

// Create context for tabs
const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({ defaultValue = '', className = '', children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className = '', children }: TabsListProps) {
  return (
    <div
      className={`flex gap-1 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className = '', children }: TabsTriggerProps) {
  const context = require('react').useContext(TabsContext) as TabsContextType
  const isActive = context.activeTab === value

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`
        px-4 py-2 rounded-lg transition font-medium
        ${isActive
          ? 'bg-blue-600 text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }
        ${className}
      `}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className = '', children }: TabsContentProps) {
  const context = require('react').useContext(TabsContext) as TabsContextType

  if (context.activeTab !== value) {
    return null
  }

  return (
    <div className={className} role="tabpanel">
      {children}
    </div>
  )
}
