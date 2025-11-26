# Quick Integration Guide - Sharing & Reservations

Now that the database migration is complete, here's how to integrate the new sharing features into your app!

---

## 1. Add Share Button to Recipient Detail Page

**File**: `/src/app/recipients/[id]/page.tsx`

Add the ShareButton component to the recipient detail page:

```tsx
import { ShareButton } from '@/components/ShareButton';

// Inside your recipient detail page component:
<div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold">{recipient.name}</h1>

  {/* Add the Share Button */}
  <ShareButton
    recipient={recipient}
    onShareUpdated={async () => {
      // Refresh recipient data after sharing is enabled/disabled
      router.refresh();
    }}
  />
</div>
```

---

## 2. Show Reserved Badges on Gifts

**File**: `/src/app/gifts/page.tsx` or wherever you display gifts

Add a visual indicator for reserved items:

```tsx
// In your gift card/item component:
{giftRecipient.claimed_by_name && (
  <div className="absolute top-2 right-2">
    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
      RESERVED
    </span>
  </div>
)}

{/* Optional: Show who claimed it (only visible to owner) */}
{giftRecipient.claimed_by_name && (
  <p className="text-sm text-gray-500 mt-2">
    Reserved by {giftRecipient.claimed_by_name}
  </p>
)}
```

---

## 3. Add Share Button to Recipients List

**File**: `/src/app/recipients/page.tsx`

Add a quick share action to each recipient card:

```tsx
import { ShareButton } from '@/components/ShareButton';

// In your recipient card:
<div className="flex items-center justify-between p-4">
  <div>
    <h3>{recipient.name}</h3>
    {recipient.share_enabled && (
      <span className="text-xs text-green-600">
        🔗 Sharing enabled • {recipient.share_view_count || 0} views
      </span>
    )}
  </div>

  <ShareButton recipient={recipient} />
</div>
```

---

## 4. Test the Features

### Testing Sharing:

1. **Enable Sharing**:
   - Go to a recipient detail page
   - Click the "Share" button
   - Select "Link-only" privacy
   - Click "Enable Sharing"
   - Copy the shareable URL

2. **View Public Page**:
   - Open an incognito/private browser window
   - Paste the shareable URL
   - You should see the public gift list (no login required)

3. **Reserve an Item**:
   - On the public page, click "Reserve This Gift"
   - Enter your name (e.g., "Aunt Linda")
   - Optional: Enter email
   - Click "Confirm"
   - Item should show as "RESERVED"

4. **Verify from Owner's View**:
   - Go back to your logged-in view
   - Refresh the gifts page
   - You should see the item marked as reserved
   - Claimer name should be visible only to you

### Testing Unreserve:

1. On the public page, scroll to "Reserved Gifts"
2. Click "Unreserve (if you claimed this)"
3. If you provided an email, you'll be asked to verify it
4. Item should become available again

---

## 5. Common Issues & Solutions

### Issue: ShareButton not showing
**Solution**: Make sure you imported it: `import { ShareButton } from '@/components/ShareButton';`

### Issue: Public page shows 404
**Solution**:
- Verify `share_enabled = true` in database
- Check that `share_expires_at` is null or future date
- Try accessing with the full URL including the token

### Issue: Can't reserve items
**Solution**:
- Check browser console for errors
- Verify RLS policies are set correctly
- Ensure `/api/claims` endpoint is working

### Issue: View count not incrementing
**Solution**:
- Check that `/api/share-views` endpoint is working
- Verify `share_views` table exists with INSERT permission

---

## 6. Optional: Add Sharing Analytics

Show detailed sharing stats on the recipient detail page:

```tsx
{recipient.share_enabled && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <h3 className="font-semibold text-blue-800 mb-2">Sharing Stats</h3>
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-gray-600">Views</p>
        <p className="text-2xl font-bold text-blue-600">
          {recipient.share_view_count || 0}
        </p>
      </div>
      <div>
        <p className="text-gray-600">Reserved</p>
        <p className="text-2xl font-bold text-purple-600">
          {gifts.filter(g => g.claimed_by_name).length}
        </p>
      </div>
      <div>
        <p className="text-gray-600">Available</p>
        <p className="text-2xl font-bold text-green-600">
          {gifts.filter(g => !g.claimed_by_name).length}
        </p>
      </div>
    </div>
  </div>
)}
```

---

## 7. Add to Navigation (Optional)

Consider adding a "Shared Lists" section to your main navigation to highlight recipients with active sharing:

```tsx
// In your sidebar or navigation:
<nav>
  <Link href="/recipients">All Recipients</Link>
  <Link href="/recipients?filter=shared">
    Shared Lists
    {sharedCount > 0 && (
      <span className="bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs ml-2">
        {sharedCount}
      </span>
    )}
  </Link>
  <Link href="/gifts">Gifts</Link>
</nav>
```

---

## 8. Next Steps

Once you've integrated and tested the sharing features, consider:

1. **PDF Export** (from your original request)
   - Generate printable gift lists
   - Include QR code for share URL
   - Format for easy printing

2. **Email Notifications**
   - Notify when items are reserved
   - Weekly summary of shared list activity

3. **Enhanced Analytics**
   - Track which gifts are viewed most
   - See referrer sources
   - Geographic distribution of viewers

4. **Mobile App**
   - Consider React Native app for easier sharing
   - Push notifications for reservations

---

## Ready to Go! 🚀

Your sharing and reservation system is now fully operational! Start by adding the ShareButton to one page and test the full flow. The system is designed to be secure, anonymous, and user-friendly.

**Questions or issues?** Check the `SHARING_RESERVATIONS_IMPLEMENTATION.md` for detailed technical documentation.
