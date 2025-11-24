// Custom Service Worker Event Handlers for GiftStash PWA
// This file extends the auto-generated service worker with custom behavior

// Listen for messages from the app (e.g., SKIP_WAITING command)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // When user clicks "Update Now", activate the new service worker immediately
    self.skipWaiting();
  }
});

// When the new service worker activates, take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Claim all clients immediately so the new SW takes control
    self.clients.claim()
  );
});

// Log installation for debugging
self.addEventListener('install', (event) => {
  console.log('[GiftStash SW] New version installing...');
  // Force the waiting service worker to become the active service worker
  // This is already set in next.config.js but we ensure it here too
  self.skipWaiting();
});

console.log('[GiftStash SW] Custom service worker loaded');
