/**
 * Passive Cleanup Service Worker
 * Safely unregisters without interrupting open browser clients or forcing navigation.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
