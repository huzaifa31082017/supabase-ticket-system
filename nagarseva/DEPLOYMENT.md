# NagarSeva Deployment Guide

This guide covers deploying NagarSeva to production on various platforms.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema created and tested
- [ ] `.env.local` does NOT contain sensitive data
- [ ] `.gitignore` includes `.env.local`
- [ ] Code tested locally with `npm run dev`
- [ ] Build passes: `npm run build`
- [ ] No console errors or warnings
- [ ] Supabase Row Level Security (RLS) configured (optional but recommended)
- [ ] Database backups enabled in Supabase

## Deployment Option 1: Vercel (Recommended)

Vercel is the creators of Next.js and offers seamless integration.

### Setup

1. **Push to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

3. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL: https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY: your_anon_key
     SUPABASE_SERVICE_ROLE_KEY: your_service_role_key
     ```
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Automatic Deployments

Every push to `main` branch will automatically deploy to production.

### Custom Domain

1. In Vercel dashboard: Settings → Domains
2. Enter your domain (e.g., `nagarseva.example.com`)
3. Follow DNS configuration instructions

### Monitoring & Logs

- View build logs in Vercel dashboard
- Check application logs: Settings → Functions
- Use Vercel Analytics for performance metrics

---

## Deployment Option 2: Railway

Railway offers simple, modern deployments with great PostgreSQL integration.

### Setup

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL Database**
   - In project, click "Add"
   - Select "PostgreSQL"
   - Confirm creation

4. **Configure Environment Variables**
   - In project settings, go to Variables
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL: https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY: your_anon_key
     SUPABASE_SERVICE_ROLE_KEY: your_service_role_key
     NODE_ENV: production
     ```

5. **Deploy**
   - Push to GitHub
   - Railway automatically builds and deploys
   - View live URL in project dashboard

### Custom Domain

1. In project settings: Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Deployment Option 3: Netlify

Netlify works well with Next.js but requires more configuration for API routes.

### Setup

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions` (for API routes)

3. **Set Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add the same Supabase credentials as above

4. **Deploy**
   - Netlify automatically builds and deploys
   - Your app will be live at `https://your-project.netlify.app`

---

## Deployment Option 4: Docker + Self-Hosted

For complete control, deploy using Docker.

### Create Dockerfile

```dockerfile
# Use official Node.js runtime as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

### Create .dockerignore

```
node_modules
.next
.git
.env.local
.DS_Store
```

### Build and Run

```bash
# Build image
docker build -t nagarseva:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  nagarseva:latest
```

### Deploy to Docker Hub

```bash
# Tag image
docker tag nagarseva:latest username/nagarseva:latest

# Push to Docker Hub
docker push username/nagarseva:latest
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Test the deployed URL
curl https://your-app-url.com

# Should return HTML response
```

### 2. Set Up Monitoring

**Option A: Supabase Monitoring**
- Check Supabase dashboard for database performance
- Enable SSL enforcement
- Set up database backups

**Option B: Application Monitoring (Sentry)**

1. Create Sentry account at [sentry.io](https://sentry.io)
2. Create a new project (Next.js)
3. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```
4. Add initialization in `instrumentation.ts`:
   ```typescript
   import * as Sentry from "@sentry/nextjs";

   export function register() {
     if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
       Sentry.init({
         dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
         tracesSampleRate: 1,
         debug: false,
       });
     }
   }
   ```

### 3. Enable Security Headers

Add `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 4. Configure CI/CD Pipeline

**GitHub Actions Example** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: curl -X POST ${{ secrets.DEPLOY_WEBHOOK }}
```

---

## Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:
```javascript
module.exports = {
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};
```

### 2. Optimize Database Queries

- Use database views (like `active_tickets_view`)
- Add indexes on frequently queried columns
- Monitor slow queries in Supabase dashboard

### 3. Enable CDN

- Vercel: Automatic
- Netlify: Automatic
- Railway/Self-hosted: Use Cloudflare CDN

### 4. Implement Response Caching

```typescript
// app/actions/sla-actions.ts
export const revalidate = 60; // Cache for 60 seconds

export async function getWards(): Promise<Ward[]> {
  // ... function body
}
```

---

## Troubleshooting

### Issue: "Could not find Supabase credentials"

**Solution:**
1. Verify environment variables are set in deployment platform
2. Check variable names exactly match (case-sensitive)
3. Ensure values don't have quotes around them

### Issue: Database connection timeout

**Solution:**
1. Check Supabase database is running
2. Verify IP whitelist in Supabase settings (allow all for development)
3. Check connection string is correct

### Issue: Build fails

**Solution:**
1. Check build logs in deployment dashboard
2. Verify `npm run build` works locally
3. Ensure all dependencies are in `package.json`
4. Check for Node version compatibility

### Issue: App crashes after deployment

**Solution:**
1. Check application logs in deployment platform
2. Verify all environment variables are set
3. Run `npm run build && npm run start` locally to test
4. Check for any console errors in browser DevTools

---

## Scaling Considerations

### Database Scaling

As traffic increases:

1. **Upgrade Supabase Plan**
   - Basic (free) → Pro ($25/month) → Team ($599/month)
   - Increases connection limits and performance

2. **Add Connection Pooling**
   - Use PgBouncer in Supabase settings
   - Reduces connection overhead

3. **Implement Caching**
   - Add Redis for frequently accessed data
   - Cache ward scores and ticket lists

### Application Scaling

1. **Optimize Server Actions**
   - Add pagination to `getTickets()`
   - Implement cursor-based pagination for large datasets

2. **Use Edge Functions**
   - Move some logic to edge (closer to users)
   - Faster response times

3. **Load Testing**
   ```bash
   npm install -g artillery
   artillery quick --count 100 --num 1000 https://your-app-url.com
   ```

---

## Rollback Procedure

### Vercel

1. In Vercel dashboard, go to Deployments
2. Click on previous deployment
3. Click "Rollback"

### Railway

1. In project, view Deployment History
2. Click on previous deployment
3. Click "Revert"

### Manual Rollback

```bash
# If using Git
git revert HEAD
git push origin main

# If using Docker
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  nagarseva:previous-tag
```

---

## Maintenance

### Regular Tasks

- [ ] Weekly: Check Supabase database performance
- [ ] Monthly: Review application logs for errors
- [ ] Monthly: Update dependencies (`npm update`)
- [ ] Quarterly: Security audit and updates
- [ ] Quarterly: Test disaster recovery procedures

### Backup Strategy

1. **Database Backups**
   - Supabase: Automatic daily backups (free tier)
   - Upgrade for hourly backups

2. **Application Code**
   - Always in Git repository
   - Tag releases: `git tag v1.0.0`

3. **Configuration**
   - Store environment variables safely
   - Use secret management (Vercel Secrets, Railway Variables)

---

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review deployment platform documentation
3. Check Supabase status page
4. File an issue on GitHub with deployment details
