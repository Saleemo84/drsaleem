// public/sw.js
const CACHE_NAME = 'drsaleem-cache-v2'; // Updated cache version

// Install event: the service worker is first installed.
self.addEventListener('install', event => {
  console.log('Service Worker: Install event in progress.');
  // waitUntil() ensures that the Service Worker will not install until the code inside has successfully occurred.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Pre-cache the main shell of the app.
        // More assets will be cached dynamically on first visit.
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]);
      })
      .then(() => {
        console.log('Service Worker: Core assets cached.');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
  );
});

// Activate event: fires when the service worker becomes active.
// A good time to clean up old caches.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activate event in progress.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache's name is not in our whitelist, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Now ready to handle fetches!');
        // Take control of all open pages.
        return self.clients.claim();
    })
  );
});

// Fetch event: fires for every network request made by the page.
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // Use a "Cache first, falling back to network" strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we found a match in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If no match, fetch from the network.
        return fetch(event.request).then(networkResponse => {
            // If the fetch is successful, clone the response, cache it, and return it.
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        );
      })
  );
});
