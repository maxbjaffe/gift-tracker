// Enhanced Image Service - Fetches real product images via OpenGraph, Brave Search, or uses premium placeholders
import { logger } from '@/lib/logger';
import { searchProductImages } from '@/lib/image-enrichment/extractor';

interface ImageResult {
  url: string;
  thumbnail: string;
  source: 'opengraph' | 'search' | 'placeholder';
  isPlaceholder: boolean;
}

/**
 * Extract OpenGraph image from a URL
 * This fetches the actual product page and extracts the og:image meta tag
 */
async function extractOpenGraphImage(url: string): Promise<string | null> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const html = await response.text();

      // Try multiple meta tag patterns
      const patterns = [
        /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
        /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
        /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
        /<meta\s+itemprop=["']image["']\s+content=["']([^"']+)["']/i,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          let imageUrl = match[1];

          // Handle relative URLs
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            const urlObj = new URL(url);
            imageUrl = urlObj.origin + imageUrl;
          }

          return imageUrl;
        }
      }

      return null;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    // Don't log timeout errors - they're expected
    if ((error as Error).name !== 'AbortError') {
      logger.error('Error extracting OpenGraph image:', error);
    }
    return null;
  }
}

/**
 * Get an enhanced placeholder image with better visuals
 * Uses inline SVG data URLs for reliability - no external dependencies
 */
function getEnhancedPlaceholder(keywords: string, productName?: string): ImageResult {
  const lowerKeywords = keywords.toLowerCase();

  // Map keywords to category with modern color schemes
  const categoryMap: { [key: string]: { icon: string; color1: string; color2: string; name: string } } = {
    'book': { icon: '📖', color1: '#e0c3fc', color2: '#8ec5fc', name: 'Books' },
    'electronics': { icon: '⚡', color1: '#a8edea', color2: '#fed6e3', name: 'Electronics' },
    'phone': { icon: '📱', color1: '#d299c2', color2: '#fef9d7', name: 'Phone' },
    'headphone': { icon: '🎧', color1: '#f5f7fa', color2: '#c3cfe2', name: 'Audio' },
    'speaker': { icon: '🔊', color1: '#fbc2eb', color2: '#a6c1ee', name: 'Speaker' },
    'camera': { icon: '📷', color1: '#ffecd2', color2: '#fcb69f', name: 'Camera' },
    'game': { icon: '🎮', color1: '#ff9a9e', color2: '#fecfef', name: 'Gaming' },
    'gaming': { icon: '🎮', color1: '#ff9a9e', color2: '#fecfef', name: 'Gaming' },
    'toy': { icon: '🧸', color1: '#ffeaa7', color2: '#fdcb6e', name: 'Toys' },
    'clothes': { icon: '👕', color1: '#e0c3fc', color2: '#8ec5fc', name: 'Clothing' },
    'clothing': { icon: '👕', color1: '#e0c3fc', color2: '#8ec5fc', name: 'Clothing' },
    'fashion': { icon: '✨', color1: '#fccb90', color2: '#d57eeb', name: 'Fashion' },
    'shoe': { icon: '👟', color1: '#a8edea', color2: '#fed6e3', name: 'Shoes' },
    'watch': { icon: '⌚', color1: '#cfd9df', color2: '#e2ebf0', name: 'Watches' },
    'jewelry': { icon: '💎', color1: '#fbc2eb', color2: '#a6c1ee', name: 'Jewelry' },
    'food': { icon: '🍽️', color1: '#ffecd2', color2: '#fcb69f', name: 'Food' },
    'coffee': { icon: '☕', color1: '#f5e3ce', color2: '#d7b899', name: 'Coffee' },
    'drink': { icon: '🥤', color1: '#fbc2eb', color2: '#a6c1ee', name: 'Drinks' },
    'kitchen': { icon: '🍳', color1: '#ffeaa7', color2: '#fdcb6e', name: 'Kitchen' },
    'home': { icon: '🏠', color1: '#d299c2', color2: '#fef9d7', name: 'Home' },
    'furniture': { icon: '🛋️', color1: '#f5e3ce', color2: '#d7b899', name: 'Furniture' },
    'art': { icon: '🎨', color1: '#fccb90', color2: '#d57eeb', name: 'Art' },
    'music': { icon: '🎵', color1: '#a8edea', color2: '#fed6e3', name: 'Music' },
    'sport': { icon: '⚽', color1: '#a8edea', color2: '#fed6e3', name: 'Sports' },
    'sports': { icon: '⚽', color1: '#a8edea', color2: '#fed6e3', name: 'Sports' },
    'fitness': { icon: '💪', color1: '#ff9a9e', color2: '#fecfef', name: 'Fitness' },
    'bike': { icon: '🚴', color1: '#a8edea', color2: '#fed6e3', name: 'Cycling' },
    'car': { icon: '🚗', color1: '#cfd9df', color2: '#e2ebf0', name: 'Auto' },
    'automotive': { icon: '🚗', color1: '#cfd9df', color2: '#e2ebf0', name: 'Auto' },
    'travel': { icon: '✈️', color1: '#a8edea', color2: '#fed6e3', name: 'Travel' },
    'bag': { icon: '👜', color1: '#fccb90', color2: '#d57eeb', name: 'Bags' },
    'backpack': { icon: '🎒', color1: '#e0c3fc', color2: '#8ec5fc', name: 'Backpacks' },
    'beauty': { icon: '💄', color1: '#fbc2eb', color2: '#a6c1ee', name: 'Beauty' },
    'pet': { icon: '🐾', color1: '#ffeaa7', color2: '#fdcb6e', name: 'Pets' },
    'garden': { icon: '🌱', color1: '#d4fc79', color2: '#96e6a1', name: 'Garden' },
    'tool': { icon: '🔧', color1: '#cfd9df', color2: '#e2ebf0', name: 'Tools' },
  };

  // Find matching category
  let categoryInfo = { icon: '🎁', color1: '#fccb90', color2: '#d57eeb', name: 'Gift' };
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerKeywords.includes(key)) {
      categoryInfo = value;
      break;
    }
  }

  // Create enhanced placeholder with gradient background using inline SVG
  const displayText = productName
    ? productName.substring(0, 30) // Truncate long names
    : categoryInfo.name;

  // Generate inline SVG with gradient and text
  // Use URL encoding instead of base64 to avoid emoji encoding issues
  const svg = `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${categoryInfo.color1};stop-opacity:1"/><stop offset="100%" style="stop-color:${categoryInfo.color2};stop-opacity:1"/></linearGradient></defs><rect width="600" height="400" fill="url(#grad)"/><text x="50%" y="40%" font-family="Arial,sans-serif" font-size="80" text-anchor="middle" fill="#000" opacity="0.2">${categoryInfo.icon}</text><text x="50%" y="65%" font-family="Arial,sans-serif" font-size="24" font-weight="600" text-anchor="middle" fill="#000" opacity="0.7">${displayText.replace(/[<>&'"]/g, '')}</text></svg>`;

  const svgThumb = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${categoryInfo.color1};stop-opacity:1"/><stop offset="100%" style="stop-color:${categoryInfo.color2};stop-opacity:1"/></linearGradient></defs><rect width="300" height="200" fill="url(#grad)"/><text x="50%" y="40%" font-family="Arial,sans-serif" font-size="50" text-anchor="middle" fill="#000" opacity="0.2">${categoryInfo.icon}</text><text x="50%" y="70%" font-family="Arial,sans-serif" font-size="16" font-weight="600" text-anchor="middle" fill="#000" opacity="0.7">${displayText.substring(0, 20).replace(/[<>&'"]/g, '')}</text></svg>`;

  // Use URL encoding instead of base64 for better emoji support
  const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  const thumbnail = `data:image/svg+xml,${encodeURIComponent(svgThumb)}`;

  return {
    url,
    thumbnail,
    source: 'placeholder',
    isPlaceholder: true,
  };
}

