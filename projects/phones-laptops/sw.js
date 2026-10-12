/*
 * Minimal service worker for static hosting (e.g. GitHub Pages).
 * The original worker precached absolute root paths that are invalid when the
 * app is served from a sub-path, so this build ships a no-op worker that only
 * takes control without caching.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
