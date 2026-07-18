# NagarSeva Architecture & Features

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React Components (TSX)                                │  │
│  │  ├── PublicDashboard.tsx                              │  │
│  │  ├── TicketTracker.tsx                                │  │
│  │  └── Custom Hooks (useCountdownTimer)                 │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/RPC (Serialized)
┌──────────────────────▼──────────────────────────────────────┐
│              Next.js App Router (Server)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Server Actions (app/actions/)                         │  │
│  │  ├── getWards()                                        │  │
│  │  ├── getTickets()                                      │  │
│  │  ├── evaluateEscalations()                             │  │
│  │  └── getEscalationSummary()                            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
┌──────────────────────▼──────────────────────────────────────┐
│          Supabase (PostgreSQL + Auth)                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Tables:                                               │  │
│  │  ├── wards (responsiveness tracking)                  │  │
│  │  ├── tickets (complaint management)                    │  │
│  │  └── active_tickets_view (optimized queries)           │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | Next.js 14 (App Router) | Server-first React with built-in optimizations |
| **Frontend** | React 18 | Component-based UI development |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui + Radix UI | Accessible, unstyled components |
| **Icons** | Lucide React | Beautiful SVG icon library |
| **Backend** | Next.js Server Actions | Type-safe, encrypted RPC calls |
| **Database** | Supabase (PostgreSQL) | Managed PostgreSQL with real-time features |
| **Authentication** | Supabase Auth | Built-in user management (optional) |
| **Deployment** | Vercel (recommended) | Optimized for Next.js |

---

## Core Features

### 1. Public Accountability Dashboard

**Purpose:** Provides transparency to citizens about ward responsiveness

#### Components:
- **Ward Leaderboard**: Displays all wards ranked by responsiveness score
- **Color Coding System**:
  - 🟢 Green (>80): Excellent responsiveness
  - 🟡 Yellow (50-79): Average responsiveness
  - 🔴 Red (<50): Poor responsiveness
- **Progress Indicators**: Visual bars showing score progression
- **Summary Statistics**:
  - Total Active Issues
  - Issues Escalated Today
  - City-Wide Average Score

#### Data Flow:
```
PublicDashboard.tsx
    ↓ (useEffect on mount)
    ↓ Promise.all([getWards(), getEscalationSummary()])
    ↓ (Server Action)
    ↓ Supabase Query
    ↓ Response → Component State
    ↓ Render UI
```

#### Use Cases:
- Citizens check ward performance
- Media reports on city responsiveness
- Government officials monitor accountability
- Budget decisions based on performance

---

### 2. Internal Ticket Tracker

**Purpose:** Helps internal staff manage SLA compliance and escalations

#### Key Features:

##### Live Countdown Timer
- **Implementation**: `useCountdownTimer` hook updates every 1 second
- **Displays**: Days, hours, minutes, or seconds remaining
- **Visual Feedback**:
  ```
  > 24 hours: 🟢 Green text (comfortable)
  0-24 hours: 🟡 Orange/Yellow text + "🔔 Nudge Sent" badge
  < 0 (overdue): 🔴 Red text + negative timer + "⚠️ Escalated" badge
  ```

##### Status Filtering
- Tabs to filter by: All, Open, In Progress, Resolved
- Only displays Open and In Progress tickets by default

##### Quick Statistics
- Total Active tickets
- About to Escalate (overdue but not yet escalated)
- Already Escalated

##### Ticket Information Display
- **ID**: Shortened UUID for reference
- **Title**: Complaint summary
- **Category**: Roads, Utilities, Sanitation, Parks, Water
- **Ward**: Associated ward name
- **Status**: Open, In Progress, or Resolved
- **SLA Countdown**: Live timer with color coding
- **Badges**: Escalation status indicators

#### Data Flow:
```
TicketTracker.tsx
    ↓ (useEffect on mount + 30s refresh)
    ↓ getTickets() (Server Action)
    ↓ Supabase Query (active_tickets_view)
    ↓ Response → Component State
    ↓ TicketRow.tsx
        ↓ useCountdownTimer(sla_deadline)
        ↓ Update every 1 second
        ↓ Re-render with timer
```

#### Use Cases:
- Staff tracks ticket compliance
- Identifies tickets needing urgent attention
- Monitors escalation trends
- Prioritizes work queue

---

### 3. Automated SLA Evaluation & Escalation

**Purpose:** Automatically escalate overdue tickets and penalize wards

#### Process Flow:
```
evaluateEscalations()
    ↓
    1. Query all Open/In Progress tickets where:
       - is_escalated = false
       - sla_deadline < NOW()
    ↓
    2. For each overdue ticket:
       - Update is_escalated = true
       - Set escalated_at = NOW()
    ↓
    3. For each affected ward:
       - Get current responsiveness_score
       - Deduct 5 points per escalated ticket
       - Update ward score (minimum 0)
    ↓
    4. Return success status & statistics
```

