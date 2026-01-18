# Production QA Checklist
**Date**: November 26, 2024
**Deployment**: Commits 98a287a + 0fcd3d9
**Critical Fixes**: Auth middleware + Image service

---

## ⚠️ Pre-QA Checklist

- [ ] Verify Vercel deployment completed successfully
- [ ] Check deployment logs for errors
- [ ] Confirm latest commit (0fcd3d9) is deployed
- [ ] Clear browser cache/cookies before testing

---

## 🔐 Test 1: Authentication & Middleware

### 1.1 Login Flow
**Steps**:
1. Go to production URL
2. Click "Login"
3. Enter credentials
4. Should redirect to dashboard

**Expected**:
- ✅ Login successful
- ✅ No console errors
- ✅ Session cookie set

**Pass/Fail**: ___________

---

### 1.2 API Routes Without Auth
**Steps**:
1. Open browser DevTools (Network tab)
2. Log out completely
3. Try to access API endpoint directly:
   - Open: `https://your-domain.com/api/recommendations`

**Expected**:
- ✅ Returns JSON error (not HTML redirect)
- ✅ Status code: 401 Unauthorized
- ✅ Error message: "Unauthorized - Please sign in..."

**Pass/Fail**: ___________

---

### 1.3 Public Share Page (No Auth Required)
**Steps**:
1. In incognito window (not logged in)
2. Visit: `https://your-domain.com/share/test-token-here`

**Expected**:
- ✅ Page loads without login redirect
- ✅ Shows "Gift list not found" (if token invalid)
- ✅ OR shows public gift list (if token valid)
- ✅ No redirect to /login

**Pass/Fail**: ___________

---

## 🤖 Test 2: AI Recommendations

### 2.1 Generate Recommendations (Authenticated)
**Steps**:
1. Log in to production
2. Navigate to Recipients page
3. Click on a recipient (e.g., "Alex")
4. Click purple "AI Recommend" button
5. Wait for recommendations to load (5-15 seconds)

**Expected**:
- ✅ Modal opens with loading spinner
- ✅ Shows "Analyzing trending gifts..."
- ✅ After loading, displays 8-10 recommendations
- ✅ Each recommendation has:
  - Product title
  - Price range
  - Category badge
  - Brand badge (if applicable)
  - Store badge with icon (📦 Amazon, 🎯 Target, etc.)
  - AI reasoning box (purple gradient)
  - "Add to List" button
  - "Dismiss" button

**Pass/Fail**: ___________

---

### 2.2 Recommendation Images
**Steps**:
1. Generate recommendations (see above)
2. Inspect images in recommendations

**Expected**:
- ✅ All images load (no broken image icons)
- ✅ Images show colorful placeholders with:
  - Product name text
  - Category icon (🎮, 📱, 🎧, etc.)
  - Gradient background colors
- ✅ Image URLs use: `placehold.co` domain
- ✅ No 404 errors in browser console for images

**Example Good URL**:
```
https://placehold.co/600x400/e0c3fc/8ec5fc/000?text=🎮+Nintendo+Switch&font=raleway
```

**Pass/Fail**: ___________

---

### 2.3 Add Recommendation to List
**Steps**:
1. Generate recommendations
2. Click "Add to List" on any recommendation

**Expected**:
- ✅ Button shows "Adding..." with spinner
- ✅ Success toast: "Added [gift name] to [recipient]'s list"
- ✅ Modal closes
- ✅ Refresh page - gift appears in recipient's list
- ✅ Gift has description/reasoning from AI

**Pass/Fail**: ___________

---

### 2.4 Dismiss Recommendation
**Steps**:
1. Generate recommendations
2. Click "Dismiss" (X button) on a recommendation

**Expected**:
- ✅ Recommendation disappears from list
- ✅ Success toast: "Suggestion dismissed"
- ✅ Generate recommendations again - dismissed item does NOT reappear

**Pass/Fail**: ___________

---

## 🔗 Test 3: Share Functionality

### 3.1 Enable Sharing
**Steps**:
1. Log in to production
2. Go to a recipient's page
3. Click purple "Share" button (🔗 icon)
4. Select "Link-only" privacy
5. Click "Enable Sharing"
6. Copy the share URL

**Expected**:
- ✅ Modal opens with sharing settings
- ✅ After enabling, shows share URL
- ✅ Shows "View count: 0 views"
- ✅ Can copy URL to clipboard
- ✅ Success toast appears
- ✅ Share URL format: `https://your-domain.com/share/[random-token]`

**Share URL**: _______________________________

**Pass/Fail**: ___________

---

### 3.2 View Shared List (Public - No Login)
**Steps**:
1. Copy share URL from step 3.1
2. Open incognito/private browser window
3. Paste and visit the share URL
4. **DO NOT LOG IN**

**Expected**:
- ✅ Page loads WITHOUT requiring login
- ✅ Shows purple/blue gradient background
- ✅ Shows recipient name and information
- ✅ Shows "Available Gifts" section with gift list
- ✅ Each gift shows:
  - Name, description, price
  - Store information
  - "Reserve This Gift" button
