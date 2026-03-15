// Content script that detects products
// Note: extractors.js is loaded by manifest.json before this script
console.log('🎁 Gift Tracker: Detector script starting...');
console.log('🎁 Gift Tracker: Checking for extractors...');

// Wait a moment for extractors to be available
setTimeout(() => {
  if (typeof window.detectProduct === 'function') {
    console.log('🎁 Gift Tracker: ✅ Extractors loaded successfully');
  } else {
    console.error('🎁 Gift Tracker: ❌ Extractors not available');
  }
}, 100);

// Wait for page to be ready and detect product
let productData = null;
let detectionTimeout = null;

function detectAndNotify() {
  console.log('🎁 Gift Tracker: detectAndNotify called');

  // Clear previous timeout
  if (detectionTimeout) {
    clearTimeout(detectionTimeout);
  }

  // Try detection multiple times — SPAs like Target render asynchronously
  let attempts = 0;
  const maxAttempts = 3;
  const delays = [500, 1500, 3000]; // Escalating delays

  function tryDetect() {
    attempts++;
    console.log(`🎁 Gift Tracker: Attempting detection (attempt ${attempts}/${maxAttempts})...`);

    if (typeof window.detectProduct !== 'function') {
      console.error('🎁 Gift Tracker: ❌ window.detectProduct is not available');
      return;
    }

    const detected = window.detectProduct();
    console.log('🎁 Gift Tracker: Detection result:', detected);

    if (detected && detected.title) {
      // Got a good result — check if it's better than what we had
      if (JSON.stringify(detected) !== JSON.stringify(productData)) {
        productData = detected;
        console.log('🎁 Gift Tracker: ✅ Product detected!', productData);

        chrome.storage.local.set({
          currentProduct: productData,
          currentUrl: window.location.href
        });

        chrome.runtime.sendMessage({
          type: 'PRODUCT_DETECTED',
          payload: productData
        }).catch(err => {
          console.log('🎁 Gift Tracker: Could not send message to background', err);
        });
      }
    } else if (attempts < maxAttempts) {
      // Retry with longer delay for SPAs that render slowly
      console.log(`🎁 Gift Tracker: Retrying in ${delays[attempts]}ms...`);
      detectionTimeout = setTimeout(tryDetect, delays[attempts]);
    } else {
      console.log('🎁 Gift Tracker: ❌ No product detected after all attempts');
    }
  }

  detectionTimeout = setTimeout(tryDetect, delays[0]);
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
