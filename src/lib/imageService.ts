// Image Service - Fetches real product images or uses category placeholders

interface ImageResult {
  url: string;
  thumbnail: string;
  source: 'product' | 'placeholder';
  isPlaceholder: boolean;
}

/**
 * Fetch a product image - returns category-based placeholder
 * Stock photo APIs don't provide accurate product images, so we use
 * clean, honest placeholders that match the product category
 *
 * @param keywords - Category or product type
 * @param productName - Full product name for placeholder text
 */
export async function fetchProductImage(
  keywords: string,
  productName?: string
): Promise<ImageResult> {
  // For now, we only use category placeholders
  // Stock photo services can't provide accurate product images
  return getCategoryPlaceholder(keywords, productName);
}

/**
 * Get a clean category-based placeholder image
 * These are honest placeholders, not pretending to be product photos
 */
function getCategoryPlaceholder(keywords: string, productName?: string): ImageResult {
  const lowerKeywords = keywords.toLowerCase();

  // Map keywords to category info
  const categoryMap: { [key: string]: { emoji: string; color: string; bgColor: string; label: string } } = {
    'book': { emoji: '📚', color: '8B4513', bgColor: 'FFF8DC', label: 'Books' },
    'electronics': { emoji: '💻', color: '4169E1', bgColor: 'E6F3FF', label: 'Electronics' },
    'phone': { emoji: '📱', color: '000000', bgColor: 'F0F0F0', label: 'Phone' },
    'headphone': { emoji: '🎧', color: '9333EA', bgColor: 'F3E8FF', label: 'Audio' },
    'speaker': { emoji: '🔊', color: '2563EB', bgColor: 'DBEAFE', label: 'Audio' },
    'camera': { emoji: '📷', color: '1F2937', bgColor: 'F3F4F6', label: 'Camera' },
    'game': { emoji: '🎮', color: 'DC2626', bgColor: 'FEE2E2', label: 'Gaming' },
    'toy': { emoji: '🧸', color: 'F59E0B', bgColor: 'FEF3C7', label: 'Toys' },
    'clothes': { emoji: '👕', color: '7C3AED', bgColor: 'EDE9FE', label: 'Clothing' },
    'fashion': { emoji: '👗', color: 'EC4899', bgColor: 'FCE7F3', label: 'Fashion' },
    'shoe': { emoji: '👟', color: '059669', bgColor: 'D1FAE5', label: 'Shoes' },
    'watch': { emoji: '⌚', color: '374151', bgColor: 'F9FAFB', label: 'Watch' },
    'jewelry': { emoji: '💎', color: '7C3AED', bgColor: 'F5F3FF', label: 'Jewelry' },
    'food': { emoji: '🍽️', color: 'EF4444', bgColor: 'FEE2E2', label: 'Food' },
    'coffee': { emoji: '☕', color: '92400E', bgColor: 'FEF3C7', label: 'Coffee' },
    'drink': { emoji: '🥤', color: 'DC2626', bgColor: 'FECACA', label: 'Drinks' },
    'kitchen': { emoji: '🍳', color: 'B45309', bgColor: 'FED7AA', label: 'Kitchen' },
    'home': { emoji: '🏠', color: '0891B2', bgColor: 'CFFAFE', label: 'Home' },
    'furniture': { emoji: '🛋️', color: '78350F', bgColor: 'FED7AA', label: 'Furniture' },
    'art': { emoji: '🎨', color: 'EC4899', bgColor: 'FBCFE8', label: 'Art' },
    'music': { emoji: '🎵', color: '7C3AED', bgColor: 'EDE9FE', label: 'Music' },
    'sport': { emoji: '⚽', color: '059669', bgColor: 'D1FAE5', label: 'Sports' },
    'fitness': { emoji: '💪', color: 'DC2626', bgColor: 'FEE2E2', label: 'Fitness' },
    'bike': { emoji: '🚴', color: '2563EB', bgColor: 'DBEAFE', label: 'Cycling' },
    'car': { emoji: '🚗', color: '1F2937', bgColor: 'E5E7EB', label: 'Automotive' },
    'travel': { emoji: '✈️', color: '0891B2', bgColor: 'CFFAFE', label: 'Travel' },
    'bag': { emoji: '👜', color: '92400E', bgColor: 'FDE68A', label: 'Bags' },
    'backpack': { emoji: '🎒', color: '0F766E', bgColor: 'CCFBF1', label: 'Backpacks' },
    'beauty': { emoji: '💄', color: 'EC4899', bgColor: 'FCE7F3', label: 'Beauty' },
    'pet': { emoji: '🐾', color: 'F59E0B', bgColor: 'FEF3C7', label: 'Pets' },
    'garden': { emoji: '🌱', color: '16A34A', bgColor: 'DCFCE7', label: 'Garden' },
    'tool': { emoji: '🔧', color: '6B7280', bgColor: 'F3F4F6', label: 'Tools' },
  };

  // Find matching category
  let categoryInfo = { emoji: '🎁', color: '9333EA', bgColor: 'F3E8FF', label: 'Gift' };
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerKeywords.includes(key)) {
      categoryInfo = value;
      break;
    }
  }

  // Create a clean, minimal placeholder
  // Format: emoji + category label (no product name to avoid confusion)
  const url = `https://placehold.co/400x400/${categoryInfo.bgColor}/${categoryInfo.color}?text=${categoryInfo.emoji}%0A${encodeURIComponent(categoryInfo.label)}&font=montserrat`;

  return {
    url,
    thumbnail: url,
    source: 'placeholder',
    isPlaceholder: true,
  };
}

/**
 * Batch fetch images for multiple items
 * Since we only use placeholders now, this is instant
 */
export async function fetchProductImages(
  items: Array<{ keywords: string; productName?: string }>
): Promise<ImageResult[]> {
  return items.map((item) => getCategoryPlaceholder(item.keywords, item.productName));
}
