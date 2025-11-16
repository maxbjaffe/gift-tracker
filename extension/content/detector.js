// Content script that detects products and injects the extractors

// Load extractors
(function() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/extractors.js');
  (document.head || document.documentElement).appendChild(script);
})();

// Wait for page to be ready and detect product
let productData = null;
let detectionTimeout = null;

function detectAndNotify() {
  // Clear previous timeout
  if (detectionTimeout) {
    clearTimeout(detectionTimeout);
  }

  // Wait a bit for page to fully load
  detectionTimeout = setTimeout(() => {
    if (typeof window.detectProduct === 'function') {
      const detected = window.detectProduct();

      if (detected && JSON.stringify(detected) !== JSON.stringify(productData)) {
        productData = detected;
        console.log('Gift Tracker: Product detected', productData);

        // Store product data in chrome.storage for popup to access
        chrome.storage.local.set({
          currentProduct: productData,
          currentUrl: window.location.href
        });

        // Show page action badge
        chrome.runtime.sendMessage({
          type: 'PRODUCT_DETECTED',
          payload: productData
        }).catch(err => {
          console.log('Gift Tracker: Could not send message to background', err);
        });
      }
    }
  }, 1000);
}

// Detect on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', detectAndNotify);
} else {
  detectAndNotify();
}

// Re-detect on URL changes (for SPAs)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    detectAndNotify();
  }
}).observe(document.body, { childList: true, subtree: true });

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PRODUCT_DATA') {
    sendResponse({ productData });
    return true;
  }
});

console.log('Gift Tracker: Content script loaded');