#### Penalty System:
- Base penalty: 5 points per escalated ticket
- Accumulates across multiple escalations
- Cannot go below 0 points
- Creates visible accountability

#### Scheduling:
- **Recommended**: Run every 5-15 minutes via cron job
- **Alternative**: Run on-demand when viewing dashboard
- **Implementation**: See API.md for scheduling options

---

## Data Model

### Wards Table

```typescript
{
  id: UUID,                    // Primary key
  name: string,                // Unique ward identifier
  total_population: number,    // Population for context
  responsiveness_score: number,// Score (0-100) - updated by escalations
  created_at: timestamp,       // Record creation
  updated_at: timestamp        // Last modification
}
```

**Queries:**
- `SELECT * FROM wards ORDER BY responsiveness_score DESC` (leaderboard)
- `AVG(responsiveness_score)` (city-wide average)

### Tickets Table

```typescript
{
  id: UUID,                    // Primary key
  title: string,               // Complaint title
  description: string,         // Full complaint details
  category: string,            // Type (Roads, Utilities, etc.)
  status: enum,                // Open | In Progress | Resolved
  sla_deadline: timestamp,     // Deadline for resolution
  ward_id: UUID (FK),          // Associated ward
  is_escalated: boolean,       // Escalation status
  escalated_at: timestamp,     // When escalation occurred
  created_at: timestamp,       // Report date
  updated_at: timestamp        // Last status change
}
```

**Queries:**
- `SELECT * FROM active_tickets_view WHERE status IN ('Open', 'In Progress')`
- `SELECT * FROM tickets WHERE is_escalated = true AND escalated_at >= TODAY()`
- `SELECT * FROM tickets WHERE sla_deadline < NOW() AND is_escalated = false`

### Active Tickets View

```sql
CREATE OR REPLACE VIEW active_tickets_view AS
SELECT 
  t.*,
  w.name as ward_name,
  w.responsiveness_score
FROM tickets t
JOIN wards w ON t.ward_id = w.id
WHERE t.status IN ('Open', 'In Progress')
ORDER BY t.sla_deadline ASC;
```

**Purpose:** Optimizes queries by pre-joining and pre-filtering

---

## User Interface Design

### Color Palette (Monochromatic + Accents)

**Base Colors (Monochromatic):**
- White: `#ffffff`
- Light Gray: `#f8fafc` (slate-50)
- Medium Gray: `#e2e8f0` (slate-200)
- Dark Gray: `#334155` (slate-700)
- Black: `#0f172a` (slate-900)

**Accent Colors (Status Indicators):**
- Green: `#059669` (emerald-600) - Status: Good
- Yellow/Amber: `#d97706` (amber-600) - Status: Warning
- Red: `#dc2626` (red-600) - Status: Critical

### Responsive Design

```css
/* Mobile First */
- 1 column layout on sm (<640px)
- 2-3 columns on md (768px+)
- 4+ columns on lg (1024px+)
```

### Accessibility

- Semantic HTML (buttons, headers, etc.)
- Color contrast ratios > 4.5:1
- Keyboard navigation support
- ARIA labels where needed
- Focus indicators visible

---

## Performance Optimizations

### Database Level

1. **Indexes**:
   ```sql
   CREATE INDEX idx_wards_responsiveness_score ON wards(responsiveness_score DESC);
   CREATE INDEX idx_tickets_status ON tickets(status);
   CREATE INDEX idx_tickets_sla_deadline ON tickets(sla_deadline);
   CREATE INDEX idx_tickets_is_escalated ON tickets(is_escalated);
   ```

2. **Views**: Pre-filtered, pre-joined data reduces query complexity

3. **Connection Pooling**: Use PgBouncer for high-concurrency

### Application Level

1. **Server Actions**: Encrypted RPC → smaller payload than REST API
2. **React Hooks**: Efficient state management with `useState`, `useEffect`
3. **Memoization** (Future):
   ```typescript
   const memoizedWards = useMemo(() => wards.sort(...), [wards]);
   ```

4. **Pagination** (Future):
   ```typescript
   const [page, setPage] = useState(1);
   const limit = 20;
   const offset = (page - 1) * limit;
   ```

### Deployment Level

1. **Vercel**: Automatic edge caching, automatic scaling
2. **Next.js**: Optimized bundle splitting, dead code elimination
3. **Tailwind**: Purged CSS (unused styles removed)

---

## Security Architecture

### Authentication & Authorization

**Current State:** Open (no auth required)

**Recommended Implementation:**

```typescript
// Add to middleware (app/middleware.ts)
import { auth } from '@/app/auth';

export async function middleware(request: Request) {
  const session = await auth();
  
  if (!session && request.nextUrl.pathname.startsWith('/api')) {
    return new Response('Unauthorized', { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*']
};
```

### Row Level Security (RLS)

**Supabase RLS Policies** (recommended):

