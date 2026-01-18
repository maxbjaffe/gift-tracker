# Comprehensive QA Test Checklist
**Date**: November 26, 2024
**Features to Test**: Sharing, PDF Export, AI Recommendations, Feedback System

---

## 🔐 Prerequisites

- [ ] User is logged in to test auth-required features
- [ ] At least one recipient exists with gifts
- [ ] Database migrations applied (`npx supabase db push`)
- [ ] Dev server running (`npm run dev`)

---

## 1️⃣ AI Recommendations System

### Test: Generate Recommendations (Auth Required)

**Steps**:
1. Log in to your account
2. Go to any recipient's detail page (e.g., `/recipients/[id]`)
3. Click "AI Recommend" button (purple gradient button)
4. Wait for recommendations to load

**Expected**:
- ✅ Modal opens with loading spinner
- ✅ Shows "Analyzing trending gifts..." message
- ✅ After 5-10 seconds, displays 8-10 recommendations
- ✅ Each recommendation shows:
  - Brand badge (if available)
  - Store badge with icon (📦 Amazon, 🎯 Target, etc.)
  - Price badge (green)
  - Category badge
  - AI reasoning box (purple gradient)
  - "Add to List" and "Dismiss" buttons

**Common Errors**:
- ❌ "Unauthorized" → Not logged in
- ❌ "Recipient not found" → Invalid recipient ID
- ❌ "Failed to generate recommendations" → Check ANTHROPIC_API_KEY in .env.local
- ❌ Empty recommendations → AI returned invalid JSON (check server logs)

**To Debug**:
```bash
# Check server logs
tail -f .next/server.log

# Test API directly
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"recipientId":"YOUR_RECIPIENT_ID"}'
```

---

### Test: Add Recommendation to List

**Steps**:
1. Generate recommendations (see above)
2. Click "Add to List" on any recommendation

**Expected**:
- ✅ Button shows "Adding..." with spinner
- ✅ Success toast: "Added [gift name] to [recipient]'s list"
- ✅ Gift appears in recipient's gift list
- ✅ Gift has AI reasoning in description

**Common Errors**:
- ❌ "Please sign in to add gifts" → Not logged in
- ❌ "Failed to add gift" → Database error (check RLS policies)

---

### Test: Dismiss Recommendation

**Steps**:
1. Generate recommendations
2. Click "Dismiss" (X button) on any recommendation

**Expected**:
- ✅ Recommendation disappears from list
- ✅ Success toast: "Suggestion dismissed"
- ✅ If you generate recommendations again, dismissed item should NOT appear for 30 days

**Common Errors**:
- ❌ "Failed to dismiss suggestion" → Feedback API error

---

### Test: Recommendation Feedback Tracking

**Steps**:
1. Add a recommendation to list
2. Check database

**Expected**:
```sql
-- Should see feedback record
SELECT * FROM recommendation_feedback
WHERE feedback_type = 'added'
ORDER BY created_at DESC LIMIT 1;

-- Should eventually see trending gift
SELECT * FROM trending_gifts
WHERE normalized_name ILIKE '%product name%';
```

---

## 2️⃣ Gift List Sharing

### Test: Enable Sharing (Auth Required)

**Steps**:
1. Log in to your account
2. Go to any recipient's detail page
3. Click purple "Share" button (🔗 icon)
4. Select privacy level ("Link-only" recommended)
5. Click "Enable Sharing"
6. Copy the share URL

**Expected**:
- ✅ Modal opens with sharing settings
- ✅ After enabling, shows share URL with copy button
- ✅ Shows "View count: 0 views"
- ✅ Can copy URL to clipboard
- ✅ Success toast appears

**Common Errors**:
- ❌ "Unauthorized" → Not logged in
- ❌ "You do not have permission to share" → Wrong user (recipient belongs to someone else)
- ❌ Button doesn't appear → ShareButton component not imported

**To Debug**:
```sql
-- Check if sharing was enabled
SELECT name, share_token, share_enabled, share_privacy, share_expires_at
FROM recipients
WHERE id = 'YOUR_RECIPIENT_ID';
```

---

### Test: View Shared List (No Auth Required)

