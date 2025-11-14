// Image Service - Fetches product images with multiple sources and fallbacks

const UNSPLASH_ACCESS_KEY = '9e0f4ca10c03e1b69cf570cf16be3af6b715559029bc6d46e50a3b89e0f28fd1';
const PEXELS_API_KEY = 'YOUR_PEXELS_KEY_HERE'; // Free at https://www.pexels.com/api/

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
  // Clean up keywords for better search results
  const cleanKeywords = cleanSearchKeywords(keywords);

  // Try Unsplash first (high quality, free)
  try {
    const unsplashResult = await fetchFromUnsplash(cleanKeywords);
    if (unsplashResult) {
      return unsplashResult;
    }
  } catch (error) {
    console.error('Unsplash fetch failed:', error);
  }

  // Try Pexels as backup (also free, different library)
  try {
    const pexelsResult = await fetchFromPexels(cleanKeywords);
    if (pexelsResult) {
      return pexelsResult;
    }
  } catch (error) {
    console.error('Pexels fetch failed:', error);
  }

  // Return category-based placeholder as final fallback
  return getCategoryPlaceholder(keywords, productName);
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
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=3&orientation=squarish&content_filter=high`,
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
      // Pick a random image from top 3 for variety
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 3));
      const image = data.results[randomIndex];

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
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=3&orientation=square`,
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
      const randomIndex = Math.floor(Math.random() * Math.min(data.photos.length, 3));
      const photo = data.photos[randomIndex];

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
