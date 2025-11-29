# GiftStash Features

Comprehensive guide to all GiftStash features and capabilities.

## Table of Contents

1. [Gift Management](#gift-management)
2. [Recipient Profiles](#recipient-profiles)
3. [AI-Powered Recommendations](#ai-powered-recommendations)
4. [Budget Tracking](#budget-tracking)
5. [Sharing & Collaboration](#sharing--collaboration)
6. [Product Intelligence](#product-intelligence)
7. [Analytics & Insights](#analytics--insights)
8. [Search & Filtering](#search--filtering)

---

## Gift Management

Organize and track all your gift ideas in one place.

### Gift Lifecycle

Gifts move through several statuses as they progress from idea to completion:

1. **Idea** - Initial gift concept
2. **Considering** - Evaluating the option
3. **Purchased** - Gift has been bought
4. **Wrapped** - Gift is ready to give
5. **Given** - Gift has been delivered

### Creating Gifts

**Three Ways to Add Gifts:**

#### 1. URL Import (Smart Extraction)
Paste any product URL and GiftStash will automatically extract:
- Product name and description
- Current price and original price
- Store and brand information
- Product image
- Category

Supported stores:
- Amazon
- Target
- Walmart
- Best Buy
- LEGO Store
- eBay
- Etsy
- Most major retailers

**Example:**
```
URL: https://www.amazon.com/Sony-WH-1000XM5-Headphones/dp/B09XS...
↓
Extracted:
- Name: Sony WH-1000XM5 Wireless Headphones
- Price: $349.99
- Store: Amazon
- Brand: Sony
- Category: Electronics
- Image: [Product photo]
```

#### 2. Manual Entry
Fill in gift details manually:
- Name (required)
- Description
- Price (current and original)
- Store and brand
- Category
- URL and image
- Notes

#### 3. AI Recommendations
Get personalized suggestions and add them with one click (see [AI-Powered Recommendations](#ai-powered-recommendations)).

### Multi-Recipient Support

One gift can be linked to multiple recipients:

**Example Use Cases:**
- Same candle for Mom and Aunt Sarah
- Board game for multiple family members
- Group gift for a couple

**Per-Recipient Details:**
- Different occasions (Mom's birthday, Sarah's Christmas)
- Different occasion dates
- Individual claiming status on shared lists
- Per-recipient notes

### Gift Details

Each gift stores:

**Basic Information:**
- Name and description
- Category
- Brand and store
- Product URL
- Image URL

**Pricing:**
- Current price
- Original price (for tracking sales)
- Price history (future feature)
- Price last checked date

**Status & Priority:**
- Status (Idea, Considering, Purchased, Wrapped, Given)
- Priority level (High, Medium, Low)
- Purchase date
- Occasion and occasion date

**Notes:**
- Personal notes about the gift
- Why it's a good match
- Where to buy
- Any special considerations

### Gift Actions

**Available Actions:**
- Edit gift details
- Change status
- Update price
- Add/remove recipients
- Mark as purchased
- Delete gift

---

## Recipient Profiles

Build comprehensive profiles for everyone you buy gifts for.

### Profile Information

**Basic Details:**
- Name (required)
- Relationship (required) - Sister, Brother, Friend, Coworker, etc.
- Birthday
- Age range (0-12, 13-17, 18-29, 30-39, 40-49, 50+)
- Gender

**Visual Identity:**
- Avatar type (preset, emoji, AI-generated, photo, initials)
- Avatar data (emoji character, image URL, etc.)
- Background color

**Interests & Hobbies:**
- Interests (array) - Photography, Reading, Cooking, etc.
- Hobbies (array) - Gardening, Gaming, Hiking, etc.
- Gift preferences (text) - Detailed description

**Shopping Preferences:**
- Favorite colors (array)
- Favorite brands (array)
- Favorite stores (array)
- Gift do's (array) - Things they love
- Gift don'ts (array) - Things to avoid
- Restrictions (array) - Allergies, dietary restrictions, etc.

**Practical Information:**
- Clothing sizes (JSONB) - Shirt, pants, shoes, etc.
- Items already owned (array) - Prevent duplicate gifts
- Wishlist items (JSONB) - Known wants
- Past gifts received (JSONB) - History tracking

**Budget:**
- Max budget per gift
- Max total budget (across all occasions)
- Budget tracking per occasion

**Notes:**
- Free-form notes about the recipient
- Gift ideas
- Important preferences

### Recipient Dashboard

For each recipient, view:

**Gift Summary:**
- Total gifts for this person
- Breakdown by status
- Total spent vs. budget
- Upcoming occasions

**Quick Actions:**
- Get AI recommendations
- Add new gift
- Edit profile
- Share gift list
- View analytics

### Avatar System

Five avatar types available:

1. **Preset** - Choose from built-in avatar designs
2. **Emoji** - Select any emoji as avatar
3. **AI-Generated** - AI creates custom avatar (future)
4. **Photo** - Upload recipient photo
5. **Initials** - Auto-generated from name

Each avatar can have a custom background color for personalization.

---

## AI-Powered Recommendations

Get intelligent gift suggestions powered by Claude AI.

### How It Works

1. **Profile Analysis** - AI analyzes recipient profile
2. **Context Gathering** - Collects trending gifts and successful past gifts
3. **Personalization** - Matches suggestions to interests and preferences
4. **Filtering** - Applies budget and category constraints
5. **Enhancement** - Adds images and shopping links
6. **Learning** - Improves based on your feedback

### Recommendation Inputs

**From Recipient Profile:**
- Age range
- Gender
- Interests and hobbies
- Favorite brands and stores
- Gift preferences
- Budget limits
- Gift do's and don'ts
- Restrictions

**Additional Context:**
- Trending gifts (what's popular now)
- Successful gifts for similar people
- Previously dismissed recommendations (to avoid)
- Popular brands and stores from feedback data

**Optional Filters:**
- Category constraint (only Electronics, only Books, etc.)
- Price range (min/max)
- Occasion type

### Recommendation Quality

**Each recommendation includes:**

- **Specific product name** with brand (e.g., "Sony WH-1000XM5 Headphones")
- **Detailed description** - 2-3 sentences explaining features and benefits
- **Price range** - Estimated cost
- **Reasoning** - Why it's a good match based on profile
- **Where to buy** - Specific store names
- **Category** - Product type
- **Shopping links** - Amazon and Google Shopping search links
- **Product image** - Visual representation

**Example Recommendation:**
```
Title: Sony WH-1000XM5 Wireless Headphones
Brand: Sony
Description: Industry-leading noise cancellation with exceptional
  sound quality. Perfect for music lovers and frequent travelers.
  Features 30-hour battery life and multipoint connection.
Price Range: $349-$399
Reasoning: Matches their love for music and tech gadgets. Sony is
  one of their favorite brands, and they mentioned wanting better
  headphones for travel.
Where to Buy: Amazon, Best Buy, Sony Store
Category: Electronics
```

### Recommendation Actions

**For each recommendation, you can:**

1. **Add to Gift List** - Creates gift and links to recipient
2. **Dismiss** - Hide this suggestion (won't show again for 30 days)
3. **View Details** - See full information
4. **Shop Now** - Opens Amazon or Google Shopping in new tab

### Feedback Learning System

GiftStash learns from your actions to improve future recommendations:

**Tracked Feedback:**
- **Added** - You added the recommendation to your list
- **Dismissed** - You rejected the recommendation
- **Viewed** - You looked at the recommendation details
- **Purchased** - You bought the recommended gift

**How Feedback Improves Recommendations:**

1. **Trending Gifts** - Products frequently added become trending
2. **Successful Gifts** - Purchased items influence similar recommendations
3. **Avoid Dismissed** - Won't re-suggest recently dismissed items
4. **Brand/Store Preferences** - Learns which brands/stores you prefer
5. **Category Preferences** - Identifies favorite product categories

### Conversational Gift Finder

Chat with AI to discover gifts through natural conversation:

**How to Use:**
1. Navigate to Chat Gift Finder
2. Describe who you're shopping for
3. Answer AI's clarifying questions
4. Receive personalized suggestions
5. Ask follow-up questions

**Example Conversation:**
```
You: "I need a gift for my tech-loving brother"

AI: "I'd be happy to help! A few questions:
     - What's your budget?
     - What tech does he already have?
     - Is this for a special occasion?"

You: "Around $100-150, he has an iPhone and loves gaming"

AI: "Great! Here are some perfect options:

     🎁 Anker PowerCore 20000mAh Battery Pack ($79.99)
     High-capacity portable charger perfect for gaming on the go...

     🎁 SteelSeries Gaming Mouse Pad RGB ($39.99)
     Large desk mat with customizable RGB lighting..."
```

### AI Models Used

- **Claude Sonnet 4.5** - Advanced recommendations, trending analysis
- **Claude 3.5 Sonnet** - Conversational gift finder
- **Claude Haiku 3** - Fast product extraction, basic suggestions

---

## Budget Tracking

Monitor spending across all recipients and occasions.

### Budget Types

**Per-Recipient Budget:**
- `max_budget` - Maximum per gift for this person
- `max_purchased_budget` - Total budget across all occasions

**Real-Time Tracking:**
- Current spending vs. budget
- Remaining budget
- Budget utilization percentage
- Warning when approaching limit

### Budget Dashboard

View spending across all recipients:

**Summary Cards:**
- Total budget allocated
- Total spent
- Remaining budget
- Number of recipients

**Per-Recipient Breakdown:**
- Name and relationship
- Budget allocated
- Amount spent
- Gifts purchased
- Budget status (Under, At, Over)

**Occasion Breakdown:**
- Upcoming occasions
- Budget per occasion
- Spent per occasion

### Budget Warnings

Visual indicators when:
- Approaching budget (>80%)
- At budget (100%)
- Over budget (>100%)

### Gift Pricing

**Price Tracking:**
- Current price
- Original price (for sale tracking)
- Price history (future feature)
- Last price check date

**Price Alerts (Future):**
- Notify when price drops
- Track historical prices
- Alert when back in stock

---

## Sharing & Collaboration

Share gift lists with family and friends to prevent duplicate gifts.

### Public Gift List Sharing

**How It Works:**

1. **Owner enables sharing** for a recipient
2. **Share link generated** - Unique URL like `/share/abc-123-def`
3. **Share with others** - Send link via text, email, etc.
4. **No login required** - Anyone with link can view
5. **Anonymous claiming** - Friends can claim gifts

### Sharing Settings

**Privacy Levels:**

1. **Private** - Not shared, only owner can see
2. **Link-Only** - Anyone with the link can view
3. **Public** - Discoverable (future feature)

**Expiration:**
- Optional expiration date
- Auto-disable after specified days
- Extend or disable at any time

### What's Shared

**Visible to Link Holders:**
- Recipient name and relationship
- All gifts for this recipient
- Gift details (name, price, store, image)
- Gift status (Idea, Considering, Purchased, etc.)
- Claiming status (who claimed each gift)

**NOT Shared:**
- Gift notes (owner's private notes)
- Recipient's full profile details
- Other recipients
- Budget information
- Claimer email addresses

### Gift Claiming System

**How Claiming Works:**

1. **View shared list** - Open the share link
2. **See available gifts** - Unclaimed items clearly marked
3. **Claim a gift** - Click "Claim This Gift"
4. **Provide details:**
   - Your name (e.g., "Aunt Susan") - shown to owner
   - Email (optional) - for unclaiming later
   - Notes (optional) - not shown to recipient
   - Duration (default 30 days)
5. **Gift marked as claimed** - Others see it's taken

**Claim Features:**
- **Expiration** - Claims auto-expire after set duration
- **Email verification** - Only claimer with email can unclaim
- **Anonymous** - No account required
- **Flexible** - Unclaim if plans change

**Claim Display:**
```
✓ Claimed by Aunt Susan on Nov 20, 2024
  (Expires Dec 20, 2024)
```

### Share Analytics

Track how your shared lists are used:

**Metrics Collected:**
- View count
- Unique visitors (fingerprint-based)
- Referrer sources
- View timestamps
- Claim activity

**Privacy-Focused:**
- No personal data stored
- Fingerprints for deduplication only
- No tracking across sites
- Minimal data retention

### Collaboration Scenarios

**Wedding Registry:**
- Share couple's gift list
- Prevent duplicate gifts
- Track who's buying what
- Set group gifts

**Holiday Shopping:**
- Share with extended family
- Coordinate gift buying
- Prevent duplicates
- Track budget collectively

**Birthday Planning:**
- Share with party guests
- Ensure variety in gifts
- Group gift coordination
- Surprise maintenance

---

## Product Intelligence

Automatic product information extraction and enhancement.

### URL Product Extraction

**Paste any product URL and get:**

1. **Product Name** - Clean, formatted name
2. **Price Information** - Current and original prices
3. **Store & Brand** - Automatic detection
4. **Category** - Product classification
5. **Description** - Key features and benefits
6. **Product Image** - High-quality image

**Supported Retailers:**
- Amazon
- Target
- Walmart
- Best Buy
- eBay
- Etsy
- LEGO Store
- Most major e-commerce sites

**Fallback Handling:**
- If URL can't be accessed, extracts basic info from domain
- Manual completion option
- Partial data saves with warnings

### Product Name Generation

**Can't paste a URL? No problem!**

Provide just:
- Product name (e.g., "Sony WH-1000XM5 Headphones")
- Store name (e.g., "Amazon")

AI generates:
- Clean formatted name
- Estimated price range
- Likely brand
- Category
- Product description
- Where to buy

### Image Enhancement

**Automatic image handling:**

1. **Try OpenGraph** - Extract from product page
2. **Search images** - Find product photos
3. **AI-generated** - Create relevant placeholder
4. **Manual upload** - Add your own image

**Image optimization:**
- Automatic resizing
- Thumbnail generation
- Lazy loading
- WebP format support

### Price Intelligence

**Current Features:**
- Current price capture
- Original price tracking
- Sale detection

**Future Features:**
- Price history charts
- Price drop alerts
- Historical low tracking
- Competitor price comparison

---

## Analytics & Insights

Understand your gift-giving patterns and trends.

### Spending Analytics

**Overview Dashboard:**
- Total spent across all recipients
- Average gift price
- Most expensive gift
- Total number of gifts

**By Recipient:**
- Spending per person
- Gifts per person
- Average gift price per person
- Budget utilization

**By Category:**
- Spending by category (Electronics, Books, etc.)
- Most popular categories
- Category trends over time

**By Status:**
- Gifts by status breakdown
- Conversion funnel (Idea → Purchased)
- Time to purchase metrics

### Trending Insights

**System-Wide Trends:**
- Most popular gifts (across all users)
- Trending brands
- Popular stores
- Seasonal trends

**Personalized Trends:**
- Your most-bought categories
- Favorite stores
- Brand preferences
- Average price points

### Recommendation Analytics

**Effectiveness Metrics:**
- Recommendation acceptance rate
- Most successful recommendation types
- Dismissed recommendation patterns
- Category preferences

**Feedback Stats:**
- Total recommendations viewed
- Recommendations added to list
- Recommendations purchased
- Dismissal reasons (future)

### Time-Based Analytics

**Upcoming:**
- Birthdays this month
- Upcoming occasions
- Gifts needed soon
- Budget allocation timeline

**Historical:**
- Gifts given this year
- Spending by month
- Seasonal patterns
- Year-over-year comparison

---

## Search & Filtering

Find gifts and recipients quickly.

### Gift Search

**Search by:**
- Gift name
- Description
- Brand
- Store
- Category
- Price range

**Filter by:**
- Status (Idea, Considering, Purchased, etc.)
- Recipient
- Price range
- Category
- Store
- Date added
- Occasion

**Sort by:**
- Date added (newest/oldest)
- Price (high/low)
- Name (A-Z)
- Status

### Recipient Search

**Search by:**
- Name
- Relationship
- Birthday month
- Age range

**Filter by:**
- Relationship type
- Upcoming birthdays
- Budget status
- Number of gifts

**Sort by:**
- Name (A-Z)
- Next birthday
- Total gifts
- Total spent

### Quick Filters

**Preset Filters:**
- Gifts to buy (status: Idea or Considering)
- Purchased gifts (status: Purchased)
- Over budget recipients
- Upcoming birthdays (next 30 days)
- Recently added gifts

---

## Additional Features

### Keyboard Shortcuts (Future)

- `Ctrl/Cmd + K` - Quick search
- `N` - New gift
- `R` - New recipient
- `?` - Show shortcuts

### Notifications (Future)

- Price drops on watched gifts
- Upcoming birthdays (7 days, 1 day)
- Budget warnings
- Claim notifications on shared lists

### Mobile Experience

- Responsive design works on all devices
- PWA support for install on home screen
- Touch-optimized interface
- Fast performance on mobile networks

### Accessibility

- ARIA labels throughout
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators

---

## Coming Soon

Features planned for future releases:

- **Price Tracking** - Automatic price monitoring and alerts
- **Group Gifts** - Coordinate contributions for expensive gifts
- **Wishlists** - Let recipients create their own wishlists
- **Calendar Integration** - Sync birthdays and occasions
- **Email Reminders** - Automated gift reminder emails
- **Mobile Apps** - Native iOS and Android apps
- **Gift History** - Track all gifts given over the years
- **Photo Uploads** - Upload photos of wrapped/given gifts
- **Receipt Storage** - Store purchase receipts
- **Return Tracking** - Track return windows and policies

---

**Next**: [Database Schema](./database.md) | [API Reference](./api-reference.md)
