# How to Upload Environment Variables to Vercel

You have **3 options** to add environment variables to your GiftStash Vercel project:

---

## Option 1: Vercel CLI (FASTEST - Recommended) ⚡

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Create Your Environment File

1. Copy the template:
   ```bash
   cp .env.giftstash.template .env.giftstash
   ```

2. Open `.env.giftstash` and fill in your actual values from Family Hub

3. **IMPORTANT**: Make sure `NEXT_PUBLIC_APP_MODE=giftstash` is set!

### Step 4: Link to Your GiftStash Project

```bash
vercel link
```

Select:
- Your Vercel account/team
- Your **GiftStash** project (the new one you created)

### Step 5: Upload Environment Variables

```bash
vercel env pull .env.production
vercel env add < .env.giftstash
```

Or upload individual environments:

```bash
# For production
cat .env.giftstash | vercel env add production

# For preview
cat .env.giftstash | vercel env add preview

# For development
cat .env.giftstash | vercel env add development
```

### Step 6: Trigger Redeploy

```bash
vercel --prod
```

---

## Option 2: Vercel Dashboard (Manual - Easy) 🖱️

### Use this if you prefer clicking through the UI

Follow the **VERCEL_SETUP_CHECKLIST.md** which has all 55 steps including manually entering each environment variable.

**Time**: 10-15 minutes to enter all variables

---

## Option 3: Copy from Family Hub Project (Smart) 🔄

If you have access to your Family Hub Vercel project settings:

### Step 1: Export from Family Hub

1. Go to your **Family Hub** Vercel project
2. Settings → Environment Variables
3. For each variable, copy the value

### Step 2: Create .env.giftstash file

```bash
# Copy template
cp .env.giftstash.template .env.giftstash

# Edit and paste your actual values
nano .env.giftstash
# or use your preferred editor
```

### Step 3: Add the GiftStash-specific variable

Make sure this line is in your `.env.giftstash`:
```
NEXT_PUBLIC_APP_MODE=giftstash
```

### Step 4: Use Option 1 (Vercel CLI) to upload

---

## 📋 Environment Variables Checklist

Your `.env.giftstash` file should have these **9 variables**:

- [ ] `NEXT_PUBLIC_APP_MODE=giftstash` (THE CRITICAL ONE!)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`
- [ ] `CRON_SECRET`
- [ ] `EMAIL_ENCRYPTION_KEY`

Optional:
- [ ] `NEXT_PUBLIC_APP_URL=https://giftstash.app`

---

## 🔐 Security Warning

**NEVER commit .env.giftstash to git!**

It's already in `.gitignore` as `.env.*`, but double-check:

```bash
# Verify it won't be committed
git status
# Should NOT show .env.giftstash
```

---

## ✅ Verify Upload

After uploading via any method:

1. Go to Vercel Dashboard → Your GiftStash project
2. Settings → Environment Variables
3. Verify you see all 9-10 variables
4. Verify `NEXT_PUBLIC_APP_MODE=giftstash` (not family-hub!)
5. Each variable should have ✓ Production ✓ Preview ✓ Development

---

## 🚀 After Upload

Once environment variables are uploaded:

1. **Trigger a deployment** (automatic if using Vercel CLI)
2. **Wait for build** to complete (2-3 minutes)
3. **Visit your deployment URL** to verify GiftStash landing page appears

---

## 🆘 Troubleshooting

**Vercel CLI not found:**
```bash
npm i -g vercel
```

**Can't link to project:**
- Make sure you created the Vercel project first
- Use the correct project name when linking

**Variables not showing up:**
- Redeploy after adding variables
- Environment variables are baked into the build
- Check spelling (case-sensitive!)

**Wrong landing page showing:**
- Verify `NEXT_PUBLIC_APP_MODE=giftstash` (exact spelling)
- Redeploy to rebuild with new env vars
- Clear browser cache

---

## 💡 Recommended Approach

**If you're comfortable with terminal:**
→ Use **Option 1** (Vercel CLI) - Takes 2 minutes

**If you prefer UI:**
→ Use **Option 2** (Manual in dashboard) - Takes 10-15 minutes

**Either way works perfectly!** Choose what you're comfortable with.
