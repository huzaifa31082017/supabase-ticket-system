-- ============================================================================
-- NAGARSEVA: AI CITIZEN ADVOCATE - DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. WARDS TABLE
-- ============================================================================
CREATE TABLE wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  total_population INT NOT NULL DEFAULT 0,
  responsiveness_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
  escalated_count INT DEFAULT 0,
  created_at TIMESTAMPZ DEFAULT NOW(),
  updated_at TIMESTAMPZ DEFAULT NOW()
);

-- Create index on responsiveness_score for faster queries
CREATE INDEX idx_wards_responsiveness_score ON wards(responsiveness_score DESC);

-- ============================================================================
-- 2. TICKETS TABLE
-- ============================================================================
CREATE TABLE tickets (
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

-- Create indexes for better query performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_ward_id ON tickets(ward_id);
CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline);
CREATE INDEX idx_tickets_is_escalated ON tickets(is_escalated);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- ============================================================================
-- 3. AUDIT LOG TABLE (for tracking escalations)
-- ============================================================================
CREATE TABLE escalation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  escalated_at TIMESTAMPZ DEFAULT NOW(),
  reason TEXT NOT NULL,
  created_at TIMESTAMPZ DEFAULT NOW()
);

-- Create index for audit purposes
CREATE INDEX idx_escalation_logs_ticket_id ON escalation_logs(ticket_id);
CREATE INDEX idx_escalation_logs_ward_id ON escalation_logs(ward_id);

-- ============================================================================
-- 4. USERS TABLE (for authentication & tracking)
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'commissioner')),
  ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
  created_at TIMESTAMPZ DEFAULT NOW(),
  updated_at TIMESTAMPZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- 5. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active Tickets with Ward Names
CREATE VIEW active_tickets_view AS
SELECT
  t.id,
  t.title,
  t.description,
  t.category,
  t.status,
  t.created_at,
  t.sla_deadline,
  t.is_escalated,
  t.escalated_at,
  w.id AS ward_id,
  w.name AS ward_name,
  w.responsiveness_score,
  EXTRACT(EPOCH FROM (t.sla_deadline - NOW())) / 3600 AS hours_remaining
FROM tickets t
LEFT JOIN wards w ON t.ward_id = w.id
WHERE t.status IN ('Open', 'In Progress')
ORDER BY t.sla_deadline ASC;

-- View: Ward Statistics
CREATE VIEW ward_statistics_view AS
SELECT
  w.id,
  w.name,
  w.total_population,
  w.responsiveness_score,
  COUNT(CASE WHEN t.status IN ('Open', 'In Progress') THEN 1 END) AS active_tickets,
  COUNT(CASE WHEN t.is_escalated = TRUE AND t.status IN ('Open', 'In Progress') THEN 1 END) AS escalated_tickets,
  COUNT(CASE WHEN t.status = 'Resolved' THEN 1 END) AS resolved_tickets
FROM wards w
LEFT JOIN tickets t ON w.id = t.ward_id
GROUP BY w.id, w.name, w.total_population, w.responsiveness_score;

-- ============================================================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ============================================================================

INSERT INTO wards (name, total_population, responsiveness_score, escalated_count) VALUES
('Downtown Ward', 45000, 92, 0),
('North Central Ward', 52000, 85, 2),
('South City Ward', 38000, 78, 3),
('East Point Ward', 41000, 65, 5),
('West End Ward', 39000, 45, 8);

INSERT INTO tickets (title, description, category, status, sla_deadline, ward_id, is_escalated) VALUES
('Pothole repair on Main Street', 'Large pothole creating traffic hazard', 'Infrastructure', 'Open', NOW() + INTERVAL '2 days', (SELECT id FROM wards WHERE name = 'Downtown Ward'), FALSE),
('Water supply interruption', 'Residents reporting no water supply in sector 5', 'Water Supply', 'In Progress', NOW() + INTERVAL '6 hours', (SELECT id FROM wards WHERE name = 'North Central Ward'), FALSE),
('Street light malfunction', 'Multiple street lights not working on 5th Avenue', 'Public Safety', 'Open', NOW() - INTERVAL '2 hours', (SELECT id FROM wards WHERE name = 'East Point Ward'), TRUE),
('Garbage collection delay', 'Waste not collected for 3 days', 'Sanitation', 'In Progress', NOW() + INTERVAL '12 hours', (SELECT id FROM wards WHERE name = 'South City Ward'), FALSE),
('Park maintenance issue', 'Broken playground equipment', 'Parks & Recreation', 'Open', NOW() + INTERVAL '5 days', (SELECT id FROM wards WHERE name = 'West End Ward'), FALSE);

-- ============================================================================
-- 7. RLS (ROW LEVEL SECURITY) - Supabase specific
-- ============================================================================

-- Enable RLS
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to wards and active tickets
CREATE POLICY "wards_read_policy" ON wards FOR SELECT USING (true);
CREATE POLICY "tickets_read_policy" ON tickets FOR SELECT USING (true);

-- Allow authenticated users to manage their own data
CREATE POLICY "users_read_own_policy" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_policy" ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- NOTES FOR PRODUCTION:
-- 1. Set up proper RLS policies for admin/commissioner roles
-- 2. Add triggers for updated_at timestamp updates
-- 3. Consider partitioning tickets table if it grows beyond 1M rows
-- 4. Set up automated backup schedules
-- 5. Configure connection pooling in Supabase
-- ============================================================================
