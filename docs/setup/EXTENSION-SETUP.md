# Browser Extension Setup Guide

Your Gift Tracker browser extension is ready! Follow these steps to get it running.

## Quick Start (5 minutes)

### Step 1: Generate Extension Icons

The extension needs 3 icon files before it can be loaded in Chrome.

**Easy Method** (Recommended):
1. Open `extension/assets/create-icons.html` in any web browser
2. You'll see 3 canvases with gift icons
3. Right-click each canvas and select "Save image as..."
4. Save them with these exact names in the `extension/assets/` folder:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-128.png`

**Alternative**: Use any 16x16, 48x48, and 128x128 pixel PNG images you have and rename them to match the above filenames.

### Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle switch in top-right corner)
3. Click **"Load unpacked"**
4. Navigate to and select your `/extension` folder
5. The Gift Tracker extension should now appear in your extensions list!

### Step 3: Pin the Extension

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "Gift Tracker" and click the pin icon
3. The extension icon will now appear in your toolbar for easy access

### Step 4: Sign In

1. Click the extension icon in your toolbar
2. Click "Sign In with Email"
3. Sign in using your Gift Tracker account credentials
4. You're all set!

## How to Use

### Saving Gifts

1. **Visit a product page** on:
   - Amazon
   - Target
   - Walmart
   - Etsy

2. **Look for the checkmark** - The extension icon will show a green ✓ badge when a product is detected

3. **Click the extension icon** - A popup will show:
   - Product image and details
   - Screenshot preview
   - Recipient selector
   - Category and notes fields

4. **Select a recipient** from the dropdown
   - Or click "+ Add new recipient" to create one on the fly

5. **Click "Save Gift Idea"** - Done! The gift is saved with a screenshot

### Viewing Your Gifts

- Click "View All Gifts" in the extension popup, or
- Visit your Gift Tracker dashboard at https://gift-tracker-black.vercel.app

All gifts saved from the extension will have:
- 🔗 "Browser" badge
- Screenshot of the product page (when captured)
- Product image
- All extracted details (name, price, URL, etc.)

## Features

### Automatic Product Detection
- Detects when you're on a supported product page
- Shows badge indicator on extension icon
- Automatically extracts product information

### Screenshot Capture
- Captures full screenshot of the product page
- Saved with gift for reference
- Displayed in your gift dashboard

### Smart Data Extraction
Automatically extracts:
- Product title
- Price
- Product image
- Description/features
- Product URL
- Store/site name

### Quick Recipient Management
- Select from existing recipients
- Add new recipients instantly from the popup
- Recipients sync with your web dashboard

### Seamless Sync
- All gifts sync instantly with your web app
- Access from anywhere
- Cloud-backed with Supabase

## Troubleshooting

### "No product detected" message

**Possible causes:**
- Not on a product page (still on search results or category page)
- Product page structure not recognized
- Page still loading

**Solutions:**
- Make sure you're on an individual product page, not search results
- Refresh the page and wait a few seconds
- Check the browser console for errors (F12)

### Can't sign in

**Solutions:**
- Make sure you have an account on the Gift Tracker web app
- Try signing in to https://gift-tracker-black.vercel.app first
- Clear extension data: Go to `chrome://extensions/` → Click "Details" on Gift Tracker → "Clear extension data"
- Reload the extension

### Extension icon doesn't show badge

**Solutions:**
- Refresh the product page
- Make sure the site is supported (Amazon, Target, Walmart, or Etsy)
- Try clicking the extension icon anyway - it may have detected the product without showing the badge

### Screenshot not capturing

**Solutions:**
- Make sure the tab is visible (not minimized or in background)
- The extension needs the tab to be active to capture screenshots
- Try clicking save again

### Recipient not in dropdown

**Solutions:**
- Click "+ Add new recipient" to add them
- Make sure you've created recipients in the web app first
- Try refreshing the extension popup

## Advanced

### Adding Support for More Sites

Want to add support for another e-commerce site?

1. Open `extension/manifest.json`
2. Add the site to `content_scripts.matches`:
   ```json
   "matches": [
     "https://*.amazon.com/*",
     "https://*.target.com/*",
     "https://*.walmart.com/*",
     "https://*.etsy.com/*",
     "https://*.newsite.com/*"  // Add new site
   ]
   ```

3. Open `extension/content/extractors.js`
4. Add a new extractor function:
   ```javascript
   function extractNewSiteProduct() {
     const productTitle = document.querySelector('.product-title');
     if (!productTitle) return null;

     return {
       url: window.location.href,
       title: productTitle.textContent,
       price: extractPrice(),
       image: extractImage(),
       description: extractDescription(),
       site: 'newsite'
     };
   }
   ```

5. Update the `detectProduct()` function to call your extractor

6. Reload the extension in Chrome

### Debugging

**Content Scripts** (runs on product pages):
- Open DevTools on any product page (F12)
- Look for "Gift Tracker: Content script loaded" in console
- Check for product detection logs

**Extension Popup**:
- Right-click the extension icon
- Select "Inspect popup"
- DevTools will open for the popup

**Background Service Worker**:
- Go to `chrome://extensions/`
- Find Gift Tracker
- Click "service worker" link
- Background script console will open

## What's Next?

### Test the Extension

Visit these sites and try saving some gifts:
- [Amazon Product](https://www.amazon.com/dp/B0BSHF7WHW) - AirPods Pro
- [Target Product](https://www.target.com/p/apple-airpods-pro-2nd-generation/-/A-85978621)
- [Walmart Product](https://www.walmart.com/ip/Apple-AirPods-Pro-2nd-generation/1752657021)
- [Etsy Product](https://www.etsy.com/listing/1234567890/) - any handmade item

### Next Features to Build

Now that the extension is working, you might want to:
- Simplify the web UI for frictionless experience (next task)
- Add price tracking notifications
- Bulk import from wishlists
- AI-powered gift suggestions based on browsing history
- Share gift lists with family

## Support

If you run into issues:
1. Check the troubleshooting section above
2. Look at the browser console for errors
3. Check `extension/README.md` for technical details
4. Verify your Supabase credentials in `extension/popup/popup.js`

## File Structure

```
extension/
├── manifest.json              # Extension configuration
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.css             # Popup styles
│   └── popup.js              # Popup logic
├── content/
│   ├── detector.js           # Product detection
│   └── extractors.js         # Site-specific extractors
├── background/
│   └── service-worker.js     # Background tasks
├── lib/
│   └── supabase.js           # Database client
├── types/
│   └── index.ts              # Type definitions
└── assets/
    ├── icon-16.png           # Extension icons
    ├── icon-48.png
    └── icon-128.png
```
