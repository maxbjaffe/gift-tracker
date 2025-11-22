# GiftStash Logo & Image Specifications

Complete specifications for all logo variations, sizes, and use cases across the GiftStash platform.

---

## 🎨 Brand Colors

Use these exact colors for all logo variations:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Primary Orange** | `#F57F20` | Main brand color, "Gift" text |
| **Orange Light** | `#FF9A4D` | Hover states, accents |
| **Primary Blue** | `#2E7BB4` | Secondary brand color, "Stash" text |
| **Blue Light** | `#4A9FD8` | Hover states, accents |
| **Accent Green** | `#5CB85C` | Success states, progress |

---

## 📐 Logo Variations Needed

### 1. **Icon Only** - `GiftStashIconGSv2.png`

**Purpose:** App icons, favicons, small spaces
**Design:** Gift box icon with "GS" monogram
**Recommended Sizes:**
- `16x16px` - Browser favicon, smallest size
- `32x32px` - Standard favicon
- `48x48px` - Chrome extension small icon
- `64x64px` - Medium displays
- `128x128px` - Chrome extension, app launchers
- `192x192px` - PWA icon (mobile home screen)
- `512x512px` - PWA icon (high-res displays)
- `1024x1024px` - Master file for all derivatives

**Technical Specs:**
- **Format:** PNG with transparent background
- **Aspect Ratio:** 1:1 (perfect square)
- **Colors:** Orange and blue gradient or solid orange
- **Padding:** 10% internal padding from edges
- **Export Settings:** PNG-24, transparent background

**Design Notes:**
- Should be recognizable at 16px
- Clear, simple shapes
- No thin lines (min 2px stroke weight at 128px)
- Centered composition

**Current Usage:**
- `/src/app/icon.png` (64x64px recommended)
- `/src/app/apple-icon.png` (180x180px recommended)
- `/extension/assets/icon-16.png`
- `/extension/assets/icon-48.png`
- `/extension/assets/icon-128.png`
- Dashboard hero (48x48px displayed)
- Header logo (40x40px displayed)
- Footer logo (48x48px displayed)

---

### 2. **Full Horizontal Logo** - `GiftStashFullLogoV2.png`

**Purpose:** Main branding, headers, landing pages
**Design:** Icon + "GiftStash" wordmark horizontal layout
**Recommended Sizes:**
- `300x80px` - Small header (mobile)
- `400x107px` - Standard header
- `600x160px` - Large header, hero sections
- `800x213px` - High-res displays
- `1200x320px` - Master file

