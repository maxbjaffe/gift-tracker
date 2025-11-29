# GiftStash Database Schema

Complete documentation of the GiftStash PostgreSQL database schema.

## Overview

GiftStash uses PostgreSQL 15+ (via Supabase) with Row Level Security (RLS) for multi-tenant data isolation. All tables are owned by individual users and automatically filtered by `user_id` through RLS policies.

## Core Tables

### recipients

Stores information about gift recipients (people you buy gifts for).

**Table Structure:**

```sql
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  relationship TEXT,
  birthday DATE,
  age_range TEXT,
  gender TEXT,

  -- Avatar
  avatar_type TEXT CHECK (avatar_type IN ('preset', 'emoji', 'ai', 'photo', 'initials')),
  avatar_data TEXT,
  avatar_background TEXT,
  avatar_url TEXT,

  -- Interests & Preferences
  interests TEXT[],
  hobbies TEXT[],
  favorite_colors TEXT[],
  favorite_brands TEXT[],
  favorite_stores TEXT[],
  gift_preferences TEXT,
  gift_dos TEXT[],
  gift_donts TEXT[],
  restrictions TEXT[],

  -- Practical Details
  clothing_sizes JSONB,
  wishlist_items JSONB,
  past_gifts_received JSONB,
  items_already_owned TEXT[],

  -- Budget
  max_budget NUMERIC,
  max_purchased_budget NUMERIC,

  -- Sharing
  share_token UUID DEFAULT gen_random_uuid() UNIQUE,
  share_privacy TEXT DEFAULT 'private' CHECK (share_privacy IN ('private', 'link-only', 'public')),
  share_enabled BOOLEAN DEFAULT false,
  share_expires_at TIMESTAMPTZ,
  share_view_count INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

```sql
CREATE INDEX idx_recipients_user_id ON recipients(user_id);
CREATE INDEX idx_recipients_created_at ON recipients(created_at DESC);
CREATE INDEX idx_recipients_share_token ON recipients(share_token)
  WHERE share_enabled = true;
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner of this recipient (FK to auth.users) |
| `name` | TEXT | Recipient's name (required) |
| `relationship` | TEXT | Relationship to user (e.g., "Sister", "Friend") |
| `birthday` | DATE | Recipient's birthday |
| `age_range` | TEXT | Age bracket (e.g., "30-39") |
| `gender` | TEXT | Gender for personalized recommendations |
| `avatar_type` | TEXT | Avatar type (preset, emoji, ai, photo, initials) |
| `avatar_data` | TEXT | Avatar-specific data (emoji char, image URL, etc.) |
| `avatar_background` | TEXT | Background color for avatar |
| `avatar_url` | TEXT | Full URL to avatar image |
| `interests` | TEXT[] | Array of interests |
| `hobbies` | TEXT[] | Array of hobbies |
| `favorite_colors` | TEXT[] | Favorite colors |
| `favorite_brands` | TEXT[] | Preferred brands |
| `favorite_stores` | TEXT[] | Preferred stores |
| `gift_preferences` | TEXT | Free-form gift preferences |
| `gift_dos` | TEXT[] | Things they love |
| `gift_donts` | TEXT[] | Things to avoid |
| `restrictions` | TEXT[] | Allergies, dietary restrictions, etc. |
| `clothing_sizes` | JSONB | Size information (e.g., `{"shirt": "M", "shoe": "10"}`) |
| `wishlist_items` | JSONB | Known wishlist |
| `past_gifts_received` | JSONB | Gift history |
| `items_already_owned` | TEXT[] | Things they already have |
| `max_budget` | NUMERIC | Max budget per gift |
| `max_purchased_budget` | NUMERIC | Total budget across all occasions |
| `share_token` | UUID | Unique token for public sharing URL |
| `share_privacy` | TEXT | Privacy level (private, link-only, public) |
| `share_enabled` | BOOLEAN | Whether sharing is currently enabled |
| `share_expires_at` | TIMESTAMPTZ | Optional expiration for shared links |
| `share_view_count` | INTEGER | Number of times shared list viewed |
| `notes` | TEXT | Free-form notes |

**Example Data:**

```json
{
  "id": "abc-123-def",
  "user_id": "user-uuid",
  "name": "Jane Doe",
  "relationship": "Sister",
  "birthday": "1990-05-15",
  "age_range": "30-39",
  "gender": "female",
  "interests": ["photography", "hiking", "cooking"],
  "hobbies": ["baking", "gardening"],
  "favorite_brands": ["Patagonia", "Apple"],
  "favorite_stores": ["REI", "Target"],
  "gift_preferences": "Prefers experiences over things",
  "max_budget": 100.00,
  "share_enabled": true,
  "share_token": "share-token-uuid",
  "share_privacy": "link-only"
}
```

