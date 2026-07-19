# 🚀 NagarSeva Setup Guide

Welcome to NagarSeva - AI Citizen Advocate! This guide will help you set up your application and initialize the database.

## ✅ Prerequisites

Before you start, make sure you have:
- A Supabase account ([sign up here](https://app.supabase.com))
- A Supabase project created
- Environment variables configured in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 📋 Database Setup (One-Time Only)

### Step 1: Access Your Live Application

Visit your deployed application:
```
https://supabase-ticket-system-j98j.vercel.app
```

You'll be automatically redirected to the setup page if the database hasn't been initialized yet.

### Step 2: Use the Built-in Setup Wizard

The setup page has a convenient **"Copy SQL Schema"** button that:
1. ✅ Copies the entire database schema to your clipboard
2. ✅ Includes all tables, indexes, and RLS policies
3. ✅ Includes sample data for testing

### Step 3: Execute the Schema in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Paste the SQL code you copied
6. Click **Run** (green button)

### Step 4: Refresh and Verify

1. Return to your NagarSeva application
2. Click the **"Recheck Database Setup"** button
3. You should see a success message ✅

If successful, you'll be redirected to the login page.

## 🔑 First Login

**Demo Credentials** (set up by default):
- **Email**: `demo@nagarseva.com`
- **Password**: `demo1234`

Or create a new account by clicking **"Sign Up"**

## 🎯 Application Flow

Once logged in, you'll see the **Dashboard** with two tabs:

### 1. Public Dashboard
- 📊 City-wide statistics
- 🏘️ Ward performance leaderboard
- 📈 Responsiveness scores
- 🚨 Active ticket counts

### 2. Ticket Tracker
- 🎫 All active tickets
- ⏱️ SLA countdown timers
- 🔴 Escalation status
- ⚙️ Ticket management (Open → In Progress → Resolved)

## 🛠️ Troubleshooting

### Database Setup Still Failing?

If you see "Database tables not found" errors:

1. **Verify tables exist in Supabase:**
   - Go to Supabase Dashboard
   - Click **Table Editor**
   - Look for tables: `wards`, `tickets`, `escalation_logs`, `users`

2. **Check RLS Policies:**
   - Go to Supabase Dashboard
   - Click **Authentication → Policies**
   - Ensure read policies are enabled for `wards` and `tickets`

3. **Reset and try again:**
   - Delete the tables (if needed)
   - Re-run the SQL schema from the setup page

### 500 Errors on Dashboard?

1. Check Supabase is running (visit [Supabase Dashboard](https://app.supabase.com))
2. Verify environment variables in Vercel are correct
3. Check browser console for detailed error messages
4. Try logging out and logging back in

### Tickets Not Loading?

1. Verify sample data was inserted (check Supabase Table Editor)
2. Check RLS policies allow public SELECT on `tickets` table
3. Try the "Recheck Database Setup" button on setup page

## 📱 Features

### 🏘️ Ward Management
- Track performance of different city wards
- Monitor responsiveness scores (0-100)
- View escalation counts

### 🎫 Ticket System
- Create and track civic complaints
- Automatic SLA deadline calculation
- Visual countdown timers
- Status tracking: Open → In Progress → Resolved

### 🚨 Escalation Tracking
- Auto-escalate overdue tickets
- Manual escalation option
- Ward score deductions for escalations
- Audit logging

### ⏱️ SLA Monitoring
- Real-time countdown timers
- Color-coded urgency indicators
- Overdue ticket highlighting

## 🔐 Security

The application uses Supabase's built-in features:
- ✅ Row Level Security (RLS) policies
- ✅ Email/password authentication
- ✅ Role-based access control
- ✅ Secure API key management

## 📚 API Documentation

See `API.md` for complete server action documentation.

## 🤝 Support

For issues or questions:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Visit the [Supabase Discord community](https://discord.supabase.com)
3. Check the project README.md

---

**Happy civic engagement! 🎉**
