# Deployment Guide - Dual Deployment Setup

This codebase supports **two different deployments** from the same source code:

1. **Family Hub** - Full family management platform (default)
2. **GiftStash** - Standalone gift tracking app at giftstash.app

## 🎯 How It Works

The application uses the `NEXT_PUBLIC_APP_MODE` environment variable to determine which experience to show:

- `NEXT_PUBLIC_APP_MODE=family-hub` - Shows Family Hub with all features (Accountability, School Emails, etc.)
- `NEXT_PUBLIC_APP_MODE=giftstash` - Shows GiftStash landing page and hides non-GiftStash features

### What Changes Between Modes

**GiftStash Mode** (`NEXT_PUBLIC_APP_MODE=giftstash`):
- Landing page with sign up/login
- GiftStash branding and colors
- Only gift tracking features visible
- Simplified navigation
- Custom header/footer in landing page

**Family Hub Mode** (`NEXT_PUBLIC_APP_MODE=family-hub`):
- Family Hub homepage with all systems
- Full navigation (GiftStash, Accountability, School Emails, Family Info)
- Family Hub header/footer
- All features accessible

### What Stays the Same

Both deployments share:
- Same Supabase database
- Same authentication system
- All backend API routes
- All gift tracking functionality
- Users can log in to either with same credentials

---

## 🚀 Deployment Setup

### 1. Family Hub Deployment (Existing)

Your existing Vercel deployment continues to work as-is.

**Environment Variables in Vercel:**
```
NEXT_PUBLIC_APP_MODE=family-hub  # or omit (defaults to family-hub)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
CRON_SECRET=...
EMAIL_ENCRYPTION_KEY=...
```

**Cron Jobs** (from `vercel.json`):
- Expire consequences: Every 15 minutes
- Commitment reminders: Every 5 minutes
- Consequence warnings: Every 30 minutes
- Calculate reliability: Daily at 1 AM
- Weekly report: Sundays at 6 PM
- Cleanup SMS context: Every hour

---

### 2. GiftStash Deployment (New - giftstash.app)

Create a **new Vercel project** for the GiftStash standalone app:

#### Step 1: Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import the **same GitHub repository** (gift-tracker)
4. Name it "giftstash" or "giftstash-app"

#### Step 2: Configure Environment Variables

In the new Vercel project settings, add these environment variables:

**CRITICAL:**
```
NEXT_PUBLIC_APP_MODE=giftstash  # This enables GiftStash mode!
```

**Copy from Family Hub deployment** (must be identical):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
CRON_SECRET=...
EMAIL_ENCRYPTION_KEY=...
```

**Important Notes:**
- All environment variables (except `NEXT_PUBLIC_APP_MODE`) must be **identical** to Family Hub
- Both deployments use the **same database**
- Both deployments share the **same Twilio number**
- Cron jobs can run on **either** deployment (recommend keeping on Family Hub only)

#### Step 3: Configure Custom Domain

1. In Vercel project settings → **Domains**
2. Add domain: `giftstash.app`
3. Add domain: `www.giftstash.app` (optional)
4. Vercel will provide DNS configuration instructions

#### Step 4: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for deployment to complete
3. Visit `https://giftstash.app` to see landing page

---

## 🌐 DNS Configuration

### For giftstash.app domain:

In your domain registrar (where you bought giftstash.app), add these DNS records:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**CNAME Record (for www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Verification:**
- DNS propagation can take up to 48 hours (usually minutes)
- Check status in Vercel → Domains section
- Use `dig giftstash.app` to verify DNS records
- Visit `https://giftstash.app` once propagated

---

## 💻 Local Development

### Test Family Hub Mode (Default)

```bash
npm run dev
```

Visit http://localhost:3000 → Should show Family Hub homepage

### Test GiftStash Mode

```bash
NEXT_PUBLIC_APP_MODE=giftstash npm run dev
```

Visit http://localhost:3000 → Should show GiftStash landing page

### Clear Next.js Cache

If changes don't appear:

```bash
rm -rf .next
npm run dev
```

---

## 🔒 Security Checklist

### Before Going Live with GiftStash:

- [ ] Verify `NEXT_PUBLIC_APP_MODE=giftstash` is set in Vercel
- [ ] All environment variables match Family Hub deployment
- [ ] SSL certificate is active (auto-provisioned by Vercel)
- [ ] Test sign up flow on giftstash.app
- [ ] Test login flow redirects to dashboard
- [ ] Verify users can only see their own data (RLS enabled)
- [ ] Test that Family Hub features are hidden in GiftStash mode
- [ ] Confirm both deployments share same database

### API Security:

- [ ] All API routes require authentication (except webhooks)
- [ ] Cron endpoints require `CRON_SECRET` header
- [ ] Service role key never exposed in client code
- [ ] RLS (Row Level Security) enabled on all database tables

---

## 📊 Monitoring Both Deployments

### Vercel Monitoring:

- **Family Hub**: Monitor all cron jobs + full app traffic
- **GiftStash**: Monitor sign ups, logins, gift tracking usage

### Supabase Monitoring:

- Single database serves both deployments
- Monitor total queries, not per-deployment
- Check RLS policies protect user data

### Twilio Monitoring:

- Single phone number shared by both deployments
- SMS commands work regardless of which app user signed up from

---

## 🛠️ Troubleshooting

### GiftStash landing page not showing:

1. Verify `NEXT_PUBLIC_APP_MODE=giftstash` in Vercel environment variables
2. Redeploy after adding environment variable (they're baked into build)
3. Clear browser cache
4. Check browser console for errors

### Domain not connecting:

1. Verify DNS records in domain registrar
2. Wait up to 48 hours for DNS propagation
3. Use `dig giftstash.app` to check DNS
4. Check Vercel → Domains shows "Valid" status

### Users can't log in on giftstash.app:

1. Verify Supabase environment variables are correct
2. Check Supabase auth settings allow the new domain
3. Test with incognito/private browsing
4. Check browser console for CORS errors

### Changes not appearing:

1. Environment variables starting with `NEXT_PUBLIC_` are baked into build
2. Must redeploy in Vercel after changing them
3. Local: restart dev server after changing `.env.local`
4. Clear `.next` folder: `rm -rf .next`

---

## 📋 Pre-Deployment Checklist

### Database (One-time Setup):

- [ ] All Supabase migrations applied
- [ ] RLS enabled on all tables
- [ ] Test users can only access their own data

### Family Hub Deployment:

- [ ] All environment variables set in Vercel
- [ ] Cron jobs configured in `vercel.json`
- [ ] Twilio webhook points to Family Hub URL
- [ ] Test SMS commands work
- [ ] Test all features (Accountability, Emails, etc.)

### GiftStash Deployment:

- [ ] New Vercel project created
- [ ] `NEXT_PUBLIC_APP_MODE=giftstash` set
- [ ] All other environment variables copied from Family Hub
- [ ] Domain `giftstash.app` added in Vercel
- [ ] DNS records configured
- [ ] Landing page loads correctly
- [ ] Sign up/login works
- [ ] Gift tracking features accessible
- [ ] Family Hub features hidden

---

## 🔄 Deployment Workflow

### Making Changes:

1. **Develop locally** - test both modes
   ```bash
   # Test Family Hub
   npm run dev

   # Test GiftStash
   NEXT_PUBLIC_APP_MODE=giftstash npm run dev
   ```

2. **Commit and push** to GitHub
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

3. **Auto-deploy** - Vercel deploys both projects automatically
   - Family Hub deployment updates
   - GiftStash deployment updates

4. **Verify both deployments** work correctly

### Database Migrations:

1. Apply migration in Supabase SQL Editor
2. Update both deployments if needed (usually automatic)
3. Test on both Family Hub and GiftStash

### Environment Variable Changes:

1. Update in **both** Vercel projects
2. Redeploy both projects (env vars baked into build)
3. Verify changes applied

---

## 📞 Support Resources

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Twilio Support**: https://www.twilio.com/help/contact
- **Anthropic Support**: https://support.anthropic.com

---

## ✅ Production Ready

**Family Hub** - Existing production deployment
**GiftStash** - New standalone app at giftstash.app

Both share the same backend, database, and authentication!

**Last Updated**: January 2025
