# GiftStash

## What This Is
SMS-first family gift tracking app. Text a gift idea → AI parses it → saves to the right person. Web dashboard for browsing, managing, and sharing wishlists.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Auth)
- **AI:** Claude API for SMS parsing and gift recommendations
- **SMS:** Twilio
- **Hosting:** Vercel (giftstash.app)

## Key Paths
```
src/app/              # Pages and API routes
src/components/       # React components
src/lib/services/     # Supabase service layer
src/lib/sms/          # SMS processing logic
supabase/migrations/  # Database migrations
extension/            # Chrome extension
docs/                 # All documentation
```

## Branch Strategy
- `main` → Full Family Hub (gifts + accountability) → deploys to `family-hub` on Vercel
- `giftstash-standalone` → Gift tracking only → deploys to `giftstash` on Vercel (giftstash.app)

## Current Focus
Working branch: `giftstash-standalone`

## Common Tasks

### Run locally
```bash
npm install
cp .env.example .env.local  # Fill in values
npm run dev
```

### Database changes
```bash
npx supabase migration new migration_name
npx supabase db push
```

### Test SMS locally
Use ngrok to expose localhost, configure Twilio webhook to ngrok URL + `/api/sms/receive`

## Related Services
- **Supabase project:** giftstash
- **Vercel project:** giftstash (production), family-hub (full features)
- **Twilio:** SMS number configured