**Steps**:
1. Enable sharing and copy URL (see above)
2. Open incognito/private browser window
3. Paste the share URL (e.g., `http://localhost:3000/share/abc-123-def`)
4. Should see gift list WITHOUT logging in

**Expected**:
- ✅ Page loads with purple/blue gradient background
- ✅ Shows recipient name and info
- ✅ Shows "Available Gifts" section
- ✅ Each gift shows:
  - Name, description, price
  - Store information
  - "Reserve This Gift" button
- ✅ Reserved gifts show in separate section with orange badge

**Common Errors**:
- ❌ "Gift list not found or sharing has been disabled" → share_enabled = false or token doesn't match
- ❌ "This shared gift list has expired" → share_expires_at is in the past
- ❌ Page shows loading spinner forever → RLS policy blocking access

**To Debug**:
```sql
-- Check RLS policies allow public access
SELECT * FROM recipients
WHERE share_token = 'YOUR_TOKEN'
AND share_enabled = true;

-- If returns nothing, check if pg_policies are enabled
SELECT * FROM pg_policies WHERE tablename = 'recipients';
```

---

### Test: Reserve Gift on Shared List (No Auth Required)

**Steps**:
1. View shared list in incognito window
2. Click "Reserve This Gift" on any gift
3. Enter your name (email optional)
4. Click "Reserve"

**Expected**:
- ✅ Modal with form appears
- ✅ After submitting, success message
- ✅ Gift moves to "Reserved Gifts" section
- ✅ Shows orange "RESERVED" badge
- ✅ "Reserve" button changes to "Unreserve"

**Common Errors**:
- ❌ "Failed to reserve gift" → RLS policy doesn't allow UPDATE on gift_recipients
- ❌ Button does nothing → JavaScript error (check browser console)

**To Debug**:
```sql
-- Check if gift was claimed
SELECT gr.*, g.name
FROM gift_recipients gr
JOIN gifts g ON g.id = gr.gift_id
WHERE gr.claimed_by_name IS NOT NULL
ORDER BY gr.claimed_at DESC LIMIT 5;
```

---

### Test: Disable Sharing

**Steps**:
1. Log in and go to recipient page
2. Click "Share" button
3. Click "Disable Sharing"

**Expected**:
- ✅ Confirmation modal
- ✅ After disabling, share URL no longer works
- ✅ View count resets

---

## 3️⃣ PDF Export

### Test: Export PDF (Auth Required)

**Steps**:
1. Log in to your account
2. Go to any recipient's detail page with at least a few gifts
3. Click "Export PDF" button (📄 icon)

**Expected**:
- ✅ New tab/window opens
- ✅ Shows printable HTML page with:
  - Recipient name and info
  - "Gift Ideas" section
  - "Purchased Gifts" section
  - Totals box with calculations
  - "Print / Save as PDF" button
- ✅ Clicking print button opens browser print dialog
- ✅ Can save as PDF

**Common Errors**:
- ❌ "Unauthorized" → Not logged in
- ❌ "You do not have permission to export" → Wrong user
- ❌ Blank page → Check server logs for errors
- ❌ PDF doesn't include all gifts → Query issue

**To Debug**:
```bash
# Test API directly
curl http://localhost:3000/api/recipients/YOUR_ID/export-pdf \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

---

## 4️⃣ Chrome Extension (Brand/Store Extraction)

### Test: Extract Product Data

**Steps**:
1. Load extension in Chrome (`chrome://extensions` → Load unpacked → select `/extension` folder)
2. Go to an Amazon product page
3. Check browser console for logs

**Expected**:
- ✅ Console shows: "🎁 Gift Tracker: Product detected!"
- ✅ Product data includes:
  - `title` - Product name
  - `price` - Price as number
  - `brand` - Brand name (NEW!)
  - `category` - Product category (NEW!)
  - `store` - "Amazon" (NEW!)
  - `image` - Image URL

**Common Errors**:
- ❌ No logs → Extension not loaded or content script not injected
- ❌ Brand is null → Selectors out of date (Amazon changes DOM frequently)
- ❌ Category is null → No breadcrumbs found

**To Debug**:
Open browser console and run:
```javascript
window.detectProduct()
```

---

## 5️⃣ Database & RLS Policies

### Test: RLS Policies Allow Public Access

**Steps**:
Run these queries in Supabase SQL editor:

