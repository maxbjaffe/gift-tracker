# GiftStash Architecture

This document provides a comprehensive overview of the GiftStash system architecture, technology stack, and design patterns.

## System Overview

GiftStash is built as a modern web application using Next.js 14 with the App Router, providing both server-side and client-side rendering capabilities. The architecture follows a serverless pattern with API routes handling backend logic and Supabase providing database and authentication services.

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Next.js Frontend (React + TypeScript)     │  │
│  │  - Server Components  - Client Components        │  │
│  │  - Tailwind CSS       - Radix UI                 │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes (Serverless)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  /api/gifts        /api/recipients               │  │
│  │  /api/recommendations  /api/feedback             │  │
│  │  /api/share-views  /api/claims                   │  │
│  └──────────────────────────────────────────────────┘  │
└──────┬─────────────────────────┬────────────────────────┘
       │                         │
       │                         │
       ▼                         ▼
┌─────────────────┐      ┌──────────────────────┐
│  Supabase       │      │  Anthropic Claude    │
│  - PostgreSQL   │      │  - Sonnet 4.5        │
│  - Auth (JWT)   │      │  - Haiku 3           │
│  - RLS Policies │      │  - AI Recommendations│
│  - Storage      │      └──────────────────────┘
└─────────────────┘
```

## Technology Stack

### Frontend Technologies

#### Next.js 14 (App Router)
- **Version**: 14.2.33
- **Rendering**: Server Components by default, Client Components when needed
- **Routing**: File-based routing with App Router
- **API Routes**: Serverless functions for backend logic
- **Image Optimization**: Built-in image optimization
- **PWA Support**: Progressive Web App capabilities via next-pwa

#### React 18
- **Components**: Functional components with hooks
- **State Management**: React hooks (useState, useEffect, useContext)
- **Server Components**: Reduce JavaScript bundle size
- **Streaming**: React Suspense for progressive rendering

#### TypeScript
- **Type Safety**: Full TypeScript coverage
- **Interfaces**: Defined types for all data structures
- **Type Inference**: Strong typing throughout the codebase
- **Generated Types**: Supabase types auto-generated from schema

#### Styling & UI

**Tailwind CSS 3.4**
- Utility-first CSS framework
- Custom configuration for GiftStash theme
- Responsive design utilities
- Dark mode support

**Radix UI (via shadcn/ui)**
- Accessible component primitives
- Dialog, Dropdown, Tabs, Toast, etc.
- Fully customizable with Tailwind
- Keyboard navigation support

**Additional UI Libraries**
- `lucide-react` - Icon set
- `recharts` - Charts and data visualization
- `date-fns` - Date formatting and manipulation
- `react-markdown` - Markdown rendering

### Backend Technologies

#### Next.js API Routes
- Serverless functions deployed on Vercel
- RESTful API design
- Middleware support for authentication
- Edge runtime for fast global responses

#### Supabase
- **PostgreSQL Database**: Managed PostgreSQL 15+
- **Authentication**: Email/password with JWT tokens
- **Row Level Security**: User-scoped data access
- **Realtime**: WebSocket subscriptions (optional)
- **Storage**: File uploads for images (if needed)

#### Anthropic Claude AI
- **Models Used**:
  - `claude-sonnet-4.5-20250929` - Advanced recommendations
  - `claude-3-5-sonnet-20241022` - Gift chat
  - `claude-3-haiku-20240307` - Fast product extraction
- **SDK**: @anthropic-ai/sdk v0.68.0
- **Features**:
  - Natural language understanding
  - Structured JSON outputs
  - Function calling support

### Database

**PostgreSQL 15+ (via Supabase)**
- ACID compliant relational database
- JSONB support for flexible data
- Full-text search capabilities
- Stored procedures for complex queries
- Triggers for automated updates
- Comprehensive indexing strategy

### Authentication & Security

**Supabase Auth**
- JWT-based authentication
- Email/password authentication
- Session management
- Password reset flow
- Email verification

**Row Level Security (RLS)**
- All tables have RLS enabled
- User-scoped queries automatically enforced
- No data leakage between users
- Public access for shared gift lists

### Deployment & Hosting

**Vercel**
- Automatic deployments from Git
- Edge Network for global performance
- Serverless Functions for API routes
- Environment variable management
- Preview deployments for PRs

## Directory Structure

```
gift-tracker/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth-protected routes
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── recipients/           # Recipient management
│   │   │   │   ├── page.tsx          # List recipients
│   │   │   │   ├── new/              # Create recipient
│   │   │   │   ├── [id]/             # View/edit recipient
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   └── budgets/          # Budget tracking
│   │   │   ├── gifts/                # Gift management
│   │   │   │   ├── page.tsx          # List gifts
│   │   │   │   ├── new/              # Create gift
│   │   │   │   └── [id]/             # View/edit gift
│   │   │   ├── analytics/            # Analytics dashboard
│   │   │   └── settings/             # User settings
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── gifts/
│   │   │   │   └── route.ts          # GET, POST /api/gifts
│   │   │   ├── recipients/
│   │   │   │   ├── route.ts          # GET, POST /api/recipients
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts      # GET, PUT, DELETE
│   │   │   │   │   └── share/
│   │   │   │   │       └── route.ts  # Sharing endpoints
│   │   │   │   ├── match/
│   │   │   │   └── suggest/
│   │   │   ├── recommendations/
│   │   │   │   └── route.ts          # AI recommendations
│   │   │   ├── feedback/
│   │   │   │   └── route.ts          # Recommendation feedback
│   │   │   ├── ai-suggestions/
│   │   │   │   └── route.ts          # Legacy AI endpoint
│   │   │   ├── chat-gift-finder/
│   │   │   │   └── route.ts          # Chat interface
│   │   │   ├── extract-product/
│   │   │   │   └── route.ts          # URL extraction
│   │   │   ├── claims/
│   │   │   │   └── route.ts          # Gift claiming
│   │   │   └── share-views/
│   │   │       └── route.ts          # View tracking
│   │   │
│   │   ├── share/
│   │   │   └── [token]/              # Public gift list sharing
│   │   │       └── page.tsx
│   │   │
│   │   ├── login/                    # Authentication pages
│   │   ├── signup/
│   │   ├── about/                    # Marketing pages
│   │   ├── how-it-works/
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/                   # React Components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── gifts/                    # Gift-related components
│   │   │   ├── gift-card.tsx
│   │   │   ├── gift-form.tsx
│   │   │   ├── gift-list.tsx
│   │   │   └── status-badge.tsx
│   │   │
│   │   ├── recipients/               # Recipient components
│   │   │   ├── recipient-card.tsx
│   │   │   ├── recipient-form.tsx
│   │   │   └── recipient-profile.tsx
│   │   │
│   │   ├── recommendations/          # AI recommendation components
│   │   │   ├── recommendation-card.tsx
│   │   │   └── recommendations-list.tsx
│   │   │
│   │   └── shared/                   # Shared components
│   │       ├── navbar.tsx
│   │       ├── footer.tsx
│   │       └── loading-spinner.tsx
│   │
│   ├── lib/                          # Utility Libraries
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── server.ts             # Server-side client
│   │   │   └── client.ts             # Client-side client
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   ├── gift.service.ts
│   │   │   ├── recipient.service.ts
│   │   │   └── recommendation.service.ts
│   │   │
│   │   ├── recommendation-analytics.service.ts
│   │   ├── imageService.ts           # Image fetching
│   │   ├── logger.ts                 # Logging utility
│   │   └── utils.ts                  # General utilities
│   │
│   └── types/                        # TypeScript Types
│       ├── database.types.ts         # Supabase generated types
│       └── index.ts                  # Custom types
│
├── supabase/
│   └── migrations/                   # Database migrations
│       ├── 20251124_gift_recipient_occasions.sql
│       ├── 20251124_recipient_budgets.sql
│       ├── 20251126_sharing_and_reservations.sql
│       └── 20251126_recommendation_feedback_system_v2.sql
│
├── public/                           # Static assets
│   ├── images/                       # Image files
│   └── avatars/                      # Avatar images
│
├── docs/                             # Documentation (this folder)
│   ├── README.md
│   ├── getting-started.md
│   ├── architecture.md
│   ├── api-reference.md
│   ├── features.md
│   └── database.md
│
├── .env.example                      # Environment template
├── .env.local                        # Local environment (gitignored)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

