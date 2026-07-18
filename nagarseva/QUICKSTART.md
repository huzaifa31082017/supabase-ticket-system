# NagarSeva Quick Start Checklist

Get up and running with NagarSeva in 15 minutes!

## Pre-Setup (5 minutes)

- [ ] **Install Node.js 18+**
  - Download from [nodejs.org](https://nodejs.org)
  - Verify: `node --version`

- [ ] **Create Supabase Account**
  - Go to [supabase.com](https://supabase.com)
  - Sign up for free tier
  - Create a new project

## Database Setup (3 minutes)

- [ ] **Get Supabase Credentials**
  - In Supabase dashboard: Settings → API
  - Copy: Project URL, anon key, service_role key

- [ ] **Create Database Schema**
  - Open Supabase SQL Editor
  - Create new query
  - Copy entire contents of `sql/schema.sql`
  - Paste and run
  - Verify: You should see 5 wards and 5 tickets in data

## Local Setup (5 minutes)

- [ ] **Install Dependencies**
  ```bash
  cd nagarseva
  npm install
  ```

- [ ] **Create `.env.local`**
  ```bash
  # Copy from .env.example and fill in values:
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  ```

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```

## First Launch (2 minutes)

- [ ] **Open in Browser**
  - Go to http://localhost:3000
  - You should see the app with 2 tabs

- [ ] **Test Public Dashboard**
  - Click "Public Dashboard" tab
  - Verify: See 5 wards with scores
  - Verify: See green/yellow/red color coding
  - Verify: See summary statistics (24, 0, 73.4)

- [ ] **Test Ticket Tracker**
  - Click "Ticket Tracker" tab
  - Verify: See 5 tickets with titles
  - Verify: See countdown timers updating every second
  - Verify: See "🔔 Nudge Sent" or "⚠️ Escalated" badges
  - Verify: Filter buttons work (All, Open, In Progress, Resolved)

## Success! 🎉

If everything works, you now have:
- ✅ Functional public accountability dashboard
- ✅ Internal ticket management system
- ✅ Real-time SLA countdown timers
- ✅ Live auto-refresh every 30 seconds
- ✅ Color-coded urgency indicators

## Next Steps

### Option 1: Explore the Code
- Read `app/components/PublicDashboard.tsx` to understand UI structure
- Check `app/actions/sla-actions.ts` to see backend logic
- Study `app/hooks/useCountdownTimer.ts` for timer implementation

### Option 2: Customize
- Change sample data in `sql/schema.sql`
- Modify colors in Tailwind config
- Add more ward categories or ticket types

### Option 3: Deploy
- See `DEPLOYMENT.md` for production setup
- Recommended: Deploy to Vercel in 5 minutes

### Option 4: Add Features
- See `ARCHITECTURE.md` for Phase 2 ideas
- Implement authentication using Supabase Auth
- Add real-time updates with Supabase subscriptions

## Troubleshooting

### Problem: "Could not find Supabase URL"
**Solution:**
1. Check `.env.local` exists in project root
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Problem: Blank page or errors
**Solution:**
1. Open browser console (F12)
2. Check for error messages
3. Verify database schema was created
4. Verify env vars are correct

### Problem: Port 3000 already in use
**Solution:**
```bash
npm run dev -- -p 3001
# Now visit http://localhost:3001
```

### Problem: Timers not updating
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify JavaScript is enabled

## Quick Reference

### File Locations
```
nagarseva/
├── app/components/
│   ├── PublicDashboard.tsx    ← Public dashboard UI
│   └── TicketTracker.tsx      ← Internal ticket tracker
├── app/actions/
│   └── sla-actions.ts         ← Backend logic
├── app/hooks/
│   └── useCountdownTimer.ts   ← Timer hook
├── sql/
│   └── schema.sql             ← Database schema
└── DOCUMENTATION FILES
    ├── README.md              ← Overview
    ├── SETUP.md              ← Detailed setup
    ├── API.md                ← API reference
    ├── DEPLOYMENT.md         ← Production guide
    └── ARCHITECTURE.md       ← System design
```

### Key Commands
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Run production build locally
npm run lint     # Check code style
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL        # From Supabase Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY   # From Supabase Settings → API
SUPABASE_SERVICE_ROLE_KEY       # From Supabase Settings → API (secret)
```

## Sample Data

### Wards (5 pre-loaded)
| Ward | Population | Score | Status |
|------|-----------|-------|--------|
| Downtown Ward | 45,000 | 92 | 🟢 Excellent |
| East Side Ward | 38,000 | 78 | 🟡 Good |
| North Ward | 52,000 | 65 | 🟡 Average |
| West Side Ward | 41,000 | 88 | 🟢 Excellent |
| South Ward | 36,000 | 42 | 🔴 Poor |

### Tickets (5 pre-loaded)
| Title | Category | Status | SLA | Ward |
|-------|----------|--------|-----|------|
| Pothole on Main Street | Roads | Open | 2h | Downtown |
| Street Light Out | Utilities | In Progress | 30h | East Side |
| Garbage Collection Delay | Sanitation | Open | -5h | North |
| Park Maintenance | Parks | In Progress | 48h | West Side |
| Water Supply Issue | Water | Open | 12h | South |

## Architecture Overview

```
Browser (Public Dashboard + Ticket Tracker)
    ↓ (React Components)
    ↓
Next.js Server Actions (Encrypted RPC)
    ↓
Supabase PostgreSQL Database
    ↓ (Automatically managed backups)
```

## Performance Baseline

Typical response times:
- Page load: 1-2 seconds
- Ticket fetch: 200-500ms
- Ward leaderboard: 100-300ms
- Timer update: <1ms (client-side)

## Support Resources

- 📚 **SETUP.md**: Detailed setup guide
- 📖 **API.md**: Server actions reference
- 🚀 **DEPLOYMENT.md**: Production deployment guide
- 🏗️ **ARCHITECTURE.md**: System design & future phases
- 💻 **README.md**: Project overview

## Security Reminders

- 🔐 Never commit `.env.local` to git
- 🔐 Never share `SUPABASE_SERVICE_ROLE_KEY`
- 🔐 Only use service role key on server
- 🔐 Always use HTTPS in production
- 🔐 Enable Row Level Security before production

## What's Included

✅ **Frontend**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Live countdown timers
- Responsive design
- Color-coded urgency indicators

✅ **Backend**
- Next.js Server Actions
- Supabase PostgreSQL integration
- Automatic escalation logic
- SLA evaluation engine
- Secure server-side operations

✅ **Database**
- Wards table (5 wards pre-loaded)
- Tickets table (5 tickets pre-loaded)
- Active tickets view (optimized queries)
- Proper indexes for performance
- Cascade deletes for data integrity

✅ **Documentation**
- Setup guide
- API reference
- Deployment guide
- Architecture documentation
- Quick start checklist (this file)

## Common Questions

**Q: Can I use this without Supabase?**
A: No, this project is built specifically for Supabase. Migrating to another database would require significant changes.

**Q: Can I self-host?**
A: Yes, see DEPLOYMENT.md for Docker setup and self-hosting options.

**Q: How do I add more wards or tickets?**
A: Insert directly into Supabase dashboard or run SQL INSERT statements.

**Q: Can I customize the colors?**
A: Yes, edit `tailwind.config.ts` and `app/globals.css` to change the color scheme.

**Q: Is authentication included?**
A: No, but it's recommended. See ARCHITECTURE.md Phase 2 for implementation.

**Q: How often should escalations run?**
A: Recommended: every 5-15 minutes via cron job. See API.md for scheduling options.

**Q: Can I deploy for free?**
A: Vercel hosting is free for development. Supabase free tier supports this project.

## Getting Help

1. Check the troubleshooting section above
2. Read SETUP.md for detailed instructions
3. Review ARCHITECTURE.md for system design
4. Check API.md for backend reference
5. Look at inline code comments for implementation details

## Ready? 🚀

You've now:
1. Set up your local development environment
2. Connected to Supabase
3. Loaded sample data
4. Verified the UI works
5. Confirmed timers are updating

Now explore the code, customize it for your needs, and deploy to production!

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**License**: MIT  
**Maintainer**: NagarSeva Team
