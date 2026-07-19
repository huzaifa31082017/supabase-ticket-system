'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react'

export default function SetupPage() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/init-db', { method: 'POST' })
      const data = await response.json()
      setIsInitialized(response.ok && data.status === 'success')
    } catch (error) {
      console.error('Database check failed:', error)
      setIsInitialized(false)
    } finally {
      setIsChecking(false)
    }
  }

  const copyToClipboard = async () => {
    const schemaContent = `-- Copy this to Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  total_population INT NOT NULL DEFAULT 0,
  responsiveness_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
  escalated_count INT DEFAULT 0,
  created_at TIMESTAMPZ DEFAULT NOW(),
  updated_at TIMESTAMPZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wards_responsiveness_score ON wards(responsiveness_score DESC);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at TIMESTAMPZ DEFAULT NOW(),
  sla_deadline TIMESTAMPZ NOT NULL,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPZ,
  resolved_at TIMESTAMPZ,
  updated_at TIMESTAMPZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_ward_id ON tickets(ward_id);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_deadline ON tickets(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_tickets_is_escalated ON tickets(is_escalated);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

CREATE TABLE IF NOT EXISTS escalation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  escalated_at TIMESTAMPZ DEFAULT NOW(),
  reason TEXT NOT NULL,
  created_at TIMESTAMPZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalation_logs_ticket_id ON escalation_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_ward_id ON escalation_logs(ward_id);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'commissioner')),
  ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
  created_at TIMESTAMPZ DEFAULT NOW(),
  updated_at TIMESTAMPZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wards_read_policy" ON wards FOR SELECT USING (true);
CREATE POLICY "tickets_read_policy" ON tickets FOR SELECT USING (true);
CREATE POLICY "users_read_own_policy" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_policy" ON users FOR UPDATE USING (auth.uid() = id);

-- Sample data (optional)
INSERT INTO wards (name, total_population, responsiveness_score, escalated_count) VALUES
('Downtown Ward', 45000, 92, 0),
('North Central Ward', 52000, 85, 2),
('South City Ward', 38000, 78, 3),
('East Point Ward', 41000, 65, 5),
('West End Ward', 39000, 45, 8)
ON CONFLICT (name) DO NOTHING;`

    try {
      await navigator.clipboard.writeText(schemaContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <span className="text-xl font-bold text-white">NS</span>
          </div>
          <p className="text-slate-400">Checking database setup...</p>
        </div>
      </div>
    )
  }

  if (isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Database Ready! ✅</h1>
              <p className="text-slate-400">Your Supabase schema has been initialized successfully.</p>
            </div>
            <a
              href="/dashboard"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition duration-200"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-bold text-white">Setup Required</h1>
            </div>
            <p className="text-slate-400">
              Your database schema needs to be initialized. Follow these steps to get started:
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h3 className="font-semibold text-white">Go to Supabase Dashboard</h3>
              </div>
              <p className="text-sm text-slate-300 ml-11">
                Visit{' '}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  app.supabase.com
                  <ExternalLink className="w-3 h-3" />
                </a>
                {' '}and select your project
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h3 className="font-semibold text-white">Open SQL Editor</h3>
              </div>
              <p className="text-sm text-slate-300 ml-11">
                In the left sidebar, click <span className="bg-slate-600/50 px-2 py-1 rounded text-slate-200">SQL Editor</span>
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <h3 className="font-semibold text-white">Run the Schema SQL</h3>
              </div>
              <p className="text-sm text-slate-300 ml-11 mb-3">
                Copy the SQL code below and paste it into Supabase SQL Editor, then click Run
              </p>
              <div className="ml-11">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied to Clipboard!' : 'Copy SQL Schema'}
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <h3 className="font-semibold text-white">Refresh This Page</h3>
              </div>
              <p className="text-sm text-slate-300 ml-11">
                Once the schema is created, refresh this page and the database check will pass
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              checkDatabase()
              setIsChecking(true)
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 rounded-lg transition duration-200"
          >
            Recheck Database Setup
          </button>

          {/* Help */}
          <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-4">
            <p className="text-xs text-slate-400">
              Need help? Check the README or visit the Supabase documentation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