## Design Patterns

### Server Components First

GiftStash uses React Server Components by default:

```tsx
// Server Component (default)
// src/app/recipients/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function RecipientsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: recipients } = await supabase
    .from('recipients')
    .select('*')

  return <RecipientList recipients={recipients} />
}
```

Client Components only when needed:

```tsx
// Client Component (interactive)
'use client'
import { useState } from 'react'

export function RecipientForm() {
  const [name, setName] = useState('')
  // Interactive form logic
}
```

### API Route Pattern

All API routes follow this structure:

```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch data (RLS automatically filters by user)
    const { data, error } = await supabase
      .from('table')
      .select('*')

    if (error) throw error

    // 3. Return response
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### Service Layer Pattern

Business logic is encapsulated in service classes:

```typescript
// src/lib/services/recipient.service.ts
export class RecipientService {
  async getRecipients(userId: string) {
    // Business logic
  }

  async createRecipient(data: RecipientInput) {
    // Validation and creation
  }
}
```

### Row Level Security (RLS) Pattern

Database security is enforced at the PostgreSQL level:

```sql
-- Recipients table RLS policy
CREATE POLICY "Users can view their own recipients"
  ON recipients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipients"
  ON recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

This means all queries automatically filter by user, preventing data leakage.

## Data Flow