---

### gifts

Stores gift items and ideas.

**Table Structure:**

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Product Details
  url TEXT,
  image_url TEXT,
  store TEXT,
  brand TEXT,

  -- Pricing
  current_price NUMERIC,
  original_price NUMERIC,
  price_history JSONB,
  price_last_checked TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'idea',
  priority TEXT,
  purchase_date DATE,

  -- Occasion
  occasion TEXT,
  occasion_date DATE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

```sql
CREATE INDEX idx_gifts_user_id ON gifts(user_id);
CREATE INDEX idx_gifts_status ON gifts(status);
CREATE INDEX idx_gifts_created_at ON gifts(created_at DESC);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner of this gift (FK to auth.users) |
| `name` | TEXT | Gift name (required) |
| `description` | TEXT | Product description |
| `category` | TEXT | Category (Electronics, Books, etc.) |
| `url` | TEXT | Product URL |
| `image_url` | TEXT | Product image URL |
| `store` | TEXT | Store name (Amazon, Target, etc.) |
| `brand` | TEXT | Brand name |
| `current_price` | NUMERIC | Current price |
| `original_price` | NUMERIC | Original/MSRP price |
| `price_history` | JSONB | Historical prices (future feature) |
| `price_last_checked` | TIMESTAMPTZ | When price was last updated |
| `status` | TEXT | Status (idea, considering, purchased, wrapped, given) |
| `priority` | TEXT | Priority level (high, medium, low) |
| `purchase_date` | DATE | When gift was purchased |
| `occasion` | TEXT | Global occasion for this gift |
| `occasion_date` | DATE | Global occasion date |
| `notes` | TEXT | Personal notes |

**Status Values:**
- `idea` - Initial gift idea
- `considering` - Evaluating this option
- `purchased` - Gift has been bought
- `wrapped` - Gift is wrapped and ready
- `given` - Gift has been delivered

**Example Data:**

```json
{
  "id": "gift-uuid",
  "user_id": "user-uuid",
  "name": "Sony WH-1000XM5 Wireless Headphones",
  "description": "Industry-leading noise cancellation",
  "category": "Electronics",
  "url": "https://amazon.com/...",
  "image_url": "https://...",
  "store": "Amazon",
  "brand": "Sony",
  "current_price": 349.99,
  "original_price": 399.99,
  "status": "idea",
  "priority": "high",
  "occasion": "Birthday",
  "notes": "On sale this week"
}
```

---

### gift_recipients

Junction table linking gifts to recipients (many-to-many relationship).

**Table Structure:**

```sql
CREATE TABLE gift_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  -- Per-Recipient Details
  occasion TEXT,
  occasion_date DATE,
  status TEXT,
  notes TEXT,

  -- Claiming (for shared lists)
  claimed_by_name TEXT,
  claimed_by_email TEXT,
  claimed_at TIMESTAMPTZ,
  claim_expires_at TIMESTAMPTZ,
  claim_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(gift_id, recipient_id)
);
```

**Indexes:**

```sql
CREATE INDEX idx_gift_recipients_gift_id ON gift_recipients(gift_id);
CREATE INDEX idx_gift_recipients_recipient_id ON gift_recipients(recipient_id);
CREATE INDEX idx_gift_recipients_occasion ON gift_recipients(occasion);
CREATE INDEX idx_gift_recipients_occasion_date ON gift_recipients(occasion_date);
CREATE INDEX idx_gift_recipients_claimed ON gift_recipients(claimed_by_name, claimed_at)
  WHERE claimed_by_name IS NOT NULL;
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `gift_id` | UUID | Gift being linked (FK to gifts) |
| `recipient_id` | UUID | Recipient receiving gift (FK to recipients) |
| `occasion` | TEXT | Occasion for THIS recipient (can differ per recipient) |
| `occasion_date` | DATE | Date for THIS recipient's occasion |
| `status` | TEXT | Status override for this recipient |
| `notes` | TEXT | Notes specific to this recipient |
| `claimed_by_name` | TEXT | Name of person who claimed (shown to owner) |
| `claimed_by_email` | TEXT | Email for claim verification (not shown) |
| `claimed_at` | TIMESTAMPTZ | When item was claimed |
| `claim_expires_at` | TIMESTAMPTZ | When claim auto-expires |
| `claim_notes` | TEXT | Private notes from claimer |

**Example: Same Gift, Different Occasions**

