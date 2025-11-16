# Gift Tracker Browser Extension

A Chrome extension for capturing gift ideas from e-commerce sites with one click.

## Features

- 🎯 Auto-detect products on Amazon, Target, Walmart, and Etsy
- 📸 Capture screenshots of product pages
- 🎁 Quick save to your gift tracker
- 👥 Assign gifts to recipients instantly
- 🔄 Syncs with your Gift Tracker web app

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `/extension` folder from this project

### Generate Icons (First Time Setup)

Before loading the extension, you need to create the icon files:

1. Open `extension/assets/create-icons.html` in your browser
2. Right-click each canvas and save as:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-128.png`
3. Save all icons in the `extension/assets/` folder

## How to Use

### First Time

1. Click the extension icon in your browser toolbar
2. Click "Sign In with Email"
3. Sign in using your Gift Tracker account
4. You're all set!

### Saving a Gift

1. Visit a product page on Amazon, Target, Walmart, or Etsy
2. Click the extension icon (you'll see a ✓ badge when a product is detected)
3. Select which recipient this gift is for
4. Optionally add category and notes
5. Click "Save Gift Idea"
6. Done! The gift is saved with a screenshot

### Adding a New Recipient

While saving a gift:
1. Click "+ Add new recipient"
2. Enter their name and relationship
3. They'll be instantly available in the dropdown

## Supported Sites

- ✅ Amazon
- ✅ Target
- ✅ Walmart
- ✅ Etsy

## Technical Details

### Architecture

```
extension/
├── manifest.json          # Extension config (Manifest V3)
├── popup/                 # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # Content scripts (run on product pages)
│   ├── detector.js        # Detects when on a product page
│   └── extractors.js      # Extracts product data
├── background/            # Background service worker
│   └── service-worker.js  # Screenshot capture, messaging
├── lib/                   # Shared libraries
│   └── supabase.js        # Supabase client
├── types/                 # TypeScript types
│   └── index.ts
└── assets/                # Icons and images
```

### Permissions

The extension requires these permissions:
- `activeTab` - Access current tab for product detection
- `tabs` - Capture screenshots
- `storage` - Store user session
- `scripting` - Inject content scripts

### Security

- Uses Supabase Auth for secure authentication
- Session stored in chrome.storage.local
- No sensitive data leaves your device except to your Supabase instance
- Screenshots stored as base64 in gift metadata

## Development

### Making Changes

After making changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the Gift Tracker extension
3. Reload any product pages you're testing on

### Debugging

- **Content Scripts**: Open DevTools on the product page
- **Popup**: Right-click extension icon → "Inspect popup"
- **Background**: Go to `chrome://extensions/` → Click "service worker"

### Adding Support for New Sites

1. Add the site to `manifest.json` in `content_scripts.matches`
2. Add a new extractor function in `content/extractors.js`
3. Update the `detectProduct()` function to call your extractor

Example:
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

## Troubleshooting

### Extension icon shows no product detected

- Make sure you're on a product page (not search results)
- Check the browser console for errors
- Try refreshing the page

### Can't sign in

- Make sure you have an account on the Gift Tracker web app
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct in `popup/popup.js`

### Screenshot not capturing

- Screenshots require the `tabs` permission
- Make sure the tab is visible when you click save

## Future Enhancements

- [ ] Support for more e-commerce sites
- [ ] Bulk save from wishlist pages
- [ ] Price tracking alerts
- [ ] AI-powered gift suggestions based on browsing
