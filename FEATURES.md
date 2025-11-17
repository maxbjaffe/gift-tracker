# Family Hub - Complete Feature Documentation

**Last Updated:** January 17, 2025
**Version:** 1.0

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Gift Tracker Features](#gift-tracker-features)
3. [Accountability Platform Features](#accountability-platform-features)
4. [Technical Architecture](#technical-architecture)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)

---

## Platform Overview

Family Hub is an all-in-one family management platform that combines two powerful systems:

### 🎁 Gift Tracker
A comprehensive gift management system with AI-powered recommendations and price tracking to help you never forget a gift idea again.

### 🎯 Accountability Platform
A family accountability system for tracking consequences, commitments, and building responsibility through SMS integration and comprehensive analytics.

**Tech Stack:**
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Anthropic Claude (Claude 3.5 Sonnet)
- **SMS:** Twilio
- **Cron Jobs:** Vercel Cron

---

## Gift Tracker Features

### Core Features

#### 1. **Recipients Management** (`/recipients`)
- Create and manage recipient profiles
- Store recipient details:
  - Name, age, relationship
  - Birthday tracking
  - Interests and preferences
  - Budget allocation
  - Gift history
- Avatar customization with colors
- Quick filters by relationship type

#### 2. **Gift Tracking** (`/gifts`)
- Add gift ideas for each recipient
- Track gift status:
  - Idea (initial thought)
  - Considering (evaluating)
  - Purchased (bought)
  - Wrapped (ready to give)
  - Given (delivered)
- Store gift details:
  - Name, description
  - Price and budget
  - Purchase date
  - Occasion/event
  - Notes and preferences
- Link gifts to recipients
- Filter by status, recipient, or occasion

#### 3. **AI-Powered Price Tracking** (`/gifts` + AI integration)
- Automatic price lookup across multiple retailers:
  - Amazon
  - Target
  - Walmart
  - Best Buy
  - Other major retailers
- Real-time price comparison
- Price history tracking
- Price drop alerts (coming soon)
- Best deal recommendations

#### 4. **AI Gift Recommendations** (`/inspiration`)
- Personalized gift suggestions based on:
  - Recipient age and interests
  - Previous gift history
  - Budget constraints
  - Occasion type
  - Current trends
- Claude AI integration for intelligent suggestions
- Filter recommendations by:
  - Price range
  - Age appropriateness
  - Category/interest
- Save recommendations directly to recipient gift lists

#### 5. **Dashboard** (`/dashboard`)
- Overview of all recipients
- Upcoming occasions and birthdays
- Recent gift ideas
- Budget tracking summary
- Quick actions for common tasks
- Recent activity feed

#### 6. **Analytics** (`/analytics`)
- Spending analytics by:
  - Recipient
  - Occasion
  - Time period
  - Category
- Budget vs. actual spending
- Gift idea completion rate
- Trends and patterns
- Export capabilities (coming soon)

### Future Enhancements (Planned)
- Price drop notifications
- Shared family gift lists
- Gift registry integration
- Mobile app
- Calendar integration for occasions
- Gift wrapping service integration

---

## Accountability Platform Features

### Core Features

#### 1. **Children Management**
- Create profiles for each child:
  - Name, age
  - Avatar with custom colors
  - Birth date
  - Notes/preferences
- Multiple children support
- Easy child selection across all features

#### 2. **Consequences Tracking** (`/accountability`)
- Track restrictions and consequences:
  - **Restriction Types:**
    - Device (iPad, Phone, TV, Gaming Console, Computer)
    - Activity (Sports, Friend Visits, After-School Activities)
    - Privilege (Dessert, Allowance, Movie Night, Late Bedtime)
    - Location (Friend's House, Park, Mall)
  - **Details Captured:**
    - Restriction item
    - Reason for consequence
    - Duration (days)
    - Severity (minor, medium, major)
    - Expiration date/time
    - Created by (parent)
- **Status Management:**
  - Active (currently in effect)
  - Expired (time elapsed)
  - Lifted (manually removed)
  - Pending confirmation (partner review)
- **Actions:**
  - Lift consequence early
  - Extend duration
  - Confirm partner consequence
  - Add notes
- Time remaining countdown
- Color-coded urgency indicators
- Filter by child, status, or type

#### 3. **Commitments Tracking** (`/accountability`)
- Track responsibilities and tasks:
  - **Categories:**
    - Homework
    - Chores
    - Responsibilities
    - Behavior
    - Other
  - **Details Captured:**
    - Commitment text/description
    - Due date and time
    - Category
    - Created by (parent)
    - Reminder settings
- **Status Tracking:**
  - Active (pending)
  - Completed (on time)
  - Completed (late)
  - Missed
- **Reliability Metrics:**
  - On-time completion rate
  - Late completion tracking
  - Missed commitment tracking
  - Historical reliability score
- **Actions:**
  - Mark as completed (on time/late)
  - Mark as missed
  - Reschedule
  - Add notes
- Due date indicators (today, tomorrow, overdue)
- Urgent commitment highlighting

#### 4. **SMS Control Interface** (`/api/sms/receive` + SMS features)
**Advanced AI-powered SMS integration for managing accountability on the go**

##### Natural Language Processing
- Parse consequence and commitment requests in natural language
- Support for multiple phrasings and formats
- Context-aware interpretation
- Fuzzy name matching for children

##### SMS Shortcuts
Quick single-word commands:
- **STATUS** - Get current family accountability status
- **HELP** - Show available commands
- **CLEAR ALL** - Remove all active consequences
- **STATS** - Get reliability statistics
- **SUMMARY** - Weekly family summary
- **ACTIVE** - List active items only
- **CANCEL** / **UNDO** - Cancel last action

##### Multi-turn Conversations
- 30-minute conversation context
- State machine for partial data collection:
  - Awaiting child selection
  - Awaiting duration
  - Awaiting reason
  - Awaiting confirmation
- Context merging for follow-up responses
- Clarification requests

##### Bulk Operations
- Apply consequences to multiple children:
  - "all kids"
  - "everyone"
  - "Emma and Jake"
- Batch lifting of consequences
- Multi-child commitment creation

##### Example SMS Commands
```
"No iPad for Emma, 3 days, homework"
"Jake can't have dessert for 2 days because attitude"
"Emma committed to clean room by 5pm"
"STATUS"
"No TV for all kids, 1 day, fighting"
"STATS"
```

##### SMS Security
- Phone number registration
- Twilio signature validation
- Rate limiting protection
- User authentication via phone number

#### 5. **Analytics Dashboard** (`/accountability/analytics`)
Comprehensive analytics powered by AI insights:

##### Reliability Trends
- Monthly reliability scores per child
- Trend analysis (improving, declining, stable)
- Commitment completion rates
- On-time vs. late completion
- Category breakdown (homework, chores, etc.)
- Comparison across children

##### Consequence Effectiveness
- Impact analysis by restriction type
- Repeat offense tracking
- Time between consequences
- Effectiveness scores
- Correlation with reliability improvements

##### Pattern Detection
- Behavioral pattern identification:
  - Time of day patterns
  - Day of week patterns
  - Seasonal trends
  - Trigger situations
- Early warning system
- Intervention recommendations

##### Children Comparison
- Side-by-side reliability comparison
- Average reliability by age
- Strengths and growth areas
- Peer benchmarking

##### AI-Generated Insights
- Claude AI analyzes all data
- Actionable recommendations
- Personalized parenting tips
- Trend predictions

#### 6. **DAKboard Integration** (`/accountability/dakboard`)
**Wall-mounted display optimized for DAKboards and kiosks**

- **Auto-refresh:** Every 60 seconds
- **Large, readable fonts** for wall viewing
- **Side-by-side child layout** for easy scanning
- **Active items only** display:
  - Active consequences with time remaining
  - Active commitments with due dates
- **Color-coded urgency:**
  - Red: Overdue or < 2 hours
  - Orange: Today or < 12 hours
  - Yellow: Tomorrow
  - Blue: Future
- **Clean, minimal design**
- **Last updated timestamp**
- **All clear message** when no active items
- Optimized for tablets and large displays

#### 7. **SMS Guide** (`/accountability/sms-guide`)
Interactive documentation for SMS commands:
- Comprehensive command reference
- Copy-to-clipboard examples
- Categorized by feature:
  - Shortcuts
  - Consequences
  - Commitments
  - Tips and tricks
- Visual examples with breakdowns
- Best practices

### Automated Features

#### Cron Jobs (Scheduled Tasks)

##### 1. **Consequence Expiration** (`/api/cron/expire-consequences`)
- **Schedule:** Every hour
- **Function:** Automatically mark expired consequences as 'expired'
- **Logic:** Checks `expires_at` timestamp against current time

##### 2. **Commitment Tracking** (`/api/cron/mark-missed-commitments`)
- **Schedule:** Every hour
- **Function:** Mark overdue commitments as 'missed'
- **Logic:** Checks `due_date` against current time for active commitments

##### 3. **Daily Reminders** (`/api/cron/daily-reminders`)
- **Schedule:** Daily at 7 AM
- **Function:** Send SMS reminders for upcoming commitments
- **Logic:** Find commitments due within next 12 hours

##### 4. **Stats Calculation** (`/api/cron/calculate-stats`)
- **Schedule:** Daily at midnight
- **Function:** Calculate and store daily reliability statistics
- **Logic:** Aggregate completion rates per child

##### 5. **SMS Context Cleanup** (`/api/cron/cleanup-sms-context`)
- **Schedule:** Every hour
- **Function:** Remove expired SMS conversation contexts
- **Logic:** Delete contexts older than 30 minutes

#### Database Functions (Automatic)

##### RLS (Row Level Security)
- User-scoped data access
- Automatic filtering by `user_id`
- Secure multi-tenant architecture

##### Triggers
- `updated_at` timestamp automation
- Automatic stat recalculation on commitment changes
- Cascade deletes for child removal

##### Stored Procedures
- `calculate_reliability_score(child_id, month)`
- `expire_consequences()`
- `mark_missed_commitments()`

### Partner Features

#### Partner Settings (`/accountability/settings`)
- Two-parent coordination
- Notification preferences:
  - SMS notifications
  - Email notifications
  - In-app notifications
- Consequence confirmation requirement
- Partner phone number registration
- Notification frequency settings

#### Notification Types
- New consequence added (requires confirmation)
- Consequence lifted by partner
- Commitment missed
- Weekly summary
- Daily reminder digest

---

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI (via shadcn/ui)
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context + useState
- **Date Handling:** date-fns
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)

### Backend Stack
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (JWT)
- **SMS:** Twilio Programmable SMS
- **AI:** Anthropic Claude API (Claude 3.5 Sonnet)
- **Cron:** Vercel Cron Jobs
- **File Storage:** Supabase Storage (future)

### Database (Supabase/PostgreSQL)

#### Tables
1. **profiles** - User profiles (extends Supabase auth.users)
2. **recipients** - Gift recipients
3. **gifts** - Gift ideas and purchases
4. **children** - Child profiles for accountability
5. **consequences** - Restrictions and consequences
6. **commitments** - Tasks and responsibilities
7. **commitment_stats** - Monthly reliability statistics
8. **partner_settings** - Two-parent settings
9. **partner_notifications** - Notification queue
10. **sms_context** - SMS conversation state (30-min TTL)

#### Row Level Security (RLS)
All tables have RLS policies to ensure users only access their own data.

### AI Integration

#### Claude API Usage
- **Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Use Cases:**
  1. **SMS Parsing** - Natural language processing for SMS commands
  2. **Gift Recommendations** - Personalized gift suggestions
  3. **Price Lookup** - Web search and price extraction
  4. **Analytics Insights** - Pattern detection and recommendations

#### API Endpoints Using Claude
- `/api/sms/receive` - SMS command parsing
- `/api/inspiration/generate` - Gift recommendations
- `/api/gifts/price-check` - Price lookup
- `/api/analytics/insights` - AI-generated insights

### SMS Integration (Twilio)

#### Webhook
- **Endpoint:** `/api/sms/receive`
- **Method:** POST
- **Content-Type:** application/x-www-form-urlencoded
- **Signature Validation:** Twilio signature verification
- **Rate Limiting:** 10 requests/minute per phone number

#### Message Flow
1. User sends SMS to Twilio number
2. Twilio forwards to webhook endpoint
3. Signature validation
4. Check/load SMS context (30-min window)
5. Parse message with Claude AI
6. Route to appropriate handler:
   - Shortcut handler
   - Bulk operation handler
   - Consequence handler
   - Commitment handler
   - Query handler
7. Execute action
8. Save context for follow-ups
9. Send response via Twilio

### Deployment

#### Vercel
- **Platform:** Vercel (serverless)
- **Regions:** Auto (edge functions where possible)
- **Environment Variables:** Stored in Vercel dashboard
- **Cron Jobs:** Configured in `vercel.json`
- **Build:** Next.js production build
- **Analytics:** Vercel Analytics enabled

#### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Server-side only

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15555555555
TWILIO_SMS_WEBHOOK_URL=https://yourdomain.com/api/sms/receive

# Cron
CRON_SECRET=... # Generate with: openssl rand -base64 32

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## API Endpoints

### Gift Tracker APIs

#### Recipients
- `GET /api/recipients` - List all recipients
- `GET /api/recipients/[id]` - Get recipient details
- `POST /api/recipients` - Create recipient
- `PUT /api/recipients/[id]` - Update recipient
- `DELETE /api/recipients/[id]` - Delete recipient

#### Gifts
- `GET /api/gifts` - List all gifts
- `GET /api/gifts/[id]` - Get gift details
- `POST /api/gifts` - Create gift
- `PUT /api/gifts/[id]` - Update gift
- `DELETE /api/gifts/[id]` - Delete gift
- `POST /api/gifts/price-check` - Check prices via AI

#### Inspiration
- `POST /api/inspiration/generate` - Generate gift recommendations

### Accountability APIs

#### Dashboard
- `GET /api/accountability/dashboard` - Get full dashboard data

#### Children
- `GET /api/accountability/children` - List children
- `POST /api/accountability/children` - Create child
- `PUT /api/accountability/children/[id]` - Update child
- `DELETE /api/accountability/children/[id]` - Delete child

#### Consequences
- `GET /api/accountability/consequences` - List consequences
- `GET /api/accountability/consequences/[id]` - Get consequence
- `POST /api/accountability/consequences` - Create consequence
- `PUT /api/accountability/consequences/[id]` - Update consequence
- `PUT /api/accountability/consequences/[id]/lift` - Lift consequence

#### Commitments
- `GET /api/accountability/commitments` - List commitments
- `GET /api/accountability/commitments/[id]` - Get commitment
- `POST /api/accountability/commitments` - Create commitment
- `PUT /api/accountability/commitments/[id]` - Update commitment
- `PUT /api/accountability/commitments/[id]/complete` - Mark complete
- `PUT /api/accountability/commitments/[id]/missed` - Mark missed

#### Analytics
- `GET /api/analytics/overview` - Get all analytics data
- `GET /api/analytics/reliability` - Reliability trends
- `GET /api/analytics/consequences` - Consequence effectiveness
- `GET /api/analytics/patterns` - Pattern detection

#### SMS
- `POST /api/sms/receive` - Twilio webhook endpoint
- `POST /api/sms/send` - Send SMS (internal)

#### Cron Jobs
- `GET /api/cron/expire-consequences` - Run consequence expiration
- `GET /api/cron/mark-missed-commitments` - Run commitment checking
- `GET /api/cron/daily-reminders` - Send daily reminders
- `GET /api/cron/calculate-stats` - Calculate daily stats
- `GET /api/cron/cleanup-sms-context` - Clean up expired contexts

#### Utilities
- `GET /api/seed/accountability` - Seed dummy data (dev only)

---

## Database Schema

### Gift Tracker Tables

#### `recipients`
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- name: TEXT
- age: INTEGER
- relationship: TEXT
- birthday: DATE
- interests: TEXT[]
- budget: NUMERIC
- avatar_color: TEXT
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `gifts`
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- recipient_id: UUID (FK to recipients)
- name: TEXT
- description: TEXT
- price: NUMERIC
- budget: NUMERIC
- status: gift_status (enum)
- occasion: TEXT
- purchase_date: DATE
- purchase_url: TEXT
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Accountability Tables

#### `children`
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- name: TEXT NOT NULL
- age: INTEGER
- avatar_color: TEXT
- birth_date: DATE
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `consequences`
```sql
- id: UUID (PK)
- child_id: UUID (FK to children)
- restriction_type: TEXT (device, activity, privilege, location)
- restriction_item: TEXT
- reason: TEXT
- duration_days: INTEGER
- expires_at: TIMESTAMP
- status: TEXT (active, expired, lifted, pending_confirmation)
- severity: TEXT (minor, medium, major)
- created_by: UUID (FK to auth.users)
- lifted_by: UUID (FK to auth.users)
- lifted_at: TIMESTAMP
- confirmed_by: UUID (FK to auth.users)
- confirmed_at: TIMESTAMP
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `commitments`
```sql
- id: UUID (PK)
- child_id: UUID (FK to children)
- commitment_text: TEXT NOT NULL
- due_date: TIMESTAMP NOT NULL
- status: TEXT (active, completed, missed)
- category: TEXT (homework, chores, responsibilities, behavior, other)
- completed_on_time: BOOLEAN
- completed_at: TIMESTAMP
- committed_by: UUID (FK to auth.users)
- verified_by: UUID (FK to auth.users)
- reminded_at: TIMESTAMP
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `commitment_stats`
```sql
- id: UUID (PK)
- child_id: UUID (FK to children)
- month: DATE (first day of month)
- total_commitments: INTEGER
- completed_on_time: INTEGER
- completed_late: INTEGER
- missed: INTEGER
- reliability_score: NUMERIC (0-100)
- improvement_trend: TEXT (improving, declining, stable)
- homework_count: INTEGER
- chores_count: INTEGER
- other_count: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `sms_context`
```sql
- id: UUID (PK)
- phone_number: TEXT UNIQUE NOT NULL
- user_id: UUID (FK to auth.users)
- last_message: TEXT
- last_intent: TEXT
- pending_clarification: TEXT
- context_data: JSONB (partial data, conversation step, etc.)
- expires_at: TIMESTAMP (30 minutes from last message)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `partner_settings`
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users)
- partner_phone: TEXT
- sms_notifications: BOOLEAN
- email_notifications: BOOLEAN
- require_confirmation: BOOLEAN
- notification_frequency: TEXT (immediate, daily, weekly)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

---

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# Run database migrations
npx supabase db push

# Seed dummy data (optional)
curl http://localhost:3000/api/seed/accountability

# Run development server
npm run dev
```

### SMS Testing (Local)
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Run ngrok tunnel
ngrok http 3000

# Update Twilio webhook URL with ngrok URL
# Test by sending SMS to your Twilio number
```

### Database Migrations
All migrations are in `supabase/migrations/` directory:
- `20250115_initial_schema.sql` - Initial gift tracker schema
- `20250116_accountability.sql` - Accountability tables
- `20250117_sms_context.sql` - SMS context table
- `20250117_partner_features.sql` - Partner settings

---

## Security

### Authentication
- Supabase Auth (JWT tokens)
- Row Level Security (RLS) on all tables
- User-scoped data access
- Session management

### API Security
- CORS configured for production domain only
- Rate limiting on all endpoints
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized inputs)

### SMS Security
- Twilio signature validation
- Phone number whitelist
- Rate limiting (10 req/min per number)
- User authentication via phone registration

### Environment Variables
- Never commit `.env.local`
- Service role key server-side only
- Rotate secrets every 90 days
- Use Vercel environment variables in production

---

## Monitoring & Support

### Error Tracking
- Console logging for development
- Error boundaries in React components
- Toast notifications for user-facing errors

### Performance
- Next.js automatic code splitting
- React Suspense for loading states
- Optimistic UI updates
- Image optimization (Next.js Image component)

### Future Enhancements
- Sentry error tracking
- Vercel Analytics
- Custom metrics dashboard
- Performance monitoring
- User behavior analytics

---

## Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component-based architecture

### Testing (Future)
- Jest for unit tests
- React Testing Library for components
- Playwright for E2E tests
- API route testing

---

## Changelog

### Version 1.0 (January 17, 2025)
- ✅ Gift Tracker core features
- ✅ Accountability platform
- ✅ SMS integration with Claude AI
- ✅ Advanced SMS features (context, shortcuts, bulk ops)
- ✅ Comprehensive analytics
- ✅ DAKboard integration
- ✅ Partner features
- ✅ Automated cron jobs
- ✅ Family Hub homepage

### Upcoming (Q1 2025)
- Mobile app (React Native)
- Push notifications
- Calendar integration
- Shared family lists
- Voice commands
- Alexa/Google Home integration

---

## Support

### Documentation
- `/accountability/sms-guide` - SMS command reference
- `DEPLOYMENT.md` - Deployment guide
- `SECURITY.md` - Security best practices
- `.env.example` - Environment variable template

### Contact
- Issues: GitHub Issues
- Feature Requests: GitHub Discussions
- Security: security@familyhub.com (if applicable)

---

**© 2025 Family Hub. Built with Next.js, Supabase, and Claude AI.**