```sql
-- Allow anonymous read access to wards
CREATE POLICY "Enable read access for all users" ON wards
  FOR SELECT USING (true);

-- Allow only staff to view sensitive ticket data
CREATE POLICY "Enable read for authenticated users" ON tickets
  FOR SELECT USING (auth.role() = 'authenticated');

-- Restrict ticket updates to admins
CREATE POLICY "Enable updates for admins only" ON tickets
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
```

### Data Protection

1. **Environment Variables**: Never committed to git
2. **Service Role Key**: Only used on server
3. **Anon Key**: Can be safely exposed (read-only for public data)
4. **HTTPS**: Enforced on production
5. **Rate Limiting**: Implement via middleware

---

## Future Enhancements

### Phase 2: Authentication & User Roles

```typescript
enum UserRole {
  CITIZEN = 'citizen',           // View-only access
  STAFF = 'staff',               // Can manage tickets
  COMMISSIONER = 'commissioner',  // Can escalate
  ADMIN = 'admin'                // Full access
}
```

### Phase 3: Real-Time Updates

```typescript
// Use Supabase real-time subscriptions
const subscription = supabase
  .on('postgres_changes', 
       { event: 'UPDATE', schema: 'public', table: 'tickets' },
       (payload) => {
         // Update UI in real-time
         setTickets(prev => 
           prev.map(t => t.id === payload.new.id ? payload.new : t)
         );
       }
  )
  .subscribe();
```

### Phase 4: Notifications & Alerts

- Email notifications for escalations
- SMS alerts for critical issues
- Push notifications for mobile app
- Integration with Twilio or SendGrid

### Phase 5: Advanced Analytics

- Dashboard with charts (Chart.js, Recharts)
- Trend analysis over time
- Predictive analytics for SLA breaches
- Export reports to PDF/Excel

### Phase 6: Mobile App

- React Native app using same backend
- Offline-first architecture
- Photo upload for complaints
- Location services for ward identification

### Phase 7: AI Integration

- AI-powered complaint categorization
- Duplicate detection
- Sentiment analysis
- Predictive routing to appropriate ward

---

## Monitoring & Observability

### Metrics to Track

1. **SLA Compliance Rate**: % of tickets resolved before deadline
2. **Average Response Time**: Mean time to first action
3. **Escalation Rate**: % of tickets that require escalation
4. **Ward Performance Score**: Responsiveness metric over time
5. **API Response Times**: Server action execution time
6. **Error Rates**: Failed queries, API errors

### Logging Strategy

```typescript
// Example: Log escalation events
async function logEscalation(ticketId: string, wardId: string) {
  await supabase.from('audit_logs').insert({
    event: 'TICKET_ESCALATED',
    ticket_id: ticketId,
    ward_id: wardId,
    timestamp: new Date().toISOString(),
    user_id: getCurrentUserId(),
  });
}
```

### Tools (Recommended)

1. **Sentry**: Error tracking & alerting
2. **Datadog**: Comprehensive monitoring
3. **LogRocket**: Session replay & debugging
4. **Vercel Analytics**: Web vitals tracking

---

## Disaster Recovery

### Backup Strategy

1. **Database**:
   - Supabase: Automatic daily backups
   - Point-in-time recovery: Last 7 days (Pro plan)

2. **Code**:
   - GitHub: Primary repository
   - GitHub Actions: CI/CD pipeline

3. **Configuration**:
   - Vercel Secrets: Encrypted env vars
   - Documentation: Stored in repo

### Recovery Procedures

**Database Failure:**
1. Restore from backup in Supabase dashboard
2. Verify data integrity
3. Roll forward from transaction logs

**Application Failure:**
1. Check Vercel deployment logs
2. Revert to previous deployment
3. Scale replicas if needed

**Data Corruption:**
1. Stop all write operations
2. Restore from backup
3. Replay transaction logs from last good state

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// Example: Test escalation logic
describe('evaluateEscalations', () => {
  it('should escalate overdue tickets', async () => {
    const result = await evaluateEscalations();
    expect(result.success).toBe(true);
    expect(result.escalatedCount).toBeGreaterThan(0);
  });
});
```

### Integration Tests (Cypress)

```typescript
// Example: Test UI flow
describe('Public Dashboard', () => {
  it('should display ward leaderboard', () => {
    cy.visit('/');
    cy.contains('Ward Responsiveness Leaderboard').should('be.visible');
    cy.get('[data-testid=ward-card]').should('have.length.greaterThan', 0);
  });
});
```

### Performance Tests (Lighthouse)

- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Accessibility: Score >90
- Best Practices: Score >90

---

## Conclusion

NagarSeva is a production-ready civic tech platform designed to improve government responsiveness through automated SLA tracking, transparent accountability dashboards, and scalable infrastructure.

The architecture supports:
- ✅ Type-safe development with TypeScript
- ✅ Real-time data updates with countdown timers
- ✅ Automatic escalation logic for fairness
- ✅ Responsive UI for all device sizes
- ✅ Secure, scalable backend
- ✅ Easy deployment & maintenance
- ✅ Extensible for future features

See SETUP.md, API.md, and DEPLOYMENT.md for implementation details.
