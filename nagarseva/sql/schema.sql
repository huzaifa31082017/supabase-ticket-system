-- Create the wards table
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  total_population INTEGER NOT NULL DEFAULT 0,
  responsiveness_score NUMERIC(5, 2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_ward_id (ward_id),
  INDEX idx_tickets_sla_deadline (sla_deadline)
);

-- Create indexes for performance
CREATE INDEX idx_wards_responsiveness_score ON wards(responsiveness_score DESC);
CREATE INDEX idx_tickets_is_escalated ON tickets(is_escalated);

-- Create a view for active tickets with ward names
CREATE OR REPLACE VIEW active_tickets_view AS
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
  w.id as ward_id,
  w.name as ward_name,
  w.responsiveness_score
FROM tickets t
JOIN wards w ON t.ward_id = w.id
WHERE t.status IN ('Open', 'In Progress')
ORDER BY t.sla_deadline ASC;

-- Enable Row Level Security (optional, configure as needed)
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Sample data (optional - remove in production)
INSERT INTO wards (name, total_population, responsiveness_score) VALUES
('Downtown Ward', 45000, 92),
('East Side Ward', 38000, 78),
('North Ward', 52000, 65),
('West Side Ward', 41000, 88),
('South Ward', 36000, 42);

INSERT INTO tickets (title, description, category, status, sla_deadline, ward_id, is_escalated) VALUES
('Pothole on Main Street', 'Large pothole affecting traffic', 'Roads', 'Open', NOW() + INTERVAL '2 hours', 
  (SELECT id FROM wards WHERE name = 'Downtown Ward'), FALSE),
('Street Light Out', 'No lighting at intersection', 'Utilities', 'In Progress', NOW() + INTERVAL '30 hours',
  (SELECT id FROM wards WHERE name = 'East Side Ward'), FALSE),
('Garbage Collection Delay', 'Waste not collected for 3 days', 'Sanitation', 'Open', NOW() - INTERVAL '5 hours',
  (SELECT id FROM wards WHERE name = 'North Ward'), FALSE),
('Park Maintenance Issue', 'Broken benches and overgrown grass', 'Parks', 'In Progress', NOW() + INTERVAL '48 hours',
  (SELECT id FROM wards WHERE name = 'West Side Ward'), FALSE),
('Water Supply Issue', 'Low pressure in residential area', 'Water', 'Open', NOW() + INTERVAL '12 hours',
  (SELECT id FROM wards WHERE name = 'South Ward'), FALSE);
