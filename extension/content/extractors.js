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

  return {
    url: window.location.href.split('?')[0], // Clean URL
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'amazon',
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

  return {
    url: window.location.href.split('?')[0],
    title: productTitle.textContent.trim(),
    price,
    image,
    description,
    site: 'target',
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
  }

  return null;
}

// Export for use in detector
window.detectProduct = detectProduct;
