# Environment Variables Reference

## Quick Copy-Paste Guide

When setting up the **GiftStash** deployment in Vercel, you need to add these environment variables.

---

## 🎯 GiftStash-Specific Variable

**THIS IS THE ONLY DIFFERENCE FROM FAMILY HUB:**

```bash
NEXT_PUBLIC_APP_MODE=giftstash
```

✅ Check all three environments: Production, Preview, Development

---

## 📋 Variables to Copy from Family Hub

Open your Family Hub Vercel project → Settings → Environment Variables

Copy these **exactly as they are** to your GiftStash project:

### Supabase (Required)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Anthropic AI (Required for SMS parsing)

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Twilio SMS (Required for SMS features)

```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Cron Jobs (Required)

```bash
CRON_SECRET=...
```

### Email Module (Required)

```bash
EMAIL_ENCRYPTION_KEY=...
```

### Optional (if you have these set)

```bash
NEXT_PUBLIC_APP_URL=https://giftstash.app
TWILIO_SMS_WEBHOOK_URL=...
```

---

## ✅ Verification Checklist

After adding all variables to GiftStash Vercel project:

- [ ] Total variables: 9+ (including NEXT_PUBLIC_APP_MODE)
- [ ] `NEXT_PUBLIC_APP_MODE` = `giftstash` (not family-hub)
- [ ] All other variables match Family Hub exactly
- [ ] Each variable has all environments checked (Prod, Preview, Dev)
- [ ] No typos in variable names (they're case-sensitive!)

---

## 🔐 Security Notes

**Never commit these to GitHub:**
- Keep in `.env.local` for local development
- Only set in Vercel dashboard for production
- Don't share in screenshots or messages

**Public vs Secret:**
- ✅ Safe to expose: `NEXT_PUBLIC_*` variables
- ❌ KEEP SECRET: All other variables

---

## 🧪 Testing Locally

Create `.env.local` in your project root:

```bash
# For GiftStash mode
NEXT_PUBLIC_APP_MODE=giftstash

# Copy from your existing .env.local:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
CRON_SECRET=...
EMAIL_ENCRYPTION_KEY=...
```

Then run:
```bash
npm run dev
```

Visit http://localhost:3000 → Should show GiftStash landing page

---

## 🔄 Switching Between Modes Locally

**Family Hub mode:**
```bash
# In .env.local
NEXT_PUBLIC_APP_MODE=family-hub

# Or just remove the line (defaults to family-hub)
```

**GiftStash mode:**
```bash
# In .env.local
NEXT_PUBLIC_APP_MODE=giftstash
```

**Remember:** Restart dev server after changing `.env.local`

---

## 📝 Variable Descriptions

| Variable | Purpose | Required For |
|----------|---------|--------------|
| `NEXT_PUBLIC_APP_MODE` | Determines app experience | Both (different values) |
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | Both (same) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public database access | Both (same) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side database access | Both (same) |
| `ANTHROPIC_API_KEY` | AI message parsing | Both (same) |
| `TWILIO_ACCOUNT_SID` | SMS sending | Both (same) |
| `TWILIO_AUTH_TOKEN` | SMS authentication | Both (same) |
| `TWILIO_PHONE_NUMBER` | Your Twilio number | Both (same) |
| `CRON_SECRET` | Secure cron endpoints | Both (same) |
| `EMAIL_ENCRYPTION_KEY` | Encrypt email passwords | Both (same) |

---

**Last Updated**: January 2025
