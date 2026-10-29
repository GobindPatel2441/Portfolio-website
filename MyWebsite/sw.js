/**
 * Passive Cleanup Service Worker
 * Purges legacy CacheStorage caches and safely unregisters
 * without interrupting active browser clients or forcing navigation loops.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
      .then(() => self.registration.unregister())
      .catch(() => self.registration.unregister())
  );
});