```sql
-- Test 1: Public can read shared recipients
SELECT * FROM recipients
WHERE share_enabled = true
LIMIT 1;

-- Test 2: Public can read gifts for shared recipients
SELECT g.*
FROM gifts g
JOIN gift_recipients gr ON gr.gift_id = g.id
JOIN recipients r ON r.id = gr.recipient_id
WHERE r.share_enabled = true
LIMIT 5;

-- Test 3: Check if recommendation tables exist
SELECT COUNT(*) FROM recommendation_feedback;
SELECT COUNT(*) FROM trending_gifts;

-- Test 4: Check if SQL functions exist
SELECT proname FROM pg_proc
WHERE proname LIKE '%trending%' OR proname LIKE '%recommendation%';
```

**Expected**:
- ✅ All queries return results without error
- ✅ Functions exist:
  - `get_trending_gifts_for_profile`
  - `get_dismissed_recommendations`
  - `get_successful_gifts_for_similar_recipients`
  - `update_trending_gifts`

---

## 6️⃣ Integration Tests

### Test: Full User Flow

**Steps**:
1. Log in
2. Create a recipient ("Test Person", age 25-34, interests: "tech, gaming")
3. Click "AI Recommend"
4. Add 2 recommendations to list
5. Dismiss 1 recommendation
6. Enable sharing for recipient
7. Copy share URL
8. Open incognito window, visit share URL
9. Reserve one gift
10. Back in logged-in window, click "Export PDF"

**Expected**:
- ✅ All steps complete without errors
- ✅ Reserved gift shows orange badge
- ✅ PDF includes all gifts
- ✅ Database has feedback records

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot read property 'getRecommendationContext' of undefined"
**Fix**: Analytics service import issue. Check:
```typescript
// src/app/api/recommendations/route.ts
const { recommendationAnalyticsService } = await import('@/lib/recommendation-analytics.service');
```

### Issue: SQL functions not found
**Fix**: Run migration again:
```bash
npx supabase db push
```

### Issue: RLS blocking public access
**Fix**: Check policies:
```sql
SELECT * FROM pg_policies
WHERE tablename IN ('recipients', 'gifts', 'gift_recipients');
```

### Issue: AI returns empty array
**Fix**: Check AI model access:
```bash
# Verify ANTHROPIC_API_KEY in .env.local
echo $ANTHROPIC_API_KEY
```

---

## ✅ Success Criteria

All features are working if:
- [ ] Can generate AI recommendations while logged in
- [ ] Can add/dismiss recommendations
- [ ] Feedback is recorded in database
- [ ] Can enable sharing (logged in)
- [ ] Can view shared list (not logged in)
- [ ] Can reserve gifts on shared list (not logged in)
- [ ] Can export PDF (logged in)
- [ ] Chrome extension extracts brand/category
- [ ] Database migrations applied successfully
- [ ] RLS policies allow appropriate public access

---

## 📊 Database Check Queries

Run these to verify everything is working:

```sql
-- 1. Check recommendation feedback
SELECT
  feedback_type,
  COUNT(*) as count
FROM recommendation_feedback
GROUP BY feedback_type;

-- 2. Check trending gifts
SELECT
  gift_name,
  gift_brand,
  add_count,
  purchase_count
FROM trending_gifts
ORDER BY add_count DESC
LIMIT 10;

-- 3. Check shared lists
SELECT
  name,
  share_enabled,
  share_privacy,
  share_view_count
FROM recipients
WHERE share_enabled = true;

-- 4. Check reserved gifts
SELECT
  r.name as recipient,
  g.name as gift,
  gr.claimed_by_name,
  gr.claimed_at
FROM gift_recipients gr
JOIN recipients r ON r.id = gr.recipient_id
JOIN gifts g ON g.id = gr.gift_id
WHERE gr.claimed_by_name IS NOT NULL;
```

---

## 🚀 Performance Checks

```sql
-- Check recommendation context query speed
EXPLAIN ANALYZE
SELECT * FROM get_trending_gifts_for_profile('25-34', 'friend', null, 10);

-- Check share page query speed
EXPLAIN ANALYZE
SELECT * FROM recipients WHERE share_token = 'test-token';
```

---

**Last Updated**: November 26, 2024