```json
// Gift: "Scented Candle"
// Link 1: For Mom's Birthday
{
  "gift_id": "candle-uuid",
  "recipient_id": "mom-uuid",
  "occasion": "Birthday",
  "occasion_date": "2024-12-15"
}

// Link 2: For Dad's Christmas
{
  "gift_id": "candle-uuid",
  "recipient_id": "dad-uuid",
  "occasion": "Christmas",
  "occasion_date": "2024-12-25",
  "claimed_by_name": "Aunt Susan",
  "claimed_at": "2024-11-20T10:00:00Z"
}
```

---

### recommendation_feedback

Tracks user feedback on AI recommendations for learning and improvement.

**Table Structure:**

```sql
CREATE TABLE recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  -- Recommendation Details
  recommendation_name TEXT NOT NULL,
  recommendation_description TEXT,
  recommendation_category TEXT,
  recommendation_price DECIMAL(10,2),
  recommendation_store TEXT,
  recommendation_brand TEXT,

  -- Feedback Type
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('added', 'dismissed', 'purchased', 'viewed')),

  -- Context
  recipient_age_range TEXT,
  recipient_interests TEXT,
  recipient_relationship TEXT,
  occasion TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT
);
```

**Indexes:**

```sql
CREATE INDEX idx_recommendation_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_recipient ON recommendation_feedback(recipient_id);
CREATE INDEX idx_recommendation_feedback_type ON recommendation_feedback(feedback_type);
CREATE INDEX idx_recommendation_feedback_created ON recommendation_feedback(created_at DESC);
CREATE INDEX idx_recommendation_feedback_brand ON recommendation_feedback(recommendation_brand)
  WHERE recommendation_brand IS NOT NULL;
CREATE INDEX idx_recommendation_feedback_store ON recommendation_feedback(recommendation_store)
  WHERE recommendation_store IS NOT NULL;
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | User who received recommendation |
| `recipient_id` | UUID | Recipient the recommendation was for |
| `recommendation_name` | TEXT | Name of recommended product |
| `recommendation_description` | TEXT | Product description |
| `recommendation_category` | TEXT | Category |
| `recommendation_price` | DECIMAL | Price at time of recommendation |
| `recommendation_store` | TEXT | Store name |
| `recommendation_brand` | TEXT | Brand name |
| `feedback_type` | TEXT | Type of feedback (added, dismissed, purchased, viewed) |
| `recipient_age_range` | TEXT | Recipient age at time of recommendation |
| `recipient_interests` | TEXT | Interests at time of recommendation |
| `recipient_relationship` | TEXT | Relationship at time of recommendation |
| `occasion` | TEXT | Occasion context |
| `session_id` | TEXT | Session identifier for grouping |

**Feedback Types:**
- `added` - User added recommendation to gift list
- `dismissed` - User dismissed/rejected recommendation
- `purchased` - User purchased the recommended item
- `viewed` - User viewed recommendation details

---

### trending_gifts

Aggregates trending gift data across all users for recommendations.

**Table Structure:**

```sql
CREATE TABLE trending_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Gift Identification
  gift_name TEXT NOT NULL,
  gift_category TEXT,
  gift_brand TEXT,
  gift_store TEXT,
  normalized_name TEXT NOT NULL UNIQUE,

  -- Metrics
  add_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  avg_price DECIMAL(10,2),

  -- Demographics
  popular_with_age_ranges TEXT[],
  popular_for_relationships TEXT[],
  popular_occasions TEXT[],

  -- Time Tracking
  last_added_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

```sql
CREATE INDEX idx_trending_gifts_add_count ON trending_gifts(add_count DESC);
CREATE INDEX idx_trending_gifts_purchase_count ON trending_gifts(purchase_count DESC);
CREATE INDEX idx_trending_gifts_category ON trending_gifts(gift_category)
  WHERE gift_category IS NOT NULL;
CREATE INDEX idx_trending_gifts_brand ON trending_gifts(gift_brand)
  WHERE gift_brand IS NOT NULL;
CREATE INDEX idx_trending_gifts_updated ON trending_gifts(updated_at DESC);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `gift_name` | TEXT | Product name |
| `normalized_name` | TEXT | Lowercase, trimmed name for uniqueness |
| `gift_category` | TEXT | Category |
| `gift_brand` | TEXT | Brand |
| `gift_store` | TEXT | Store |
| `add_count` | INTEGER | Times added to gift lists |
| `purchase_count` | INTEGER | Times purchased |
| `view_count` | INTEGER | Times viewed in recommendations |
| `avg_price` | DECIMAL | Average price across feedback |
| `popular_with_age_ranges` | TEXT[] | Age ranges that prefer this |
| `popular_for_relationships` | TEXT[] | Relationships that prefer this |
| `popular_occasions` | TEXT[] | Common occasions |
| `last_added_at` | TIMESTAMPTZ | Most recent add |

**Updated by Function:**

```sql
-- Function runs periodically to aggregate feedback data
CREATE OR REPLACE FUNCTION update_trending_gifts()
RETURNS void AS $$
BEGIN
  -- Aggregates recommendation_feedback into trending_gifts
  -- Groups by normalized_name
  -- Counts adds, purchases, views
  -- Updates popularity arrays
