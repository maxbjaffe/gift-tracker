# GiftStash Deployment Setup Guide

## 🎯 Quick Overview

You're setting up a **second deployment** of the same codebase for giftstash.app.

- **What you have**: Family Hub (existing Vercel deployment)
- **What you're creating**: GiftStash standalone app (new Vercel deployment)
- **Key difference**: One environment variable: `NEXT_PUBLIC_APP_MODE=giftstash`

---

## ✅ Step-by-Step Setup (15 minutes)

### Step 1: Create New Vercel Project (3 min)

1. Open https://vercel.com/dashboard
2. Click **"Add New"** button (top right)
3. Select **"Project"**
4. You'll see "Import Git Repository"
5. Find your `gift-tracker` repository (should already be connected)
6. Click **"Import"**
7. **IMPORTANT**: Before clicking Deploy, proceed to Step 2

### Step 2: Configure Environment Variables (5 min)

In the "Configure Project" screen, scroll down to **"Environment Variables"**

#### Add these variables ONE BY ONE:

**Variable 1 (THE CRITICAL ONE):**
```
Name: NEXT_PUBLIC_APP_MODE
Value: giftstash
Environments: Production, Preview, Development (check all three)
```

**Now copy ALL remaining variables from your Family Hub deployment:**

To get them:
1. Open your Family Hub Vercel project in another tab
2. Go to Settings → Environment Variables
3. Copy each one to the new GiftStash project

**Required variables to copy:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
CRON_SECRET
EMAIL_ENCRYPTION_KEY
```

**Optional variables (if you have them):**
```
NEXT_PUBLIC_APP_URL
TWILIO_SMS_WEBHOOK_URL
```

#### Verify Your Setup:
- [ ] `NEXT_PUBLIC_APP_MODE` is set to `giftstash` (not family-hub!)
- [ ] All other variables match Family Hub exactly
- [ ] All variables have all three environments checked

### Step 3: Deploy (1 min)

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll see "Congratulations!" when done
4. Click **"Continue to Dashboard"**

### Step 4: Add Custom Domain (2 min)

1. In your new GiftStash project, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter: `giftstash.app`
4. Click **"Add"**
5. Vercel will show DNS configuration needed

### Step 5: Configure DNS (5 min)

Go to your domain registrar (where you bought giftstash.app):

**Add A Record:**
```
Type: A
Host: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**Add CNAME Record (for www):**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

**Save changes**

### Step 6: Wait for DNS Propagation (0-30 min)

- Usually takes 5-15 minutes
- Can take up to 48 hours in rare cases
- Check status in Vercel → Domains tab
- When it shows "Valid" ✓ you're done!

### Step 7: Verify Deployment ✅

Visit `https://giftstash.app` and verify:
- [ ] GiftStash landing page appears (not Family Hub)
- [ ] Logo and branding look correct
- [ ] "Sign Up Free" and "Log In" buttons are visible
- [ ] Click "Sign Up" → Should go to signup page
- [ ] Click "Log In" → Should go to login page

---

## 🔍 Quick Verification Checklist

After deployment, check these:

### In Vercel (GiftStash project):
- [ ] Build completed successfully (no errors)
- [ ] `NEXT_PUBLIC_APP_MODE=giftstash` is set
- [ ] Domain shows "Valid" status
- [ ] SSL certificate is active

### On giftstash.app:
- [ ] Landing page loads (not Family Hub homepage)
- [ ] Images are crisp and clear (V2 versions)
- [ ] Navigation shows "Log In" and "Sign Up"
- [ ] No Family Hub features visible (Accountability, Emails, etc.)
- [ ] Clicking features scrolls to sections

### Test Authentication:
- [ ] Create new account on giftstash.app
- [ ] Receives confirmation email
- [ ] Can log in
- [ ] Redirected to `/dashboard` after login
- [ ] Can see gift tracking features

---

## 🚨 Troubleshooting

### "Site Not Found" or 404
- Check DNS records are correct
- Wait 15 more minutes for DNS propagation
- Try incognito/private browsing mode

### Family Hub homepage showing instead of GiftStash landing
- Verify `NEXT_PUBLIC_APP_MODE=giftstash` in Vercel
- Check spelling is exact (lowercase, no spaces)
- Redeploy the project (Deployments → ••• → Redeploy)
- Clear browser cache

### Images look blurry or broken
- Should be using V2 images (GiftStashIconGSv2.png, etc.)
- Check `/public/images/` folder has V2 files
- Hard refresh browser (Cmd+Shift+R or Ctrl+F5)

### Can't log in / Sign up not working
- Check Supabase environment variables are correct
- Verify they match Family Hub deployment exactly
- Check Supabase dashboard → Authentication → URL Configuration
- Add `https://giftstash.app` to allowed redirect URLs

### SSL Certificate Issues
- Vercel auto-provisions SSL (wait 5 minutes)
- Check Vercel → Domains → SSL status
- Try https:// (not http://)

---

## 📊 What Happens After Setup

### Both Deployments Work Together:

**Family Hub** (existing):
- URL: Your current domain
- Shows: Full family platform
- Users see: All features

**GiftStash** (new):
- URL: giftstash.app
- Shows: Landing page + gift tracking
- Users see: Only GiftStash features

**Shared Backend:**
- Same database
- Same authentication
- Same Twilio SMS
- Users can log in to either with same account

### When You Make Changes:

1. Push code to GitHub
2. **Both** deployments auto-update
3. Test both URLs to verify

### Managing Environment Variables:

- Update in **both** Vercel projects if needed
- Only `NEXT_PUBLIC_APP_MODE` should be different
- After changing, redeploy both projects

---

## 🎉 Success Criteria

You're done when:

1. ✅ https://giftstash.app shows landing page
2. ✅ Sign up creates account and logs in
3. ✅ Family Hub deployment still works normally
4. ✅ Both share same database (test by logging into both)

---

## 📞 Need Help?

**Check these first:**
1. DEPLOYMENT.md (comprehensive troubleshooting)
2. Vercel build logs (if deployment failed)
3. Browser console (F12) for errors

**Common fixes:**
- Clear browser cache
- Try incognito/private mode
- Wait for DNS propagation
- Redeploy in Vercel
- Check environment variables spelling

---

**Estimated Total Time**: 15-30 minutes (plus DNS propagation)

**Last Updated**: January 2025