- ✅ Reserved gifts (if any) show in separate section with orange badge

**Pass/Fail**: ___________

---

### 3.3 Reserve Gift on Shared List (No Login)
**Steps**:
1. On shared list in incognito window (not logged in)
2. Click "Reserve This Gift" on any available gift
3. Enter your name: "Test User"
4. Click "Reserve"

**Expected**:
- ✅ Modal with form appears
- ✅ After submitting, success message
- ✅ Gift moves to "Reserved Gifts" section
- ✅ Shows orange "RESERVED" badge
- ✅ Shows "Reserved by: Test User"
- ✅ "Reserve" button changes to "Unreserve"

**Pass/Fail**: ___________

---

### 3.4 Disable Sharing
**Steps**:
1. Log back in (close incognito)
2. Go to same recipient page
3. Click "Share" button
4. Click "Disable Sharing"

**Expected**:
- ✅ Confirmation modal appears
- ✅ After disabling, success message
- ✅ In incognito window, share URL now shows error
- ✅ Error: "Gift list not found or sharing has been disabled"

**Pass/Fail**: ___________

---

## 📄 Test 4: PDF Export

### 4.1 Export PDF
**Steps**:
1. Log in to production
2. Go to a recipient's page with at least 3 gifts
3. Click "Export PDF" button (📄 icon)

**Expected**:
- ✅ New tab/window opens
- ✅ Shows printable HTML page with:
  - Recipient name and info at top
  - "Gift Ideas" section
  - "Purchased Gifts" section (if any)
  - Totals box with calculations
  - "Print / Save as PDF" button
- ✅ Page is formatted for printing
- ✅ All gift data visible and readable

**Pass/Fail**: ___________

---

### 4.2 Print/Save PDF
**Steps**:
1. From export page (see 4.1)
2. Click "Print / Save as PDF" button
3. In print dialog, select "Save as PDF"
4. Save the PDF

**Expected**:
- ✅ Browser print dialog opens
- ✅ Print preview looks good
- ✅ Can save as PDF file
- ✅ PDF file opens correctly
- ✅ All content is visible in PDF

**Pass/Fail**: ___________

---

## 🌐 Test 5: Chrome Extension

### 5.1 Extension Installed
**Steps**:
1. Open Chrome
2. Go to: `chrome://extensions`
3. Find "Gift Tracker" extension

**Expected**:
- ✅ Extension is installed
- ✅ Extension is enabled
- ✅ Shows version number

**Pass/Fail**: ___________

---

### 5.2 Extract from Amazon
**Steps**:
1. Go to any Amazon product page
   - Example: https://www.amazon.com/dp/B0BSHF7WHW
2. Open browser console (F12)
3. Look for console logs from extension

**Expected**:
- ✅ Console shows: "🎁 Gift Tracker: Product detected!"
- ✅ Product data includes:
  - title (product name)
  - price (as number)
  - image (URL)
  - brand (brand name)
  - category (from breadcrumbs)
  - store: "Amazon"
  - site: "amazon"

**Pass/Fail**: ___________

---

### 5.3 Add Gift from Extension
**Steps**:
1. On Amazon product page (see 5.2)
2. Click extension icon
3. Click "Add to Gift List"
4. Select a recipient
5. Click "Add Gift"

**Expected**:
- ✅ Extension popup opens
- ✅ Shows product preview with:
  - REAL product image (not placeholder)
  - Product title
  - Price
  - Brand
  - Store badge
- ✅ Can select recipient
- ✅ Success message after adding
- ✅ Gift appears in recipient's list with REAL image

**Pass/Fail**: ___________

---

## 🗄️ Test 6: Database Checks

### 6.1 Recommendation Feedback
**Steps**:
1. Log in to Supabase dashboard
2. Go to Table Editor
3. Open `recommendation_feedback` table
4. Run query:
```sql
SELECT
  feedback_type,
  COUNT(*) as count
FROM recommendation_feedback
GROUP BY feedback_type
ORDER BY count DESC;
```

