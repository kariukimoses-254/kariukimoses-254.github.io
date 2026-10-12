/* Mosey Technologies service worker.
   - Precaches the app shell, self-hosted fonts and every product photo on
     install, so the store can be browsed fully offline after the first visit.
   - Network-first for navigations, stale-while-revalidate for same-origin
     static assets. API calls are never cached.
   The PRECACHE list below is kept in the order the photos were acquired. */

const CACHE = 'mosey-shell-v2'

const PRECACHE = [
  // App shell
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/tiger.svg',
  // Self-hosted fonts
  '/fonts/inter.css',
  '/fonts/inter-latin.woff2',
  '/fonts/inter-latin-ext.woff2',
  // Product photos — first batch
  '/images/iphone-15-pro.png',
  '/images/iphone-14.jpg',
  '/images/galaxy-s24-ultra.jpg',
  '/images/pixel-8-pro.jpg',
  '/images/galaxy-z-flip-5.jpg',
  '/images/galaxy-a55.jpg',
  '/images/xiaomi-14.jpg',
  '/images/nothing-phone-2.png',
  '/images/macbook-air-m3.jpg',
  '/images/macbook-pro-14.jpg',
  '/images/dell-xps-13.png',
  '/images/thinkpad-x1-carbon.jpg',
  '/images/hp-spectre-x360.jpg',
  '/images/rog-zephyrus-g14.jpg',
  '/images/surface-laptop-6.png',
  '/images/acer-swift-go.jpg',
  // Product photos — second batch
  '/images/ipad-air.jpg',
  '/images/galaxy-tab-s9.png',
  '/images/sony-wh1000xm3.jpg',
  '/images/airpods-pro-2.jpg',
  '/images/apple-watch-series-9.jpg',
  '/images/galaxy-watch-6.jpg',
  '/images/playstation-5.jpg',
  '/images/nintendo-switch-oled.png',
  '/images/sony-a7-iv.jpg',
  '/images/gopro-hero9.jpg',
  '/images/amazon-echo-2.jpg',
  '/images/nest-learning-thermostat.jpg',
  '/images/anker-521-power-bank.jpg',
  '/images/logitech-mx-master-3s.jpg',
  // Product photos — latest additions
  '/images/galaxy-s25-ultra.jpg',
  '/images/galaxy-z-fold6.jpg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      // Cache each asset independently so a single failure never blocks install.
      await Promise.allSettled(
        PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) {
    // The catalogue is network-first but falls back to the last good response
    // so the store still browses offline. Every other API call (promo checks,
    // orders) is always live and never cached.
    if (request.method === 'GET' && url.pathname === '/api/products') {
      event.respondWith(
        (async () => {
          const cache = await caches.open(CACHE)
          try {
            const response = await fetch(request)
            if (response && response.ok) {
              cache.put(request, response.clone())
              return response
            }
            return (await cache.match(request)) || response
          } catch {
            return (await cache.match(request)) || Response.error()
          }
        })(),
      )
    }
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const offline = async () =>
          (await caches.match(request)) || (await caches.match('/index.html')) || (await caches.match('/'))
        try {
          const response = await fetch(request)
          // Serve the shell from cache if the network answers with an error
          // (proxies often return 5xx instead of failing outright when offline).
          if (response && response.ok) return response
          return (await offline()) || response
        } catch {
          return offline()
        }
      })(),
    )
    return
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone())
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
