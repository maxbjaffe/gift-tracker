# GiftStash API Reference

Complete documentation for all GiftStash API endpoints.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Most endpoints require authentication via JWT token from Supabase Auth.

### Authentication Header

```http
Authorization: Bearer <JWT_TOKEN>
```

### Getting a Token

Tokens are automatically managed by Supabase Auth. In server components and API routes, use:

```typescript
const supabase = await createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here",
  "details": "Optional additional details"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Recipients API

Manage recipient profiles.

### GET /api/recipients

Get all recipients for the authenticated user.

**Authentication**: Required

**Request**:
```http
GET /api/recipients
Authorization: Bearer <token>
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
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
    "gift_dos": ["outdoor gear", "photography accessories"],
    "gift_donts": ["perfume", "jewelry"],
    "restrictions": ["gluten-free"],
    "max_budget": 100.00,
    "max_purchased_budget": 150.00,
    "notes": "Loves sustainable products",
    "share_enabled": false,
    "share_token": null,
    "created_at": "2024-11-01T10:00:00Z",
    "updated_at": "2024-11-15T14:30:00Z"
  }
]
```

### POST /api/recipients

Create a new recipient.

**Authentication**: Required

**Request**:
```http
POST /api/recipients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "relationship": "Brother",
  "birthday": "1985-03-20",
  "age_range": "30-39",
  "gender": "male",
  "interests": ["gaming", "tech", "sports"],
  "hobbies": ["basketball", "coding"],
  "favorite_brands": ["Nike", "PlayStation"],
  "favorite_stores": ["Best Buy", "Amazon"],
  "gift_preferences": "Loves the latest tech gadgets",
  "gift_dos": ["electronics", "video games"],
  "gift_donts": ["clothing"],
  "restrictions": [],
  "max_budget": 200.00,
  "notes": "PlayStation 5 owner"
}
```

**Response** (200):
```json
{
  "success": true,
  "recipient": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "John Smith",
    // ... all fields from request
    "created_at": "2024-11-20T10:00:00Z",
    "updated_at": "2024-11-20T10:00:00Z"
  }
}
```

**Validation Errors** (400):
```json
{
  "error": "Name and relationship are required"
}
```

### GET /api/recipients/[id]

Get a single recipient by ID.

**Authentication**: Required

**Request**:
```http
GET /api/recipients/abc-123-def
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "abc-123-def",
  "user_id": "uuid",
  "name": "Jane Doe",
  // ... all recipient fields
}
```

**Not Found** (404):
```json
{
  "error": "Recipient not found"
}
```

### PUT /api/recipients/[id]

Update a recipient.

**Authentication**: Required

**Request**:
```http
PUT /api/recipients/abc-123-def
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "max_budget": 150.00,
  "notes": "Updated preferences"
}
```

**Response** (200):
```json
{
  "success": true,
  "recipient": {
    "id": "abc-123-def",
    // ... updated fields
    "updated_at": "2024-11-20T15:30:00Z"
  }
}
```

### DELETE /api/recipients/[id]

Delete a recipient and all associated data.

**Authentication**: Required

**Request**:
```http
DELETE /api/recipients/abc-123-def
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Recipient deleted"
}
```

---

## Gifts API

Manage gift items.

### GET /api/gifts

Get all gifts for the authenticated user, optionally filtered by recipient.

**Authentication**: Required

**Query Parameters**:
- `recipient_id` (optional) - Filter gifts for a specific recipient

**Request**:
```http
GET /api/gifts?recipient_id=abc-123
Authorization: Bearer <token>
```

**Response** (200):
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Wireless Headphones",
    "description": "Sony WH-1000XM5 Noise Cancelling",
    "category": "Electronics",
    "url": "https://amazon.com/...",
    "image_url": "https://...",
    "store": "Amazon",
    "brand": "Sony",
    "current_price": 349.99,
    "original_price": 399.99,
    "status": "idea",
    "priority": "high",
    "purchase_date": null,
    "occasion": "Birthday",
    "occasion_date": "2024-12-25",
    "notes": "On sale this week",
    "created_at": "2024-11-01T10:00:00Z",
    "updated_at": "2024-11-15T14:30:00Z"
  }
]
```