END;
$$ LANGUAGE plpgsql;
```

---

### share_views

Tracks anonymous views of shared gift lists.

**Table Structure:**

```sql
CREATE TABLE share_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,

  -- Anonymized Visitor Tracking
  visitor_fingerprint TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,

  -- Geo Info (optional)
  country_code TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

```sql
CREATE INDEX idx_share_views_recipient ON share_views(recipient_id);
CREATE INDEX idx_share_views_date ON share_views(viewed_at);
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `recipient_id` | UUID | Recipient whose list was viewed |
| `visitor_fingerprint` | TEXT | Hash of IP + User-Agent for deduplication |
| `viewed_at` | TIMESTAMPTZ | When the view occurred |
| `referrer` | TEXT | HTTP referrer |
| `user_agent` | TEXT | Browser user agent |
| `country_code` | TEXT | Country (if available) |

**Privacy Notes:**
- Fingerprints used only for basic deduplication
- No PII stored
- No cross-site tracking
- Minimal data retention

---

## Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data.

### RLS Policies - Recipients

```sql
-- Users can view their own recipients
CREATE POLICY "Users can view their own recipients"
  ON recipients FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own recipients
CREATE POLICY "Users can create their own recipients"
  ON recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipients
CREATE POLICY "Users can update their own recipients"
  ON recipients FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own recipients
CREATE POLICY "Users can delete their own recipients"
  ON recipients FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view shared recipients
CREATE POLICY "Public read access to shared recipients"
  ON recipients FOR SELECT
  USING (
    share_enabled = true
    AND (share_expires_at IS NULL OR share_expires_at > NOW())
  );
```

### RLS Policies - Gifts

```sql
-- Users can view their own gifts
CREATE POLICY "Users can view their own gifts"
  ON gifts FOR SELECT
  USING (auth.uid() = user_id);

-- Public can view gifts on shared lists
CREATE POLICY "Public read access to gifts for shared recipients"
  ON gifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM gift_recipients gr
      JOIN recipients r ON r.id = gr.recipient_id
      WHERE gr.gift_id = gifts.id
        AND r.share_enabled = true
        AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE
```

### RLS Policies - Gift Recipients

```sql
-- Users can view their gift-recipient links
CREATE POLICY "Users can view their gift recipients"
  ON gift_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gifts
      WHERE gifts.id = gift_recipients.gift_id
        AND gifts.user_id = auth.uid()
    )
  );

-- Public can view gift_recipients for shared lists
CREATE POLICY "Public read access to gift_recipients for shared lists"
  ON gift_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM recipients r
      WHERE r.id = gift_recipients.recipient_id
        AND r.share_enabled = true
        AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())
    )
  );

-- Anonymous users can claim items on shared lists
CREATE POLICY "Anonymous users can claim items on shared lists"
  ON gift_recipients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM recipients r
      WHERE r.id = gift_recipients.recipient_id
        AND r.share_enabled = true
        AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())
    )
  );
```

### RLS Policies - Feedback

```sql
-- Users can only see their own feedback
CREATE POLICY "recommendation_feedback_select_own"
  ON recommendation_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own feedback
CREATE POLICY "recommendation_feedback_insert_own"
  ON recommendation_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

### RLS Policies - Trending Gifts

```sql
-- All authenticated users can view trending gifts
CREATE POLICY "trending_gifts_select_all"
  ON trending_gifts FOR SELECT
  TO authenticated
  USING (true);

-- System can update (via functions)
CREATE POLICY "trending_gifts_update_system"
  ON trending_gifts FOR UPDATE
  TO authenticated
  USING (true);
```

---

## Database Functions

### Claim Management

