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
  api/reference-data/ # Proxies platform Supabase taxonomy data
  api/profile-sync/   # Receives Profile Hub → GiftStash sync
src/components/       # React components
  ui/SmartTagPicker.tsx # Taxonomy-backed tag picker (fuzzy search, drill-down)
src/lib/services/     # Supabase service layer
src/lib/sms/          # SMS processing logic
src/lib/supabase/platform.ts  # Platform Supabase client (reference data)
src/lib/profile-hub-sync.ts   # GiftStash → Profile Hub sync
src/lib/taxonomy-mapper.ts    # Fuzzy matching freeform → standardized values
scripts/
  migrate-to-standardized.ts  # One-time migration of existing recipient data
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

## Cross-App Sync (Phase 2-3)
- **SmartTagPicker**: All profile fields (interests, colors, brands, relationship, gender, etc.) use taxonomy-backed selectors from platform Supabase reference tables
- **GiftStash → Profile Hub**: `syncToProfileHubAsync()` fires after recipient save, sends enrichments to Profile Hub
- **Profile Hub → GiftStash**: `/api/profile-sync` receives updates from Profile Hub on profile edits
- **Auth**: Bearer token via `PROFILE_SYNC_SECRET` env var
- **Platform Supabase**: Server-side only via `PLATFORM_SUPABASE_URL` + `PLATFORM_SUPABASE_SERVICE_KEY`

## Environment Variables (Cross-App)
```bash
PLATFORM_SUPABASE_URL=       # Platform Supabase for reference taxonomy
PLATFORM_SUPABASE_SERVICE_KEY= # Platform Supabase service role key
PROFILE_HUB_URL=             # https://profiles.maxjaffe.ai
PROFILE_SYNC_SECRET=         # Shared secret for cross-app sync
```

## Related Services
- **Supabase project:** giftstash (own DB) + fpxardwqswlofxrupyhz (platform, reference data)
- **Vercel project:** giftstash (production), family-hub (full features)
- **Twilio:** SMS number configured
