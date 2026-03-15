// Product data extractors for different e-commerce sites

/**
 * Extract product data from Amazon
 */
function extractAmazonProduct() {
  // Check if we're on a product page
  const productTitle = document.querySelector('#productTitle, h1.a-size-large');
  if (!productTitle) return null;

  // Extract price - Amazon has many price formats
  let price = null;
  const priceWhole = document.querySelector('.a-price .a-price-whole');
  const priceFraction = document.querySelector('.a-price .a-price-fraction');

  if (priceWhole) {
    const whole = priceWhole.textContent.replace(/[^0-9]/g, '');
    const fraction = priceFraction ? priceFraction.textContent.replace(/[^0-9]/g, '') : '00';
    price = parseFloat(`${whole}.${fraction}`);
  } else {
    // Try other price selectors
    const priceElement = document.querySelector(
      '.a-price-whole, .a-offscreen, [data-a-color="price"]'
    );
    if (priceElement) {
      const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
      price = parseFloat(priceText) || null;
    }
  }

  // Extract main product image
  let image = null;
  const mainImage = document.querySelector('#landingImage, #imgBlkFront, .a-dynamic-image');
  if (mainImage) {
    image = mainImage.src || mainImage.dataset.oldHires || mainImage.dataset.src;
  }

  // Extract description/features
  let description = null;
  const featureBullets = document.querySelector('#feature-bullets');
  if (featureBullets) {
    const bullets = Array.from(featureBullets.querySelectorAll('li span.a-list-item'))
      .map(li => li.textContent.trim())
      .filter(text => text.length > 0)
      .slice(0, 3)
      .join(' • ');
    description = bullets;
  }

  // Extract brand
  let brand = null;
  const brandElement = document.querySelector('#bylineInfo, a#brand, [data-feature-name="bylineInfo"] a, .po-brand .po-break-word');
  if (brandElement) {
    brand = brandElement.textContent.replace(/^(Brand:|Visit the|Store:)\s*/i, '').trim();
  }

  // Extract category
  let category = null;
  const breadcrumb = document.querySelector('#wayfinding-breadcrumbs_container');
  if (breadcrumb) {
    const links = Array.from(breadcrumb.querySelectorAll('a'));
    if (links.length > 0) {
      category = links[links.length - 1].textContent.trim();
    }
  }

  return {
    url: window.location.href.split('?')[0], // Clean URL
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    brand,
    category,
    site: 'amazon',
    store: 'Amazon',
    metadata: {
      asin: extractASIN(),
    },
  };
}

/**
 * Extract ASIN from Amazon URL or page
 */
function extractASIN() {
  const match = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? match[1] : null;
}

/**
 * Extract product data from Target
 */
function extractTargetProduct() {
  if (!window.location.pathname.includes('/p/')) return null;

  // Target is a React SPA — try multiple selector strategies
  const productTitle = document.querySelector(
    '[data-test="product-title"], ' +
    'h1[data-test="product-title"], ' +
    '[data-test="@web/ProductTitle/ProductTitle"] h1, ' +
    '#pdp-product-title-id, ' +
    'h1.Heading'
  );

  // If no title element or empty text, let the generic extractor handle it
  const titleText = productTitle?.textContent?.trim();
  if (!titleText) return null;

  let price = null;
  const priceElement = document.querySelector(
    '[data-test="product-price"], ' +
    '[data-test="product-price"] span, ' +
    '[data-test="@web/ProductPrice/ProductPrice"] span'
  );
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  // Prefer the main product image carousel, not thumbnails
  const mainImage = document.querySelector(
    '[data-test="image-gallery-item-0"] img, ' +
    '[data-test="image-gallery-item"] img, ' +
    'button[data-test="image-gallery-item-0"] img, ' +
    '[data-test="@web/ProductImage"] img, ' +
    'picture source[type="image/webp"]'
  );
  if (mainImage) {
    image = mainImage.srcset?.split(',')[0]?.trim()?.split(' ')[0] || mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector(
    '[data-test="item-details-description"], ' +
    '[data-test="product-description"]'
  );
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  let brand = null;
  const brandElement = document.querySelector(
    '[data-test="product-brand"] a, ' +
    '[data-test="@web/ProductBrand"] a'
  );
  if (brandElement) {
    brand = brandElement.textContent.trim();
  }

  let category = null;
  const breadcrumbs = document.querySelectorAll(
    '[data-test="breadcrumb-item"], ' +
    '[data-test="@web/Breadcrumb/BreadcrumbItem"]'
  );
  if (breadcrumbs.length > 0) {
    category = breadcrumbs[breadcrumbs.length - 1].textContent.trim();
  }

  return {
    url: window.location.href.split('?')[0],
    title: titleText,
    price,
    image,
    description,
    brand,
    category,
    site: 'target',
    store: 'Target',
  };
}

/**
 * Extract product data from Walmart
 */
function extractWalmartProduct() {
  const productTitle = document.querySelector('h1[itemprop="name"]');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('[itemprop="price"], .price-characteristic');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('.prod-hero-image img, [class*="Hero"] img');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('[itemprop="description"]');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'walmart',
  };
}