### Creating a Gift

```
User Input → Client Component → API Route → Supabase
                                     ↓
                              Anthropic AI (optional)
                                     ↓
                              Extract product info
                                     ↓
                              Save to database
                                     ↓
                              Return to client
```

### AI Recommendations Flow

```
User Request → /api/recommendations
       ↓
  Get recipient profile from DB
       ↓
  Fetch recommendation context:
    - Trending gifts
    - Successful gifts for similar people
    - Dismissed recommendations
    - Popular brands/stores
       ↓
  Build prompt with context
       ↓
  Call Claude AI (Haiku for speed)
       ↓
  Parse JSON response
       ↓
  Enhance with images & shopping links
       ↓
  Return recommendations to client
```

### Gift List Sharing Flow

```
Owner enables sharing → Generate share_token
                             ↓
                    Create public URL: /share/[token]
                             ↓
            Share URL with friends/family (no login)
                             ↓
   Anonymous user visits → Track view → Display gifts
                             ↓
                    User claims gift (no auth)
                             ↓
              Update gift_recipients.claimed_by_name
                             ↓
                Owner sees claim in their dashboard
```

## Performance Optimizations

### Database Indexing

Strategic indexes for fast queries:

```sql
-- Recipient lookups by user
CREATE INDEX idx_recipients_user_id ON recipients(user_id);

-- Gift filtering by status
CREATE INDEX idx_gifts_status ON gifts(status);

-- Gift-recipient joins
CREATE INDEX idx_gift_recipients_gift_id ON gift_recipients(gift_id);
CREATE INDEX idx_gift_recipients_recipient_id ON gift_recipients(recipient_id);

-- Shared list lookups
CREATE INDEX idx_recipients_share_token ON recipients(share_token)
  WHERE share_enabled = true;
```

### Image Optimization

- Next.js Image component for automatic optimization
- Lazy loading for images
- Responsive image sizing
- WebP format when supported

### Code Splitting

- Automatic code splitting per route
- Dynamic imports for heavy components
- Separate bundles for client/server code

### Caching Strategy

- Static assets cached with long TTL
- API responses cached where appropriate
- Database query result caching in Supabase

## Security Architecture

### Authentication Flow

```
User Login → Supabase Auth
                 ↓
          Generate JWT token
                 ↓
     Store in httpOnly cookie
                 ↓
   Include in all API requests
                 ↓
  Verify token in API routes
                 ↓
     Extract user_id from JWT
                 ↓
  RLS policies enforce access
```

### API Security

- All authenticated endpoints verify JWT tokens
- RLS prevents unauthorized data access
- Input validation on all endpoints
- SQL injection protection via parameterized queries
- XSS protection via React's built-in escaping

### Public Sharing Security

- Share tokens are UUIDs (unpredictable)
- Optional expiration dates
- Anonymous viewing doesn't expose owner data
- Claimed items hide claimer email from recipient
- View tracking uses fingerprinting, not PII

## Scalability Considerations

### Current Architecture
- Serverless functions scale automatically
- Supabase can handle thousands of concurrent connections
- Database connection pooling handled by Supabase

### Future Scaling Options
- Add Redis caching layer for frequently accessed data
- CDN for static assets
- Database read replicas for heavy read workloads
- Background job processing for heavy AI operations

## Monitoring & Observability

### Logging
- Structured logging with logger utility
- Error tracking in API routes
- Supabase logs for database queries

### Error Handling
- Try-catch blocks in all API routes
- User-friendly error messages
- Detailed error logs for debugging
- Graceful degradation for AI failures

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies with `npm install`
3. Configure `.env.local`
4. Run migrations on Supabase
5. Start dev server with `npm run dev`

### Testing
- Manual testing via browser and API clients
- TypeScript for compile-time safety
- Supabase local development (optional)

### Deployment
1. Push to GitHub
2. Vercel auto-deploys from main branch
3. Environment variables set in Vercel dashboard
4. Preview deployments for feature branches

---

**Next**: [API Reference](./api-reference.md) | [Database Schema](./database.md)