### POST /api/gifts

Create a new gift.

**Authentication**: Required

**Request**:
```http
POST /api/gifts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "LEGO Star Wars Set",
  "description": "Millennium Falcon Ultimate Collector Series",
  "category": "Toys",
  "url": "https://lego.com/...",
  "image_url": "https://...",
  "store": "LEGO Store",
  "brand": "LEGO",
  "current_price": 849.99,
  "status": "considering",
  "occasion": "Christmas",
  "occasion_date": "2024-12-25",
  "notes": "Pre-order available",
  "recipient_ids": ["uuid-1", "uuid-2"]
}
```

**Response** (200):
```json
{
  "success": true,
  "gift": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "LEGO Star Wars Set",
    // ... all fields from request
    "created_at": "2024-11-20T10:00:00Z",
    "updated_at": "2024-11-20T10:00:00Z"
  }
}
```

**Validation Errors** (400):
```json
{
  "error": "Gift name is required"
}
```

---

## AI Recommendations API

Get AI-powered gift recommendations.

### POST /api/recommendations

Generate personalized gift recommendations for a recipient.

**Authentication**: Required

**Request**:
```http
POST /api/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "uuid",
  "category": "Electronics",
  "minPrice": 50,
  "maxPrice": 200
}
```

**Request Body**:
- `recipientId` (required) - UUID of the recipient
- `category` (optional) - Filter by category
- `minPrice` (optional) - Minimum price
- `maxPrice` (optional) - Maximum price

**Response** (200):
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "Sony WH-1000XM5 Wireless Headphones",
      "brand": "Sony",
      "description": "Industry-leading noise cancellation with exceptional sound quality. Perfect for music lovers and frequent travelers. Features 30-hour battery life and multipoint connection.",
      "price_range": "$349-$399",
      "estimated_price": 349,
      "reasoning": "Matches their love for music and tech gadgets. Sony is one of their favorite brands, and they mentioned wanting better headphones.",
      "where_to_buy": "Amazon, Best Buy, Sony Store",
      "category": "Electronics",
      "search_query": "Sony WH-1000XM5 Wireless Headphones",
      "image_keywords": "sony wh1000xm5 black wireless headphones",
      "amazon_link": "https://www.amazon.com/s?k=Sony+WH-1000XM5",
      "google_shopping_link": "https://www.google.com/search?tbm=shop&q=Sony+WH-1000XM5",
      "image_url": "https://...",
      "image_thumb": "https://...",
      "image_source": "placeholder"
    }
    // ... 7-9 more recommendations
  ]
}
```

**Error - Unauthorized** (401):
```json
{
  "error": "Unauthorized - Please sign in to generate recommendations"
}
```

**Error - Recipient Not Found** (404):
```json
{
  "error": "Recipient not found or you do not have permission to access it"
}
```

### POST /api/ai-suggestions

Legacy endpoint for basic AI suggestions (simpler than /api/recommendations).

**Authentication**: Required

**Request**:
```http
POST /api/ai-suggestions
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "uuid",
  "budget": 100,
  "occasion": "Birthday",
  "category": "Books",
  "minPrice": 10,
  "maxPrice": 50
}
```

**Response** (200):
```json
{
  "success": true,
  "suggestions": [
    {
      "name": "The Midnight Library",
      "description": "Bestselling novel about infinite possibilities",
      "price_range": "$15-$20",
      "reason": "Based on their love of fiction and philosophy"
    }
    // ... 4 more suggestions
  ],
  "recipient": {
    "name": "Jane Doe",
    "relationship": "Sister"
  }
}
```

### POST /api/chat-gift-finder

Conversational AI interface for gift discovery.

**Authentication**: Required

**Request**:
```http
POST /api/chat-gift-finder
Authorization: Bearer <token>
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "I need gift ideas for my tech-loving brother"
    }
  ],
  "recipientId": "uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "I'd be happy to help find the perfect gift for your brother! Let me suggest some great tech gifts:\n\n🎁 **Sony WH-1000XM5 Headphones** ($349-$399)\nIndustry-leading noise cancellation with exceptional sound quality...\n\nWould you like more options in a specific price range?"
}
```

---

## Feedback API

Track user feedback on AI recommendations.

### POST /api/feedback

Record feedback on a recommendation (added, dismissed, viewed, purchased).

**Authentication**: Required

**Request**:
```http
POST /api/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": "uuid",
  "recommendation_name": "Sony WH-1000XM5 Headphones",
  "recommendation_description": "Wireless noise-cancelling headphones",
  "price_range": "$349-$399",
  "where_to_buy": "Amazon, Best Buy",
  "image_url": "https://...",
  "amazon_link": "https://amazon.com/...",
  "google_shopping_link": "https://google.com/...",
  "feedback_type": "added"
}
```

**Feedback Types**:
- `added` - User added recommendation to their gift list
- `dismissed` - User dismissed the recommendation
- `viewed` - User viewed the recommendation
- `purchased` - User purchased the recommended gift

**Response** (200) - For "added" type:
```json
{
  "success": true,
  "message": "Gift created and linked to recipient",
  "gift_id": "uuid",
  "debug": {
    "price_range": "$349-$399",
    "extracted_price": 349,
    "where_to_buy": "Amazon, Best Buy",
    "extracted_store": "Amazon"
  }
}
```

**Response** (200) - For other types:
```json
{
  "success": true,
  "message": "Feedback recorded"
}
```

### GET /api/feedback

Get feedback history for a recipient.

**Authentication**: Required

**Query Parameters**:
- `recipient_id` (required) - UUID of the recipient

**Request**:
```http
GET /api/feedback?recipient_id=uuid
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "feedback": [
    {
      "id": "uuid",
      "recipient_id": "uuid",
      "recommendation_name": "Sony WH-1000XM5 Headphones",
      "recommendation_description": "Wireless noise-cancelling",
      "feedback_type": "added",
      "created_at": "2024-11-20T10:00:00Z"
    }
  ]
}
```

---

## Product Extraction API

Extract product information from URLs or generate from product names.

### POST /api/extract-product

Extract product details using AI.

**Authentication**: Not required

**Request - From URL**:
```http
POST /api/extract-product
Content-Type: application/json