/**
 * Fetch a product image - tries OpenGraph first, falls back to enhanced placeholder
 *
 * @param keywords - Category or product type for placeholder fallback
 * @param productName - Full product name for placeholder text
 * @param productUrl - Optional URL to extract OpenGraph image from
 */
export async function fetchProductImage(
  keywords: string,
  productName?: string,
  productUrl?: string
): Promise<ImageResult> {
  // Tier 1: Try to extract real product image from URL (if provided)
  if (productUrl) {
    try {
      const imageUrl = await extractOpenGraphImage(productUrl);
      if (imageUrl) {
        return {
          url: imageUrl,
          thumbnail: imageUrl,
          source: 'opengraph',
          isPlaceholder: false,
        };
      }
    } catch (error) {
      logger.error('OpenGraph extraction failed:', error);
    }
  }

  // Tier 2: Brave Image Search by product name
  if (productName) {
    try {
      const searchResults = await searchProductImages(productName);
      if (searchResults.length > 0) {
        return {
          url: searchResults[0].url,
          thumbnail: searchResults[0].url,
          source: 'search',
          isPlaceholder: false,
        };
      }
    } catch (error) {
      logger.error('Brave Image Search failed:', error);
    }
  }

  // Tier 3: Enhanced SVG placeholder (100% reliable, no external dependencies)
  return getEnhancedPlaceholder(keywords, productName);
}

/**
 * Batch fetch images for multiple items
 * Processes in parallel for better performance
 */
export async function fetchProductImages(
  items: Array<{ keywords: string; productName?: string; productUrl?: string }>
): Promise<ImageResult[]> {
  return Promise.all(
    items.map((item) =>
      fetchProductImage(item.keywords, item.productName, item.productUrl)
    )
  );
}