/**
 * Extract product data from Etsy
 */
function extractEtsyProduct() {
  const productTitle = document.querySelector('h1[data-buy-box-listing-title]');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('[data-buy-box-region="price"] p');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('[data-carousel-image] img');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('[data-product-details-description-text-content]');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'etsy',
  };
}

/**
 * Extract product data from Best Buy
 */
function extractBestBuyProduct() {
  const productTitle = document.querySelector('.sku-title h1, [data-testid="product-title"]');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('[data-testid="customer-price"] span, .priceView-hero-price span');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('.primary-image, [data-testid="product-image"]');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('.product-data-value, [data-testid="product-description"]');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  // Extract brand
  let brand = null;
  const brandLink = document.querySelector('.product-data a[href*="/brands/"]');
  if (brandLink) {
    brand = brandLink.textContent.trim();
  }

  // Extract category
  let category = null;
  const breadcrumbs = document.querySelectorAll('.breadcrumb a');
  if (breadcrumbs.length > 1) {
    category = breadcrumbs[breadcrumbs.length - 2].textContent.trim();
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    brand,
    category,
    site: 'bestbuy',
    store: 'Best Buy',
  };
}

/**
 * Extract product data from eBay
 */
function extractEbayProduct() {
  const productTitle = document.querySelector('.x-item-title__mainTitle, h1.it-ttl');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('.x-price-primary span, #prcIsum, .display-price');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('.ux-image-carousel-item img, #icImg');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('.x-item-description, #desc_div');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'ebay',
  };
}

/**
 * Extract product data from Wayfair
 */
function extractWayfairProduct() {
  const productTitle = document.querySelector('[data-enzyme-id="ProductTitle"] h1, .ProductDetailInfoBlock h1');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('[data-enzyme-id="PriceBlock"] .BasePriceBlock, .pl-PricingDisplay');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('.ProductImageCarousel img, [data-hb-id="Image"]');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('[data-enzyme-id="ProductDescription"]');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'wayfair',
  };
}

/**
 * Extract product data from Sephora
 */
function extractSephoraProduct() {
  const productTitle = document.querySelector('[data-at="product_name"], .css-euydo4');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('[data-at="price"], .css-18suhm');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('[data-at="product_image"] img, .css-1s178v7 img');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('[data-at="product_description"]');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'sephora',
  };
}

/**
 * Extract product data from Barnes & Noble
 */
function extractBarnesNobleProduct() {
  const productTitle = document.querySelector('h1.pdp-header-title, .product-info-header h1');
  if (!productTitle) return null;

  let price = null;
  const priceElement = document.querySelector('.price-value, .current-price');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('.product-image img, .pdp-image img');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('.product-description, .overview-content');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'barnesnoble',
  };
}

/**
 * Generic fallback extractor using meta tags and JSON-LD structured data.
 * Works on virtually any e-commerce site since these are SEO standards.
 */