{
  "url": "https://www.amazon.com/dp/B0BKZZZZZ"
}
```

**Request - From Product Name**:
```http
POST /api/extract-product
Content-Type: application/json

{
  "productName": "Sony WH-1000XM5 Headphones",
  "storeName": "Amazon"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "price": 349.99,
    "original_price": 399.99,
    "store": "Amazon",
    "brand": "Sony",
    "category": "Electronics",
    "description": "Industry-leading noise cancellation with exceptional sound quality.",
    "image_url": "https://..."
  },
  "source": "ai_extracted"
}
```

**Response - Partial (200)** - When URL can't be accessed:
```json
{
  "success": true,
  "partial": true,
  "message": "Could not access the product page directly. Please complete the details manually.",
  "data": {
    "name": "Product from Amazon",
    "store": "Amazon",
    "url": "https://amazon.com/..."
  }
}
```

---

## Sharing API

Enable public sharing of recipient gift lists.

### POST /api/recipients/[id]/share

Enable sharing for a recipient's gift list.

**Authentication**: Required (must be recipient owner)

**Request**:
```http
POST /api/recipients/abc-123/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "privacy": "link-only",
  "expiresInDays": 30
}
```

**Request Body**:
- `privacy` - `"private"` | `"link-only"` | `"public"` (default: "link-only")
- `expiresInDays` (optional) - Number of days until link expires

**Response** (200):
```json
{
  "success": true,
  "shareToken": "uuid",
  "shareUrl": "https://yourdomain.com/share/uuid",
  "privacy": "link-only",
  "expiresAt": "2024-12-20T10:00:00Z",
  "recipient": {
    "id": "abc-123",
    "name": "Jane Doe",
    "share_enabled": true,
    "share_token": "uuid"
  }
}
```

### DELETE /api/recipients/[id]/share

Disable sharing for a recipient.

**Authentication**: Required

**Request**:
```http
DELETE /api/recipients/abc-123/share
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Sharing disabled successfully"
}
```

### GET /api/recipients/[id]/share

Get sharing status for a recipient.

**Authentication**: Required

**Request**:
```http
GET /api/recipients/abc-123/share
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "recipientId": "abc-123",
  "recipientName": "Jane Doe",
  "shareEnabled": true,
  "shareToken": "uuid",
  "shareUrl": "https://yourdomain.com/share/uuid",
  "privacy": "link-only",
  "expiresAt": "2024-12-20T10:00:00Z",
  "viewCount": 42,
  "isExpired": false
}
```

---

## Claims API

Allow anonymous users to claim gifts on shared lists.

### POST /api/claims

Claim a gift item (no authentication required).

**Authentication**: Not required

**Request**:
```http
POST /api/claims
Content-Type: application/json

