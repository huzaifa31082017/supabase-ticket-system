# NagarSeva API Documentation

## Overview

NagarSeva uses Next.js Server Actions for backend operations. All communication between client and server happens through these server actions, which automatically handle serialization and security.

## Server Actions Reference

All server actions are defined in `app/actions/sla-actions.ts` and can be imported and used in client components with the `'use client'` directive.

### 1. getWards()

Fetches all wards ordered by responsiveness score (highest first).

**Usage:**
```typescript
import { getWards } from '@/app/actions/sla-actions';

const wards = await getWards();
```

**Returns:**
```typescript
Ward[]

interface Ward {
  id: string;                    // UUID
  name: string;                  // Ward name
  total_population: number;      // Population count
  responsiveness_score: number;  // Score out of 100
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}
```

**Example Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Downtown Ward",
    "total_population": 45000,
    "responsiveness_score": 92,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "East Side Ward",
    "total_population": 38000,
    "responsiveness_score": 78,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

**Error Handling:**
```typescript
try {
  const wards = await getWards();
  if (!wards || wards.length === 0) {
    console.warn('No wards found');
  }
} catch (error) {
  console.error('Failed to fetch wards:', error);
}
```

---

### 2. getTickets()

Fetches all active (Open or In Progress) tickets with their associated ward information.

**Usage:**
```typescript
import { getTickets } from '@/app/actions/sla-actions';

const tickets = await getTickets();
```

**Returns:**
```typescript
Ticket[]

interface Ticket {
  id: string;                    // UUID
  title: string;                 // Ticket title
  description: string;           // Ticket description
  category: string;              // Category (Roads, Utilities, etc.)
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
  sla_deadline: string;          // ISO timestamp - SLA deadline
  ward_id: string;               // UUID of associated ward
  ward_name: string;             // Name of associated ward
  responsiveness_score: number;  // Current ward score
  is_escalated: boolean;         // Whether ticket is escalated
  escalated_at: string | null;   // ISO timestamp or null
}
```

**Example Response:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440100",
    "title": "Pothole on Main Street",
    "description": "Large pothole affecting traffic",
    "category": "Roads",
    "status": "Open",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T08:00:00Z",
    "sla_deadline": "2024-01-15T10:00:00Z",
    "ward_id": "550e8400-e29b-41d4-a716-446655440000",
    "ward_name": "Downtown Ward",
    "responsiveness_score": 92,
    "is_escalated": false,
    "escalated_at": null
  }
]
```

**Filters Applied:**
- Only returns tickets with status "Open" or "In Progress"
- Ordered by `sla_deadline` (earliest first)
- Uses database view `active_tickets_view` for performance

**Error Handling:**
```typescript
try {
  const tickets = await getTickets();
  const urgentTickets = tickets.filter(t => {
    const deadline = new Date(t.sla_deadline);
    return deadline < new Date();
  });
} catch (error) {
  console.error('Failed to fetch tickets:', error);
}
```

---

### 3. evaluateEscalations()

Evaluates all open/in-progress tickets, escalates overdue ones, and deducts ward responsiveness scores.

**Usage:**
```typescript
import { evaluateEscalations } from '@/app/actions/sla-actions';

const result = await evaluateEscalations();
console.log(`Escalated ${result.escalatedCount} tickets`);
```

**Returns:**
```typescript
{
  success: boolean;              // Operation success status
  escalatedCount: number;        // Number of tickets escalated
  updatedWards: string[];        // Array of ward IDs updated
  message: string;               // Human-readable message
}
```

**Example Response:**
```json
{
  "success": true,
  "escalatedCount": 2,
  "updatedWards": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "message": "Successfully escalated 2 tickets and updated 2 wards"
}
```

**Logic:**
1. Finds all Open/In Progress tickets where `is_escalated = false`
2. Filters for tickets where `sla_deadline < NOW()`
3. Updates these tickets: `is_escalated = true`, `escalated_at = NOW()`
4. For each affected ward:
   - Gets current responsiveness_score
   - Deducts 5 points per escalated ticket
   - Updates ward score (minimum 0)

**Usage Example:**
```typescript
// Schedule this to run periodically (e.g., via cron job)
const result = await evaluateEscalations();

if (result.success) {
  console.log(`Escalation check passed: ${result.escalatedCount} tickets escalated`);
  // Optional: Send notifications, log to audit trail, etc.
} else {
  console.error(`Escalation check failed: ${result.message}`);
}
```

---

### 4. getEscalationSummary()

Returns summary statistics for the Public Accountability Dashboard.

**Usage:**
```typescript
import { getEscalationSummary } from '@/app/actions/sla-actions';

