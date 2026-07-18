# NagarSeva - AI Citizen Advocate

A full-stack Next.js application for tracking Service Level Agreements (SLAs) on civic complaints, automating escalations, and providing public accountability dashboards.

## Project Structure

```
nagarseva/
├── app/
│   ├── actions/
│   │   └── sla-actions.ts          # Server actions for data fetching & escalation logic
│   ├── components/
│   │   ├── PublicDashboard.tsx     # Public accountability leaderboard
│   │   └── TicketTracker.tsx       # Internal ticket management dashboard
│   ├── hooks/
│   │   └── useCountdownTimer.ts    # Real-time SLA countdown timer
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── layout.tsx                  # Root layout with metadata
│   ├── page.tsx                    # Home page with tab navigation
│   └── globals.css                 # Global styles & Tailwind config
├── components/ui/
│   ├── card.tsx                    # Card component from shadcn/ui
│   ├── badge.tsx                   # Badge component from shadcn/ui
│   └── tabs.tsx                    # Tabs component from Radix UI
├── sql/
│   └── schema.sql                  # Database schema for Supabase
├── public/                         # Static assets
├── package.json                    # Dependencies
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── next.config.js                  # Next.js configuration
├── postcss.config.js               # PostCSS configuration
└── .env.example                    # Environment variables template
```

## Quick Start

### 1. Install Dependencies

```bash
cd nagarseva
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor and run the SQL schema from `sql/schema.sql`
3. Copy your project URL and API keys

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Public Accountability Dashboard
- **Ward Leaderboard**: Rankings based on responsiveness scores
- **Color Coding**: Green (>80), Yellow (50-79), Red (<50)
- **Summary Statistics**: Total active issues, escalated today, city-wide average
- **Progress Indicators**: Visual representation of ward performance

### Internal Ticket Tracker
- **Live SLA Countdown Timer**: Real-time countdown to SLA deadline
- **Status Filtering**: View tickets by Open, In Progress, or Resolved status
- **Escalation Badges**: "Nudge Sent" (0-24h), "Escalated to Commissioner" (overdue)
- **Auto-Refresh**: Updates every 30 seconds
- **Color-Coded Urgency**: 
  - Green: >24 hours remaining
  - Orange: 0-24 hours remaining
  - Red: Overdue

### Server-Side Logic
- **`getWards()`**: Fetch wards ordered by responsiveness
- **`getTickets()`**: Fetch active tickets with ward info
- **`evaluateEscalations()`**: Automatically escalate overdue tickets and deduct ward scores
- **`getEscalationSummary()`**: Dashboard statistics

## Database Schema

### Tables

**wards**
- `id` (UUID, primary key)
- `name` (TEXT, unique)
- `total_population` (INTEGER)
- `responsiveness_score` (NUMERIC, default 100)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**tickets**
- `id` (UUID, primary key)
- `title`, `description` (TEXT)
- `category` (TEXT)
- `status` (TEXT: 'Open', 'In Progress', 'Resolved')
- `sla_deadline` (TIMESTAMPTZ)
- `ward_id` (UUID, foreign key)
- `is_escalated` (BOOLEAN, default false)
- `escalated_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**active_tickets_view** (VIEW)
- Combines tickets and wards for easy querying

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Next.js Server Actions
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **UI Components**: Radix UI Primitives

## Customization

### Adjust SLA Penalty
In `app/actions/sla-actions.ts`, change the deduction amount:
```typescript
const deductionAmount = wardTickets.length * 5; // Change 5 to your desired value
```

### Modify Timer Colors
In `app/components/TicketTracker.tsx`, update the `getTimerColor()` function:
```typescript
const getTimerColor = () => {
  if (isOverdue) return 'text-red-600 font-bold';
  if (hoursRemaining < 24) return 'text-amber-600 font-semibold'; // Adjust threshold
  return 'text-emerald-600 font-semibold';
};
```

### Add More Categories
In `app/components/TicketTracker.tsx`, extend the `categoryColors` object:
```typescript
const categoryColors: { [key: string]: string } = {
  Roads: 'bg-slate-100 text-slate-800',
  // Add more categories here
};
```

## Security Considerations

- **Row Level Security (RLS)**: Enable on Supabase tables to restrict data by user role
- **Service Role Key**: Use only on the server (stored in `.env` file, not `.env.local`)
- **Input Validation**: Validate all user inputs before database operations
- **Authentication**: Add NextAuth.js or similar for user authentication
- **Rate Limiting**: Implement rate limits on the `evaluateEscalations()` endpoint

## Running Tests

```bash
npm run lint
npm run build
```

## Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Deploy to Other Platforms

This is a standard Next.js project and can be deployed to:
- Netlify
- Railway
- Render
- AWS Amplify
- Docker-based hosting

## Support & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.