function extractGenericProduct() {
  // Try JSON-LD structured data first (most reliable)
  let jsonLd = null;
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      // Handle arrays of JSON-LD objects
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'Product' || item['@type']?.includes?.('Product')) {
          jsonLd = item;
          break;
        }
        // Check @graph arrays (common pattern)
        if (item['@graph']) {
          const product = item['@graph'].find(g =>
            g['@type'] === 'Product' || g['@type']?.includes?.('Product')
          );
          if (product) { jsonLd = product; break; }
        }
      }
      if (jsonLd) break;
    } catch (e) { /* skip invalid JSON */ }
  }

  // Extract from JSON-LD
  let title = jsonLd?.name || null;
  let price = null;
  let image = null;
  let description = jsonLd?.description || null;
  let brand = null;

  if (jsonLd) {
    // Price from JSON-LD offers
    const offers = jsonLd.offers;
    if (offers) {
      const offer = Array.isArray(offers) ? offers[0] : offers;
      price = parseFloat(offer.price) || parseFloat(offer.lowPrice) || null;
    }

    // Image from JSON-LD
    if (jsonLd.image) {
      image = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
      if (typeof image === 'object') image = image.url || image.contentUrl || null;
    }

    // Brand from JSON-LD
    if (jsonLd.brand) {
      brand = typeof jsonLd.brand === 'string' ? jsonLd.brand : jsonLd.brand.name || null;
    }
  }

  // Fill gaps with Open Graph meta tags
  const getMeta = (property) => {
    const el = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
    return el?.content || null;
  };

  title = title || getMeta('og:title') || document.title;
  image = image || getMeta('og:image');
  description = description || getMeta('og:description') || getMeta('description');
  if (!price) {
    const ogPrice = getMeta('product:price:amount') || getMeta('og:price:amount');
    if (ogPrice) price = parseFloat(ogPrice) || null;
  }

  // Need at least a title to consider it a product page
  if (!title) return null;

  // Clean up title — remove site name suffixes like " | Amazon.com" or " - Best Buy"
  title = title.replace(/\s*[\|\-–—]\s*[^|\-–—]+$/, '').trim();

  // Determine store name from hostname
  const hostname = window.location.hostname.replace(/^www\./, '');
  const storeName = hostname.split('.')[0];
  const store = storeName.charAt(0).toUpperCase() + storeName.slice(1);

  return {
    url: window.location.href.split('?')[0],
    title,
    price,
    image,
    description: description ? description.substring(0, 300) : null,
    brand,
    site: storeName,
    store,
  };
}

/**
 * Main detector - tries site-specific extractor first, then generic fallback.
 * Merges results so generic can fill gaps left by site-specific selectors.
 */
function detectProduct() {
  const hostname = window.location.hostname;

  let siteResult = null;
  if (hostname.includes('amazon.com')) {
    siteResult = extractAmazonProduct();
  } else if (hostname.includes('target.com')) {
    siteResult = extractTargetProduct();
  } else if (hostname.includes('walmart.com')) {
    siteResult = extractWalmartProduct();
  } else if (hostname.includes('etsy.com')) {
    siteResult = extractEtsyProduct();
  } else if (hostname.includes('bestbuy.com')) {
    siteResult = extractBestBuyProduct();
  } else if (hostname.includes('ebay.com')) {
    siteResult = extractEbayProduct();
  } else if (hostname.includes('wayfair.com')) {
    siteResult = extractWayfairProduct();
  } else if (hostname.includes('sephora.com')) {
    siteResult = extractSephoraProduct();
  } else if (hostname.includes('barnesandnoble.com')) {
    siteResult = extractBarnesNobleProduct();
  }

  const genericResult = extractGenericProduct();

  // If site-specific found nothing, use generic
  if (!siteResult) return genericResult;

  // If both exist, let generic fill in any gaps from site-specific
  if (genericResult) {
    return {
      ...siteResult,
      title: siteResult.title || genericResult.title,
      price: siteResult.price || genericResult.price,
      image: siteResult.image || genericResult.image,
      description: siteResult.description || genericResult.description,
      brand: siteResult.brand || genericResult.brand,
    };
  }

  return siteResult;
}

// Export for use in detector
window.detectProduct = detectProduct;