const summary = await getEscalationSummary();
console.log(`Active issues: ${summary.totalActiveIssues}`);
```

**Returns:**
```typescript
{
  totalActiveIssues: number;      // Count of Open + In Progress tickets
  issuesEscalatedToday: number;   // Count of escalated tickets since midnight
  cityWideAverageScore: number;   // Average responsiveness_score across all wards
}
```

**Example Response:**
```json
{
  "totalActiveIssues": 24,
  "issuesEscalatedToday": 3,
  "cityWideAverageScore": 73.4
}
```

**Calculations:**
- **totalActiveIssues**: `COUNT(tickets WHERE status IN ('Open', 'In Progress'))`
- **issuesEscalatedToday**: `COUNT(tickets WHERE is_escalated = true AND escalated_at >= TODAY())`
- **cityWideAverageScore**: `AVG(wards.responsiveness_score)` rounded to 2 decimals

---

## Error Handling Best Practices

### Server Action Error Patterns

All server actions include try-catch blocks and return empty states on failure:

```typescript
// Pattern used in all server actions
try {
  const result = await supabase.from('table').select('*');
  if (error) {
    console.error('Error:', error);
    return []; // or default value
  }
  return result;
} catch (error) {
  console.error('Unexpected error:', error);
  return []; // or default value
}
```

### Client-Side Usage

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getWards } from '@/app/actions/sla-actions';

export function WardList() {
  const [wards, setWards] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getWards();
        
        if (!data || data.length === 0) {
          setError('No wards found');
          setWards([]);
        } else {
          setWards(data);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setWards([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {wards.map(ward => (
        <div key={ward.id}>{ward.name}</div>
      ))}
    </div>
  );
}
```

---

## Scheduling Escalations

The `evaluateEscalations()` function should be called periodically to check for overdue tickets. Here are implementation options:

### Option 1: Cron Job (External Service)

Use EasyCron, AWS CloudWatch Events, or similar to call an API endpoint:

```typescript
// app/api/cron/evaluate-escalations.ts (create this route)
import { evaluateEscalations } from '@/app/actions/sla-actions';

export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await evaluateEscalations();
  return Response.json(result);
}
```

### Option 2: Scheduled Task Library

Use `node-cron` or `bull` for in-process scheduling (not ideal for long-running servers):

```typescript
import cron from 'node-cron';
import { evaluateEscalations } from '@/app/actions/sla-actions';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const result = await evaluateEscalations();
  console.log('Escalation check:', result);
});
```

### Option 3: Supabase Edge Functions

Create a serverless function to run on a schedule.

---

## Type Definitions

All types are exported from `app/types/index.ts`:

```typescript
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketCategory = 'Roads' | 'Utilities' | 'Sanitation' | 'Parks' | 'Water' | 'Other';

export interface Ward { /* ... */ }
export interface Ticket { /* ... */ }
export interface EscalationSummary { /* ... */ }
```

---

## Performance Considerations

1. **Database Indexes**: Queries use indexed columns:
   - `wards.responsiveness_score`
   - `tickets.status`
   - `tickets.sla_deadline`
   - `tickets.is_escalated`

2. **View Performance**: `active_tickets_view` pre-filters and joins for faster retrieval

3. **Pagination** (Future Enhancement):
   ```typescript
   // Add limit/offset to getTickets() for large datasets
   const { data, count } = await supabase
     .from('active_tickets_view')
     .select('*', { count: 'exact' })
     .range(offset, offset + limit);
   ```

4. **Caching** (Future Enhancement):
   ```typescript
   // Implement Redis caching for frequently accessed data
   const cached = await redis.get('wards:list');
   if (cached) return JSON.parse(cached);
   
   const data = await getWards();
   await redis.setex('wards:list', 300, JSON.stringify(data));
   return data;
   ```

---

## Database Schema Reference

### wards table
```sql
CREATE TABLE wards (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  total_population INTEGER,
  responsiveness_score NUMERIC(5,2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX idx_wards_responsiveness_score ON wards(responsiveness_score DESC);
```

### tickets table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  sla_deadline TIMESTAMPTZ NOT NULL,
  ward_id UUID NOT NULL REFERENCES wards(id),
  is_escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline);
CREATE INDEX idx_tickets_is_escalated ON tickets(is_escalated);
```

---

## Migration Guide (Future Updates)

If you need to modify the schema:

1. Create a new SQL migration in `sql/migrations/`
2. Run migrations in Supabase SQL Editor
3. Update TypeScript interfaces in `app/types/index.ts`
4. Update server actions if query logic changes

Example migration:
```sql
-- migration_001_add_priority.sql
ALTER TABLE tickets ADD COLUMN priority TEXT DEFAULT 'Medium';
ALTER TABLE tickets ADD CHECK (priority IN ('Low', 'Medium', 'High', 'Critical'));
```
