// Background service worker for the extension

console.log('Gift Tracker: Background service worker loaded');

// Listen for product detection from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);

  if (message.type === 'PRODUCT_DETECTED') {
    // Update badge to show product was detected
    if (sender.tab?.id) {
      chrome.action.setBadgeText({
        text: '✓',
        tabId: sender.tab.id
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#10b981', // Green
        tabId: sender.tab.id
      });
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CAPTURE_SCREENSHOT') {
    // Capture screenshot of the current tab
    captureScreenshot(sender.tab?.id)
      .then(screenshot => {
        sendResponse({ screenshot });
      })
      .catch(error => {
        console.error('Error capturing screenshot:', error);
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  }

  if (message.type === 'CLEAR_BADGE') {
    if (sender.tab?.id) {
      chrome.action.setBadgeText({
        text: '',
        tabId: sender.tab.id
      });
    }
    sendResponse({ success: true });
    return true;
  }
});

// Clear badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

/**
 * Capture screenshot of the active tab
 */
async function captureScreenshot(tabId) {
  try {
    // Get the active tab if not provided
    let targetTabId = tabId;
    if (!targetTabId) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      targetTabId = tab.id;
    }

    // Capture the visible tab
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90
    });

    return screenshot; // Returns data URL
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
}

/**
 * Upload screenshot to storage (Supabase or similar)
 * This would be called from the popup when saving a gift
 */
async function uploadScreenshot(screenshot, giftId) {
  // TODO: Implement upload to Supabase storage
  // For now, we'll store it in the gift metadata as base64
  return screenshot;
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Gift Tracker extension installed!');
    // Open onboarding page
    chrome.tabs.create({
      url: 'popup/popup.html'
    });
  }
});