```sql
-- Claim a gift item
CREATE OR REPLACE FUNCTION claim_gift_item(
  p_gift_recipient_id UUID,
  p_claimed_by_name TEXT,
  p_claimed_by_email TEXT DEFAULT NULL,
  p_claim_notes TEXT DEFAULT NULL,
  p_claim_duration_days INTEGER DEFAULT 30
)
RETURNS JSON;

-- Unclaim a gift item
CREATE OR REPLACE FUNCTION unclaim_gift_item(
  p_gift_recipient_id UUID,
  p_claimer_email TEXT
)
RETURNS JSON;

-- Auto-expire old claims
CREATE OR REPLACE FUNCTION expire_old_claims()
RETURNS INTEGER;
```

### Sharing Management

```sql
-- Enable sharing for a recipient
CREATE OR REPLACE FUNCTION enable_sharing_for_recipient(
  p_recipient_id UUID,
  p_privacy TEXT DEFAULT 'link-only',
  p_expires_in_days INTEGER DEFAULT NULL
)
RETURNS JSON;

-- Track a share view
CREATE OR REPLACE FUNCTION track_share_view(
  p_recipient_id UUID,
  p_visitor_fingerprint TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN;
```

### Analytics Functions

```sql
-- Get trending gifts for a demographic
CREATE OR REPLACE FUNCTION get_trending_gifts_for_profile(
  p_age_range TEXT DEFAULT NULL,
  p_relationship TEXT DEFAULT NULL,
  p_occasion TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  gift_name TEXT,
  gift_category TEXT,
  gift_brand TEXT,
  add_count INTEGER,
  purchase_count INTEGER,
  relevance_score INTEGER
);

-- Get dismissed recommendations
CREATE OR REPLACE FUNCTION get_dismissed_recommendations(
  p_recipient_id UUID
)
RETURNS TABLE (
  recommendation_name TEXT,
  dismissed_at TIMESTAMPTZ
);

-- Get successful gifts for similar recipients
CREATE OR REPLACE FUNCTION get_successful_gifts_for_similar_recipients(
  p_age_range TEXT,
  p_interests TEXT,
  p_relationship TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  gift_name TEXT,
  gift_category TEXT,
  success_count BIGINT
);
```

---

## Relationships

```
auth.users (Supabase Auth)
    ↓
    ├─→ recipients (1:many)
    │       ↓
    │       ├─→ share_views (1:many)
    │       └─→ gift_recipients (many:many)
    │                   ↓
    └─→ gifts (1:many)  │
            ↓           │
            └───────────┘

recipients ←─→ gift_recipients ←─→ gifts

recommendation_feedback → recipients
trending_gifts (aggregated data, no direct FK)
```

---

## Indexes Strategy

### Primary Indexes
- Primary keys (automatic)
- Foreign keys for joins
- Unique constraints (share_token, normalized_name)

### Query Optimization Indexes
- User lookups: `idx_recipients_user_id`, `idx_gifts_user_id`
- Status filtering: `idx_gifts_status`
- Time-based queries: `idx_recipients_created_at`, `idx_gifts_created_at`
- Sharing lookups: `idx_recipients_share_token`

### Performance Considerations
- Partial indexes for filtered queries (WHERE clauses)
- DESC indexes for reverse chronological sorting
- Multi-column indexes for common query combinations

---

## Database Migrations

Migrations are in `/supabase/migrations/` and should be run in order:

1. **20251124_gift_recipient_occasions.sql** - Add occasion fields
2. **20251124_recipient_budgets.sql** - Add budget tracking
3. **20251124_complete_multi_tenancy.sql** - Full RLS setup
4. **20251126_sharing_and_reservations.sql** - Sharing features
5. **20251126_recommendation_feedback_system_v2.sql** - AI feedback system

### Running Migrations

**Via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy migration content
3. Execute

**Via Supabase CLI:**
```bash
npx supabase db push
```

---

## Backup & Recovery

### Backup Strategy

**Supabase automatic backups:**
- Point-in-time recovery
- Daily backups retained for 7 days (free tier)
- Backup before major migrations

**Manual backups:**
```bash
# Export schema
pg_dump -h db.xxx.supabase.co -U postgres --schema-only > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres --data-only > data.sql
```

### Recovery

**Point-in-time recovery:**
- Available in Supabase dashboard
- Restore to any point in last 7 days
- Creates new database instance

---

## Performance Tips

1. **Use indexes** - Add indexes for frequently filtered columns
2. **Limit results** - Always use LIMIT in queries
3. **Select specific columns** - Don't use SELECT *
4. **Use RLS wisely** - RLS policies add WHERE clauses automatically
5. **Batch operations** - Insert/update multiple records at once
6. **Connection pooling** - Handled by Supabase automatically

---

**Next**: [Getting Started](./getting-started.md) | [API Reference](./api-reference.md)
