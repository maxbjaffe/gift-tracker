// Image Service - Fetches product images with multiple sources and fallbacks

const UNSPLASH_ACCESS_KEY = '9e0f4ca10c03e1b69cf570cf16be3af6b715559029bc6d46e50a3b89e0f28fd1';
const PEXELS_API_KEY = 'FXEWQGUMBPSL5KdwBubgdAejoGEh8v9ZwyJCSQEqA8ffnL84XeYuy2ri';

interface ImageResult {
  url: string;
  thumbnail: string;
  source: 'unsplash' | 'pexels' | 'placeholder';
}

/**
 * Fetch a product image from multiple sources with fallbacks
 * @param keywords - Search keywords (e.g., "wireless headphones", "lego set")
 * @param productName - Full product name for better placeholder
 */
export async function fetchProductImage(
  keywords: string,
  productName?: string
): Promise<ImageResult> {
  // Strategy 1: Try the full product name first (most specific)
  if (productName) {
    const productSearchTerm = extractProductSearchTerm(productName);

    try {
      const unsplashResult = await fetchFromUnsplash(productSearchTerm);
      if (unsplashResult) {
        return unsplashResult;
      }
    } catch (error) {
      console.error('Unsplash product name search failed:', error);
    }

    try {
      const pexelsResult = await fetchFromPexels(productSearchTerm);
      if (pexelsResult) {
        return pexelsResult;
      }
    } catch (error) {
      console.error('Pexels product name search failed:', error);
    }
  }

  // Strategy 2: Try the provided keywords (more generic but still specific)
  const cleanKeywords = cleanSearchKeywords(keywords);

  try {
    const unsplashResult = await fetchFromUnsplash(cleanKeywords);
    if (unsplashResult) {
      return unsplashResult;
    }
  } catch (error) {
    console.error('Unsplash keyword search failed:', error);
  }

  try {
    const pexelsResult = await fetchFromPexels(cleanKeywords);
    if (pexelsResult) {
      return pexelsResult;
    }
  } catch (error) {
    console.error('Pexels keyword search failed:', error);
  }

  // Return category-based placeholder as final fallback
  return getCategoryPlaceholder(keywords, productName);
}

/**
 * Extract the most searchable terms from a product name
 * Removes articles, focuses on key product identifiers
 */
function extractProductSearchTerm(productName: string): string {
  // Remove common articles and filler words
  let cleaned = productName
    .toLowerCase()
    .replace(/\b(the|a|an|for|with|and|or)\b/gi, '')
    .trim();

  // Try to keep brand names and model numbers
  // Split into words and take first 3-4 meaningful words
  const words = cleaned.split(/\s+/).filter(word => word.length > 2);
  const searchTerm = words.slice(0, 4).join(' ');

  return searchTerm || productName;
}

/**
 * Clean and optimize search keywords for better results
 */
function cleanSearchKeywords(keywords: string): string {
  // Remove price-related terms, brand names that might limit results
  const cleaned = keywords
    .toLowerCase()
    .replace(/\$[\d,.]+/g, '') // Remove prices
    .replace(/\b(under|over|between|cheap|expensive|premium|luxury)\b/gi, '') // Remove price descriptors
    .replace(/\b(new|latest|2023|2024|2025)\b/gi, '') // Remove year/new descriptors
    .trim();

  return cleaned;
}

/**
 * Fetch from Unsplash
 */
async function fetchFromUnsplash(keywords: string): Promise<ImageResult | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=5&orientation=squarish&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Pick the first result (most relevant) for better accuracy
      // Unsplash orders by relevance, so first result is usually best
      const image = data.results[0];

      return {
        url: image.urls.regular,
        thumbnail: image.urls.small,
        source: 'unsplash',
      };
    }

    return null;
  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return null;
  }
}

/**
 * Fetch from Pexels (backup source)
 */
async function fetchFromPexels(keywords: string): Promise<ImageResult | null> {
  // Skip if no API key configured
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_KEY_HERE') {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=5&orientation=square`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      // Use the first result (most relevant) for better accuracy
      const photo = data.photos[0];

      return {
        url: photo.src.large,
        thumbnail: photo.src.medium,
        source: 'pexels',
      };
    }

    return null;
  } catch (error) {
    console.error('Pexels fetch error:', error);
    return null;
  }
}

/**
 * Get a category-based placeholder image
 */
function getCategoryPlaceholder(keywords: string, productName?: string): ImageResult {
  const lowerKeywords = keywords.toLowerCase();

  // Map keywords to emoji-based placeholder categories
  const categoryMap: { [key: string]: string } = {
    'book': '📚',
    'electronics': '💻',
    'phone': '📱',
    'headphone': '🎧',
    'speaker': '🔊',
    'camera': '📷',
    'game': '🎮',
    'toy': '🧸',
    'clothes': '👕',
    'fashion': '👗',
    'shoe': '👟',
    'watch': '⌚',
    'jewelry': '💎',
    'food': '🍽️',
    'coffee': '☕',
    'drink': '🥤',
    'kitchen': '🍳',
    'home': '🏠',
    'furniture': '🛋️',
    'art': '🎨',
    'music': '🎵',
    'sport': '⚽',
    'fitness': '💪',
    'bike': '🚴',
    'car': '🚗',
    'travel': '✈️',
    'bag': '👜',
    'backpack': '🎒',
    'beauty': '💄',
    'pet': '🐾',
    'garden': '🌱',
    'tool': '🔧',
  };

  // Find matching category
  let emoji = '🎁'; // Default gift emoji
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerKeywords.includes(key)) {
      emoji = value;
      break;
    }
  }

  // Generate a placeholder using an external service
  const placeholderText = productName
    ? encodeURIComponent(productName.substring(0, 30))
    : encodeURIComponent('Gift Item');

  // Use a placeholder service with the emoji
  const url = `https://placehold.co/400x400/f3e8ff/9333ea?text=${emoji}+${placeholderText.replace(/%20/g, '+')}`;

  return {
    url,
    thumbnail: url,
    source: 'placeholder',
  };
}

/**
 * Batch fetch images for multiple items (more efficient)
 */
export async function fetchProductImages(
  items: Array<{ keywords: string; productName?: string }>
): Promise<ImageResult[]> {
  // Fetch all in parallel with a small delay to avoid rate limits
  const results = await Promise.all(
    items.map((item, index) =>
      new Promise<ImageResult>((resolve) => {
        // Stagger requests by 100ms to be nice to the API
        setTimeout(async () => {
          const result = await fetchProductImage(item.keywords, item.productName);
          resolve(result);
        }, index * 100);
      })
    )
  );

  return results;
}