{
  "giftRecipientId": "uuid",
  "claimedByName": "Aunt Susan",
  "claimedByEmail": "susan@example.com",
  "claimNotes": "Will purchase this weekend",
  "claimDurationDays": 30
}
```

**Request Body**:
- `giftRecipientId` (required) - UUID of the gift_recipients record
- `claimedByName` (required) - Name of person claiming (shown to owner)
- `claimedByEmail` (optional) - Email for claim verification
- `claimNotes` (optional) - Private notes from claimer
- `claimDurationDays` (optional) - Days until claim expires (default: 30)

**Response** (200):
```json
{
  "success": true,
  "message": "Gift item claimed successfully",
  "giftRecipient": {
    "id": "uuid",
    "gift_id": "uuid",
    "recipient_id": "uuid",
    "claimed_by_name": "Aunt Susan",
    "claimed_at": "2024-11-20T10:00:00Z",
    "claim_expires_at": "2024-12-20T10:00:00Z"
  },
  "claimedAt": "2024-11-20T10:00:00Z",
  "expiresAt": "2024-12-20T10:00:00Z"
}
```

**Error - Already Claimed** (409):
```json
{
  "error": "This item is already claimed by someone else"
}
```

**Error - Sharing Disabled** (403):
```json
{
  "error": "This gift list is not shared"
}
```

### DELETE /api/claims

Unclaim a gift item.

**Authentication**: Not required

**Query Parameters**:
- `giftRecipientId` (required) - UUID of the gift_recipients record
- `claimerEmail` (optional) - Email used when claiming (for verification)

**Request**:
```http
DELETE /api/claims?giftRecipientId=uuid&claimerEmail=susan@example.com
```

**Response** (200):
```json
{
  "success": true,
  "message": "Gift item unclaimed successfully"
}
```

**Error - Wrong Email** (403):
```json
{
  "error": "Only the person who claimed this item can unclaim it"
}
```

---

## Share Views API

Track anonymous views of shared gift lists.

### POST /api/share-views

Record a view of a shared gift list (no authentication required).

**Authentication**: Not required

**Request**:
```http
POST /api/share-views
Content-Type: application/json

{
  "recipientId": "uuid"
}
```

**Response** (200):
```json
{
  "success": true
}
```

**Note**: This endpoint always returns success, even if tracking fails, as it's non-critical.

---

## Rate Limiting

Currently no rate limiting is implemented, but consider implementing in production:

- Authentication endpoints: 5 requests per minute per IP
- AI endpoints: 10 requests per minute per user
- General endpoints: 100 requests per minute per user

## Webhooks

Currently no webhooks are implemented. Potential future webhooks:

- `gift.created` - When a gift is added
- `gift.purchased` - When a gift is marked as purchased
- `claim.created` - When someone claims a gift on a shared list
- `share.viewed` - When a shared list is viewed

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
// Get all recipients
const response = await fetch('/api/recipients', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const recipients = await response.json()

// Create a gift
const gift = await fetch('/api/gifts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Wireless Headphones',
    current_price: 349.99,
    store: 'Amazon',
    recipient_ids: ['uuid']
  })
})

// Get AI recommendations
const recs = await fetch('/api/recommendations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    recipientId: 'uuid',
    minPrice: 50,
    maxPrice: 200
  })
})
```

### Using Supabase Client

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

const supabase = await createServerSupabaseClient()

// The client automatically includes authentication
const { data: recipients } = await supabase
  .from('recipients')
  .select('*')
  .order('name')

// RLS automatically filters by user_id
```

---

**Next**: [Features Guide](./features.md) | [Database Schema](./database.md)
