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
  const productTitle = document.querySelector('[data-test="product-title"], h1');
  if (!productTitle || !window.location.pathname.includes('/p/')) return null;

  let price = null;
  const priceElement = document.querySelector('[data-test="product-price"]');
  if (priceElement) {
    const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
    price = parseFloat(priceText) || null;
  }

  let image = null;
  const mainImage = document.querySelector('[data-test="image-gallery-item"] img, picture img');
  if (mainImage) {
    image = mainImage.src;
  }

  let description = null;
  const descElement = document.querySelector('[data-test="item-details-description"]');
  if (descElement) {
    description = descElement.textContent.trim().substring(0, 200);
  }

  // Extract brand
  let brand = null;
  const brandElement = document.querySelector('[data-test="product-brand"], h2 a, .ProductDetailsStyles__BrandName');
  if (brandElement) {
    brand = brandElement.textContent.trim();
  }

  // Extract category from breadcrumbs
  let category = null;
  const breadcrumbs = document.querySelectorAll('[data-test="breadcrumb-item"]');
  if (breadcrumbs.length > 0) {
    category = breadcrumbs[breadcrumbs.length - 1].textContent.trim();
  }

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
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
 * Main detector - tries all extractors based on current site
 */
function detectProduct() {
  const hostname = window.location.hostname;

  if (hostname.includes('amazon.com')) {
    return extractAmazonProduct();
  } else if (hostname.includes('target.com')) {
    return extractTargetProduct();
  } else if (hostname.includes('walmart.com')) {
    return extractWalmartProduct();
  } else if (hostname.includes('etsy.com')) {
    return extractEtsyProduct();
  } else if (hostname.includes('bestbuy.com')) {
    return extractBestBuyProduct();
  } else if (hostname.includes('ebay.com')) {
    return extractEbayProduct();
  } else if (hostname.includes('wayfair.com')) {
    return extractWayfairProduct();
  } else if (hostname.includes('sephora.com')) {
    return extractSephoraProduct();
  } else if (hostname.includes('barnesandnoble.com')) {
    return extractBarnesNobleProduct();
  }

  return null;
}

// Export for use in detector
window.detectProduct = detectProduct;