**Technical Specs:**
- **Format:** PNG with transparent background
- **Aspect Ratio:** ~3.75:1 (width to height)
- **Layout:** Icon on left, wordmark on right
- **Spacing:** Icon width = 0.8x height, 0.2x spacing, text = 2.2x height
- **Colors:**
  - Icon: Orange and blue
  - "Gift": Orange (#F57F20)
  - "Stash": Blue (#2E7BB4)

**Design Notes:**
- Icon should be vertically centered with text baseline
- Text should use clean, modern sans-serif font (Inter, Poppins, or similar)
- Bold weight for "Gift", Semi-bold for "Stash"
- Maintain readability at small sizes

**Current Usage:**
- Landing page hero image (800x500px area)
- Chrome extension sign-in view
- Email headers
- Social media cover images

---

### 3. **Wordmark Only** - `GiftStashNamev2.png`

**Purpose:** When icon is shown separately, minimal branding
**Design:** "GiftStash" text only, no icon
**Recommended Sizes:**
- `200x40px` - Small inline use
- `300x60px` - Standard size
- `400x80px` - Large displays
- `600x120px` - Master file

**Technical Specs:**
- **Format:** PNG with transparent background
- **Aspect Ratio:** ~5:1 (width to height)
- **Colors:**
  - "Gift": Orange (#F57F20)
  - "Stash": Blue (#2E7BB4)
- **Typography:** Bold/Semi-bold, clean sans-serif

**Design Notes:**
- Can be used alongside icon when space constrained
- Should maintain color contrast on white background
- Legible at 200px width minimum

**Current Usage:**
- Header next to icon (Family Hub layout)
- Email signatures
- Inline references

---

### 4. **Stacked Logo** - `GiftStashImagev2.png`

**Purpose:** Square social media profile pictures, app store
**Design:** Icon on top, wordmark below, centered
**Recommended Sizes:**
- `400x400px` - Social media profile
- `512x512px` - App store icon
- `1024x1024px` - High-res social, master file

**Technical Specs:**
- **Format:** PNG with transparent background
- **Aspect Ratio:** 1:1 (perfect square)
- **Layout:**
  - Top 60%: Icon (with padding)
  - Bottom 40%: Wordmark
  - 5% padding all around
- **Colors:** Same as full logo

**Design Notes:**
- Icon and text should be visually balanced
- Works well as profile picture
- Recognizable when shown small (64px)

**Current Usage:**
- Social media profiles (Twitter, Facebook, LinkedIn)
- App store listings
- Square promotional graphics

---

### 5. **Short Logo** - `GiftStashShortLogo.png`

**Purpose:** Compact header version, mobile displays
**Design:** Simplified icon + "GS" or minimal text
**Recommended Size:**
- `100x40px` - Compact header
- `150x60px` - Standard
- `200x80px` - Master file

**Technical Specs:**
- **Format:** PNG with transparent background
- **Aspect Ratio:** ~2.5:1
- **Design:** Icon with abbreviated text or just initials

**Current Usage:**
- Mobile header (collapsed state)
- Compact notification badges

---

## 🖼️ Additional Graphics Needed

### 6. **Open Graph Image** - `opengraph-image.png`

**Purpose:** Social media link previews
**Recommended Size:** `1200x630px` (Facebook/LinkedIn standard)
**Alternative Size:** `1200x600px` (Twitter)

**Technical Specs:**
- **Format:** PNG or JPG
- **Aspect Ratio:** ~1.91:1
- **Layout:**
  - Centered full horizontal logo
  - Tagline below: "Never forget a gift idea again"
  - Subtle gradient background (orange-50 to blue-50)
- **Text:** Large, readable at thumbnail size
- **Safe Area:** Keep important content 20% from edges

**Current Usage:**
- `/src/app/opengraph-image.png`
- Social media link sharing

---

### 7. **Hero/Banner Image** - For landing page

**Purpose:** Large hero section background
**Recommended Size:** `1920x1080px`
**Alternative Sizes:** `2560x1440px` (high-res)

**Design Ideas:**
- Subtle gift box illustrations
- Gradient background with floating gift icons
- Abstract pattern related to gift-giving
- Should not overpower text overlay

---

## 📱 Chrome Extension Specific

### Extension Icons (Required by Chrome)

All must be PNG with transparent background:

| Size | Filename | Usage |
|------|----------|-------|
| `16x16px` | `icon-16.png` | Extension toolbar icon |
| `48x48px` | `icon-48.png` | Extensions page |
| `128x128px` | `icon-128.png` | Chrome Web Store, installation |

**Design:** Use Icon Only variation (GiftStashIconGSv2)

### Extension Popup Graphics

| Asset | Size | Usage |
|-------|------|-------|
| Full Logo | `300x80px` | Sign-in screen header |
| Icon | `48x48px` | Product detected view |
| Icon Small | `32x32px` | Compact header |

---

## 🎯 Current Issues to Fix

Based on your feedback that "it isn't a good look":

### Problems Identified:

1. **File sizes too large** (4-5 MB PNGs)
   - Need optimized web versions
   - Current files are likely uncompressed or have unnecessary data

2. **Inconsistent sizing**
   - Some images displayed much smaller than source
   - Need proper dimensions for each use case

3. **Missing optimized versions**
   - Need multiple size exports for each variation
   - Need @2x and @3x for Retina displays

4. **Possible quality issues**
   - Images might be pixelated when scaled
   - Transparent backgrounds might have artifacts

---

## ✅ Recommended Action Plan

### Step 1: Create Master Files (Vector if possible)

Ideally in SVG or high-res PNG:
- Icon only: 1024x1024px
- Full horizontal logo: 1200x320px
- Stacked logo: 1024x1024px
- Wordmark: 600x120px

### Step 2: Export Optimized Versions

For each variation, export:
- Standard resolution (1x)
- Retina resolution (2x)
- High-res displays (3x for mobile)

### Step 3: Optimize File Sizes

Use tools like:
- **TinyPNG** (tinypng.com) - Compress PNGs without quality loss
- **Squoosh** (squoosh.app) - Web-based image optimizer
- **ImageOptim** (Mac) - Batch optimization

Target file sizes:
- Icons (16-128px): < 10 KB each
- Small logos (200-400px): < 50 KB
- Large logos (600-1200px): < 200 KB

### Step 4: Replace Current Files

Update all image references with optimized versions in proper sizes.

---

## 📋 File Naming Convention

Use this naming pattern:

```
GiftStash[Variant][Size][@Retina][Version].png

Examples:
- GiftStashIcon-16.png          (Icon, 16x16)
- GiftStashIcon-48@2x.png        (Icon, 96x96 for Retina)
- GiftStashFull-400.png          (Full logo, 400px wide)
- GiftStashFull-800@2x.png       (Full logo, 800px for Retina)
- GiftStashStack-512.png         (Stacked, 512x512)
```

---

## 🎨 Design Tool Recommendations

### For Creating Logos:

**Vector (Recommended):**
- Figma (free, web-based)
- Adobe Illustrator
- Inkscape (free, open-source)

**Raster:**
- Canva (templates available)
- Photoshop
- GIMP (free)

### For Optimization:

- TinyPNG.com (online, free)
- Squoosh.app (online, free)
- ImageOptim (Mac, free)
- SVGO (for SVG optimization)

---

## 📝 Quality Checklist

Before finalizing any logo:

- [ ] Looks sharp at smallest size (16px)
- [ ] Readable/recognizable at thumbnail (48px)
- [ ] Colors match brand exactly
- [ ] Transparent background with no artifacts
- [ ] No thin lines < 2px at display size
- [ ] File size optimized for web
- [ ] Exported at correct dimensions
- [ ] Tested on white and colored backgrounds
- [ ] Works in dark mode (if applicable)
- [ ] Retina versions created (@2x, @3x)

---

## 🔄 Quick Reference

**Where each logo is used:**

| Location | Logo Variant | Display Size | File Needed |
|----------|-------------|--------------|-------------|
| Browser tab | Icon | 16x16, 32x32 | Icon 16-32px |
| Landing header | Full horizontal | 40x40 icon + text | Full 400px |
| Dashboard hero | Icon | 48x48 | Icon 48-64px |
| Extension toolbar | Icon | 16x16 | Icon 16px |
| Extension popup | Full horizontal | 300x80 | Full 300-400px |
| Social share | Open Graph | 1200x630 | OG image |
| App icon (iOS) | Icon | 180x180 | Icon 192-512px |
| Chrome store | Icon | 128x128 | Icon 128px |

---

**Last Updated:** January 2025
**Version:** 1.0
