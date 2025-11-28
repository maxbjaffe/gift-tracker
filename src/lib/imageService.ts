// Enhanced Image Service - Fetches real product images via OpenGraph or uses premium placeholders
import { logger } from '@/lib/logger';

interface ImageResult {
  url: string;
  thumbnail: string;
  source: 'opengraph' | 'placeholder';
  isPlaceholder: boolean;
}

/**
 * Extract OpenGraph image from a URL
 * This fetches the actual product page and extracts the og:image meta tag
 */
async function extractOpenGraphImage(url: string): Promise<string | null> {
  try {
    // Use a CORS proxy or server-side fetch to avoid CORS issues
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

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
  } catch (error) {
    logger.error('Error extracting OpenGraph image:', error);
    return null;
  }
}

/**
 * Get an enhanced placeholder image with better visuals
 * Uses gradient backgrounds and clean typography instead of emojis
 */
function getEnhancedPlaceholder(keywords: string, productName?: string): ImageResult {
  const lowerKeywords = keywords.toLowerCase();

  // Map keywords to category with modern color schemes
  const categoryMap: { [key: string]: { icon: string; gradient: string; name: string } } = {
    'book': { icon: '📖', gradient: 'e0c3fc-8ec5fc', name: 'Books' },
    'electronics': { icon: '⚡', gradient: 'a8edea-fed6e3', name: 'Electronics' },
    'phone': { icon: '📱', gradient: 'd299c2-fef9d7', name: 'Phone' },
    'headphone': { icon: '🎧', gradient: 'f5f7fa-c3cfe2', name: 'Audio' },
    'speaker': { icon: '🔊', gradient: 'fbc2eb-a6c1ee', name: 'Speaker' },
    'camera': { icon: '📷', gradient: 'ffecd2-fcb69f', name: 'Camera' },
    'game': { icon: '🎮', gradient: 'ff9a9e-fecfef', name: 'Gaming' },
    'gaming': { icon: '🎮', gradient: 'ff9a9e-fecfef', name: 'Gaming' },
    'toy': { icon: '🧸', gradient: 'ffeaa7-fdcb6e', name: 'Toys' },
    'clothes': { icon: '👕', gradient: 'e0c3fc-8ec5fc', name: 'Clothing' },
    'clothing': { icon: '👕', gradient: 'e0c3fc-8ec5fc', name: 'Clothing' },
    'fashion': { icon: '✨', gradient: 'fccb90-d57eeb', name: 'Fashion' },
    'shoe': { icon: '👟', gradient: 'a8edea-fed6e3', name: 'Shoes' },
    'watch': { icon: '⌚', gradient: 'cfd9df-e2ebf0', name: 'Watches' },
    'jewelry': { icon: '💎', gradient: 'fbc2eb-a6c1ee', name: 'Jewelry' },
    'food': { icon: '🍽️', gradient: 'ffecd2-fcb69f', name: 'Food' },
    'coffee': { icon: '☕', gradient: 'f5e3ce-d7b899', name: 'Coffee' },
    'drink': { icon: '🥤', gradient: 'fbc2eb-a6c1ee', name: 'Drinks' },
    'kitchen': { icon: '🍳', gradient: 'ffeaa7-fdcb6e', name: 'Kitchen' },
    'home': { icon: '🏠', gradient: 'd299c2-fef9d7', name: 'Home' },
    'furniture': { icon: '🛋️', gradient: 'f5e3ce-d7b899', name: 'Furniture' },
    'art': { icon: '🎨', gradient: 'fccb90-d57eeb', name: 'Art' },
    'music': { icon: '🎵', gradient: 'a8edea-fed6e3', name: 'Music' },
    'sport': { icon: '⚽', gradient: 'a8edea-fed6e3', name: 'Sports' },
    'sports': { icon: '⚽', gradient: 'a8edea-fed6e3', name: 'Sports' },
    'fitness': { icon: '💪', gradient: 'ff9a9e-fecfef', name: 'Fitness' },
    'bike': { icon: '🚴', gradient: 'a8edea-fed6e3', name: 'Cycling' },
    'car': { icon: '🚗', gradient: 'cfd9df-e2ebf0', name: 'Auto' },
    'automotive': { icon: '🚗', gradient: 'cfd9df-e2ebf0', name: 'Auto' },
    'travel': { icon: '✈️', gradient: 'a8edea-fed6e3', name: 'Travel' },
    'bag': { icon: '👜', gradient: 'fccb90-d57eeb', name: 'Bags' },
    'backpack': { icon: '🎒', gradient: 'e0c3fc-8ec5fc', name: 'Backpacks' },
    'beauty': { icon: '💄', gradient: 'fbc2eb-a6c1ee', name: 'Beauty' },
    'pet': { icon: '🐾', gradient: 'ffeaa7-fdcb6e', name: 'Pets' },
    'garden': { icon: '🌱', gradient: 'd4fc79-96e6a1', name: 'Garden' },
    'tool': { icon: '🔧', gradient: 'cfd9df-e2ebf0', name: 'Tools' },
  };

  // Find matching category
  let categoryInfo = { icon: '🎁', gradient: 'fccb90-d57eeb', name: 'Gift' };
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerKeywords.includes(key)) {
      categoryInfo = value;
      break;
    }
  }

  // Create enhanced placeholder with gradient background
  // Using placehold.co which supports gradients and custom fonts
  const displayText = productName
    ? productName.substring(0, 30) // Truncate long names
    : categoryInfo.name;

  // Use placehold.co for reliable placeholder images
  // Format: https://placehold.co/600x400/gradient-color/text-color?text=Your+Text
  const gradientColors = categoryInfo.gradient.replace('-', '/');
  const textEncoded = encodeURIComponent(`${categoryInfo.icon} ${displayText}`);
  const url = `https://placehold.co/600x400/${gradientColors}/000?text=${textEncoded}&font=raleway`;
  const thumbnail = `https://placehold.co/300x200/${gradientColors}/000?text=${textEncoded}&font=raleway`;

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
  // NOTE: OpenGraph extraction disabled in production due to CORS/timeout issues
  // Chrome extension will provide real images when users add products
  // For AI recommendations, we use high-quality placeholders

  // Always use enhanced placeholder for now
  // Real images come from Chrome extension when users add gifts manually
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
