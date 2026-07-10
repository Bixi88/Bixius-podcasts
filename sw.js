const CACHE_NAME = 'bixius-podcast-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installazione Service Worker e Caching Asset statici di base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Gestione delle richieste di rete con bypass per API e Video Esterni
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Se la richiesta riguarda i feed esterni o i player video di YouTube/Twitch, non usare la cache locale
  if (url.includes('api.rss2json.com') || url.includes('youtube.com') || url.includes('twitch.tv') || url.includes('youtu.be')) {
    return fetch(e.request);
  }

  // Strategia standard Cache-First per l'interfaccia dell'app
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});const CACHE_NAME = 'bixius-choice-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installazione e caching dei file locali statici
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Strategia di fetch: Network first (così se aggiorni i canali li vedi subito), fallback su Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
