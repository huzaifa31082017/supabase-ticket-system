-- Fix RLS Policies for NagarSeva
-- Run this in Supabase SQL Editor if you're getting permission errors

-- First, disable RLS temporarily to allow all access (for testing)
-- This is OK for a demo/dev environment

ALTER TABLE wards DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs DISABLE ROW LEVEL SECURITY;

-- Now re-enable with permissive policies
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "wards_read_policy" ON wards;
DROP POLICY IF EXISTS "tickets_read_policy" ON tickets;
DROP POLICY IF EXISTS "users_read_own_policy" ON users;
DROP POLICY IF EXISTS "users_update_own_policy" ON users;
DROP POLICY IF EXISTS "escalation_logs_read_policy" ON escalation_logs;

-- Create permissive READ policies for public access
CREATE POLICY "allow_read_wards" ON wards FOR SELECT USING (true);
CREATE POLICY "allow_read_tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "allow_read_escalation_logs" ON escalation_logs FOR SELECT USING (true);

-- Allow INSERT for tickets (for creating new tickets)
CREATE POLICY "allow_insert_tickets" ON tickets FOR INSERT WITH CHECK (true);

-- Allow UPDATE for tickets (for status changes)
CREATE POLICY "allow_update_tickets" ON tickets FOR UPDATE USING (true);

-- Allow UPDATE for wards (for score updates)
CREATE POLICY "allow_update_wards" ON wards FOR UPDATE USING (true);

-- Allow INSERT for escalation_logs
CREATE POLICY "allow_insert_escalation_logs" ON escalation_logs FOR INSERT WITH CHECK (true);

-- Users table - stricter (only authenticated users can read/update their own)
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