**Expected**:
- ✅ Table exists
- ✅ Shows feedback records (if you've added/dismissed recommendations)
- ✅ Types include: 'added', 'dismissed', 'viewed'

**Pass/Fail**: ___________

---

### 6.2 Trending Gifts
**Steps**:
1. In Supabase SQL Editor, run:
```sql
SELECT
  gift_name,
  gift_brand,
  add_count,
  purchase_count
FROM trending_gifts
ORDER BY add_count DESC
LIMIT 10;
```

**Expected**:
- ✅ Table exists
- ✅ Query runs without errors
- ✅ May be empty if no recommendations added yet

**Pass/Fail**: ___________

---

### 6.3 RLS Policies
**Steps**:
1. In Supabase SQL Editor, run:
```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('recipients', 'gifts', 'gift_recipients', 'recommendation_feedback', 'trending_gifts')
ORDER BY tablename, policyname;
```

**Expected**:
- ✅ Multiple policies exist for each table
- ✅ Recipients have public read policy for shared lists
- ✅ Gift_recipients allow public updates (for reservations)
- ✅ Recommendation_feedback has user-specific policies
- ✅ Trending_gifts has read-only public policy

**Pass/Fail**: ___________

---

## 🔍 Test 7: Error Handling

### 7.1 Unauthorized API Calls
**Steps**:
1. Log out completely
2. Open browser console
3. Try to call API:
```javascript
fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipientId: 'test-id' })
}).then(r => r.json()).then(console.log)
```

**Expected**:
- ✅ Status: 401
- ✅ Response: `{ "error": "Unauthorized - Please sign in to generate recommendations" }`
- ✅ NOT redirected to login page
- ✅ Clean JSON error response

**Pass/Fail**: ___________

---

### 7.2 Invalid Recipient ID
**Steps**:
1. Log in
2. Open browser console
3. Call API with fake ID:
```javascript
fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipientId: 'fake-id-12345' })
}).then(r => r.json()).then(console.log)
```

**Expected**:
- ✅ Status: 404
- ✅ Response: `{ "error": "Recipient not found or you do not have permission to access it" }`

**Pass/Fail**: ___________

---

### 7.3 Expired Share Link
**Steps**:
1. If you have a shared list with expiration date in past, test it
2. OR manually expire one in database:
```sql
UPDATE recipients
SET share_expires_at = NOW() - INTERVAL '1 day'
WHERE id = 'some-recipient-id';
```
3. Visit the share URL

**Expected**:
- ✅ Shows error message: "This shared gift list has expired"
- ✅ Does not show gift list
- ✅ Suggests contacting list owner

**Pass/Fail**: ___________

---

## 📊 Test 8: Performance & Loading

### 8.1 Page Load Times
**Test each page**:
- [ ] Home page: _____ seconds
- [ ] Recipients list: _____ seconds
- [ ] Recipient detail: _____ seconds
- [ ] Share page: _____ seconds

**Expected**:
- ✅ All pages load in < 3 seconds
- ✅ No console errors
- ✅ No missing resources (404s)

**Pass/Fail**: ___________

---

### 8.2 AI Recommendation Generation Time
**Steps**:
1. Time how long AI recommendations take
2. Generate recommendations 3 times
3. Record times

**Times**:
- Try 1: _____ seconds
- Try 2: _____ seconds
- Try 3: _____ seconds

**Expected**:
- ✅ All complete within 30 seconds
- ✅ Average time: 5-15 seconds
- ✅ Loading indicator shown throughout

**Pass/Fail**: ___________

---

## 🎨 Test 9: UI/UX

### 9.1 Responsive Design
**Test on different screens**:
- [ ] Desktop (1920x1080): _____
- [ ] Tablet (768x1024): _____
- [ ] Mobile (375x667): _____

**Expected**:
- ✅ All layouts responsive
- ✅ No horizontal scrolling
- ✅ All buttons clickable
- ✅ Text readable at all sizes

**Pass/Fail**: ___________

---

### 9.2 Toast Notifications
**Verify toasts appear for**:
- [ ] Recommendation added: _____
- [ ] Recommendation dismissed: _____
- [ ] Sharing enabled: _____
- [ ] Sharing disabled: _____
- [ ] Gift reserved: _____
- [ ] Errors: _____

**Expected**:
- ✅ All toasts appear
- ✅ Toasts auto-dismiss after 3-5 seconds
- ✅ Success toasts are green
- ✅ Error toasts are red

**Pass/Fail**: ___________

---

## 🐛 Test 10: Browser Compatibility

### 10.1 Test in Multiple Browsers
**Chrome**:
- AI Recommendations: _____
- Sharing: _____
- PDF Export: _____
- Extension: _____

**Safari**:
- AI Recommendations: _____
- Sharing: _____
- PDF Export: _____

**Firefox**:
- AI Recommendations: _____
- Sharing: _____
- PDF Export: _____

**Expected**:
- ✅ All features work in all browsers
- ✅ No browser-specific errors

**Pass/Fail**: ___________

---

## ✅ Final Verification

### Critical Issues Found:
```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Non-Critical Issues:
```
1. ___________________________________________
2. ___________________________________________
```

### Overall Status:
- [ ] PASS - Ready for users
- [ ] FAIL - Critical issues found
- [ ] PARTIAL - Minor issues, can deploy with monitoring

---

## 📝 Sign-Off

**QA Performed By**: ___________
**Date**: ___________
**Time**: ___________
**Production URL**: ___________
**Commit Hash**: 0fcd3d9

**Notes**:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🚨 Rollback Plan

If critical issues found:
1. Revert to previous commit: `98a287a`
2. Run: `git revert 0fcd3d9`
3. Push to trigger redeployment
4. Notify users of temporary service interruption

---

**Last Updated**: November 26, 2024
