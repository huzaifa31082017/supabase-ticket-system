# NagarSeva Setup Guide

This guide will walk you through setting up the NagarSeva AI Citizen Advocate application from scratch.

## Prerequisites

- Node.js 18+ or newer
- npm or yarn package manager
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter a project name (e.g., "NagarSeva")
4. Create a strong password
5. Wait for the project to initialize

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `sql/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)

You should see success messages for all table and view creations.

### 3. Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (under "Project API keys")
   - **service_role key** (under "Project API keys")

### 4. Install the Project Locally

```bash
# Navigate to the project directory
cd nagarseva

# Install dependencies
npm install

# If using yarn
yarn install
```

### 5. Configure Environment Variables

1. Open `.env.example` to see the template
2. Create a new file named `.env.local` in the project root
3. Copy the contents of `.env.example` into `.env.local`
4. Replace the placeholder values with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
```

**Important Security Notes:**
- Never commit `.env.local` to version control (it's in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- Keep these credentials private and secure

### 6. Run the Development Server

```bash
npm run dev
```

You should see output like:
```
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see:
- Public Dashboard tab with ward leaderboard
- Ticket Tracker tab with active tickets

### 7. Test the Application

#### Test Public Dashboard:
- Navigate to the "Public Dashboard" tab
- You should see 5 wards with responsiveness scores
- Try switching between tabs to verify navigation works

#### Test Ticket Tracker:
- Navigate to the "Ticket Tracker" tab
- You should see 5 active tickets with countdown timers
- Click filter buttons ("All", "Open", "In Progress") to test filtering
- Verify the countdown timers update every second

#### Verify Real-Time Updates:
- Leave the app open for 30+ seconds
- The ticket list should auto-refresh (you'll see slight changes)
- Timers should update in real-time

## Troubleshooting

### Issue: "Could not find Supabase URL" error

**Solution:** Ensure `.env.local` exists and contains the correct `NEXT_PUBLIC_SUPABASE_URL`.

### Issue: Database connection fails

**Solution:**
1. Verify credentials are copied correctly from Supabase Settings
2. Check that the database schema was successfully created in Supabase
3. Run the SQL schema again if needed

### Issue: Countdown timers not updating

**Solution:**
1. Check browser console (F12) for JavaScript errors
2. Verify the deadline values are valid ISO strings
3. Try refreshing the page

### Issue: Port 3000 is already in use

**Solution:** Run on a different port:
```bash
npm run dev -- -p 3001
```

## Next Steps

### Enable Authentication (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication → Providers**
2. Enable email/password authentication or OAuth providers
3. Update the app to add auth flows (integrate NextAuth.js or Supabase Auth)

### Set Up Row Level Security (RLS)

1. In Supabase dashboard, go to **Authentication → Policies**
2. Enable RLS on the `wards` and `tickets` tables
3. Create policies for different user roles

### Deploy to Production

#### Option A: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

#### Option B: Other Platforms

The app can be deployed to:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo via dashboard
- **Netlify**: Connect GitHub repo via dashboard
- **Docker**: Build and push to container registry

### Monitor and Optimize

1. Set up Supabase monitoring to track query performance
2. Implement request logging with a monitoring service
3. Add error tracking with Sentry or similar
4. Monitor SLA evaluations with cron jobs or scheduled functions

## Project Structure

```
nagarseva/
├── app/
│   ├── actions/          # Server actions (data fetching, escalations)
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks (e.g., countdown timer)
│   ├── types/           # TypeScript interfaces
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/ui/       # Reusable UI components
├── public/             # Static files
├── sql/                # Database migrations
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Build for production
npm run build           # Creates optimized production build
npm run start           # Start production server

# Linting
npm run lint            # Check code style

# Format code (optional)
npm run format          # Requires prettier to be installed
```

## Key Features Overview

### 1. Public Accountability Dashboard
- Ward leaderboard ranked by responsiveness
- Color-coded performance indicators
- Real-time statistics
- Population and score tracking

### 2. Internal Ticket Tracker
- Live countdown timers to SLA deadlines
- Kanban-style ticket list
- Status filtering (Open, In Progress, Resolved)
- Escalation indicators
- Category badges

### 3. Backend Automation
- Automatic SLA deadline monitoring
- Escalation logic that deducts ward scores
- Real-time data sync
- Server-side calculations for accuracy

## Performance Tips

1. **Database Queries**: The app uses indexed queries for fast lookups
2. **Caching**: Consider implementing Redis caching for frequently accessed data
3. **Images**: Optimize ward/ticket images if adding them
4. **Auto-refresh**: Currently set to 30 seconds; adjust in `TicketTracker.tsx` as needed

## Security Checklist

- [ ] Store all credentials in `.env.local` (never in code)
- [ ] Enable Row Level Security on database tables
- [ ] Use service role key only server-side
- [ ] Validate all user inputs
- [ ] Rate limit API endpoints
- [ ] Set up CORS policies
- [ ] Enable HTTPS in production
- [ ] Regular security audits

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review [Next.js docs](https://nextjs.org/docs)
3. Check [Supabase docs](https://supabase.com/docs)
4. Check [Tailwind docs](https://tailwindcss.com/docs)

## Version Information

- Next.js: ^14.0.0
- React: ^18.2.0
- Supabase: ^2.38.0
- Tailwind CSS: ^3.3.0
- TypeScript: ^5.3.0

Happy coding! 🚀
