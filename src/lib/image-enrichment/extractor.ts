/**
 * Image extraction from product pages and Google Custom Search.
 *
 * Tier 1: Parse JSON-LD, og:image, meta tags from product URL HTML.
 * Tier 2: Google Custom Search Images API for product name queries.
 */

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FETCH_HEADERS = {
  'User-Agent': USER_AGENT,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  DNT: '1',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

export interface ExtractedImage {
  url: string;
  source: 'jsonld' | 'meta' | 'search';
}

// ---------------------------------------------------------------------------
// Tier 1: HTML-based extraction
// ---------------------------------------------------------------------------

export async function extractImagesFromUrl(
  productUrl: string
): Promise<ExtractedImage[]> {
  let html: string;
  try {
    const res = await fetch(productUrl, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    html = await res.text();
  } catch {
    return [];
  }

  const images: ExtractedImage[] = [];
  const seen = new Set<string>();

  const add = (rawUrl: string | undefined | null, source: ExtractedImage['source']) => {
    if (!rawUrl) return;
    const resolved = resolveUrl(rawUrl, productUrl);
    if (!resolved) return;
    const normalized = normalizeImageUrl(resolved);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    images.push({ url: normalized, source });
  };

  // 1. JSON-LD Product images
  const jsonLdImages = parseJsonLdImages(html);
  for (const url of jsonLdImages) {
    add(url, 'jsonld');
  }

  // 2. og:image / twitter:image meta tags
  const metaImages = parseMetaImages(html);
  for (const url of metaImages) {
    add(url, 'meta');
  }

  return images.slice(0, 8);
}

function parseJsonLdImages(html: string): string[] {
  const images: string[] = [];
  // Match all JSON-LD script blocks
  const regex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      extractProductImages(data, images);
    } catch {
      // Malformed JSON-LD — skip
    }
  }
  return images;
}

function extractProductImages(data: any, images: string[]): void {
  if (!data) return;

  // Handle arrays (some sites wrap in arrays)
  if (Array.isArray(data)) {
    for (const item of data) {
      extractProductImages(item, images);
    }
    return;
  }

  // Check if this is a Product or has @graph
  if (data['@graph']) {
    extractProductImages(data['@graph'], images);
    return;
  }

  const type = data['@type'];
  const isProduct =
    type === 'Product' ||
    (Array.isArray(type) && type.includes('Product'));

  if (isProduct && data.image) {
    const img = data.image;
    if (typeof img === 'string') {
      images.push(img);
    } else if (Array.isArray(img)) {
      for (const item of img) {
        if (typeof item === 'string') images.push(item);
        else if (item?.url) images.push(item.url);
        else if (item?.contentUrl) images.push(item.contentUrl);
      }
    } else if (img?.url) {
      images.push(img.url);
    } else if (img?.contentUrl) {
      images.push(img.contentUrl);
    }
  }
}

function parseMetaImages(html: string): string[] {
  const images: string[] = [];
  const patterns = [
    /property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["']/gi,
    /content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["']/gi,
    /name\s*=\s*["']twitter:image["'][^>]*content\s*=\s*["']([^"']+)["']/gi,
    /content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']twitter:image["']/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) images.push(match[1]);
    }
  }
  return images;
}

function resolveUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    return new URL(rawUrl, baseUrl).href;
  } catch {
    return null;
  }
}

function normalizeImageUrl(url: string): string {
  // Amazon: strip sizing params to get full-res
  // e.g. ._SL160_ → ._SL1500_  or just remove the sizing suffix
  if (url.includes('media-amazon.com')) {
    url = url.replace(/\._[A-Z]{2}\d+_\./, '.');
  }
  return url;
}

// ---------------------------------------------------------------------------
// Tier 2: Brave Image Search API
// ---------------------------------------------------------------------------

export async function searchProductImages(
  productName: string,
  excludeUrls: Set<string> = new Set()
): Promise<ExtractedImage[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    console.warn('[ImageEnrichment] Brave Search API not configured — skipping search');
    return [];
  }

  const query = `${productName} product`;
  const params = new URLSearchParams({
    q: query,
    country: 'US',
    count: '8',
    safesearch: 'strict',
  });

  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/images/search?${params}`,
      {
        headers: { 'X-Subscription-Token': apiKey },
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) {
      console.error('[ImageEnrichment] Brave Search error:', res.status);
      return [];
    }

    const data = await res.json();
    const results: any[] = data.results || [];
    const images: ExtractedImage[] = [];

    for (const item of results) {
      // Use the original source URL from properties, not the Brave proxy thumbnail
      const url: string = item.properties?.url || item.thumbnail?.src;
      if (!url || excludeUrls.has(url)) continue;
      images.push({ url, source: 'search' });
      if (images.length >= 5) break;
    }

    return images;
  } catch (err) {
    console.error('[ImageEnrichment] Brave Search fetch failed:', err);
    return [];
  }
}
