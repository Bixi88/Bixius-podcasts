const CACHE_NAME = 'bixius-podcast-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  if (url.includes('api.rss2json.com') || url.includes('youtube.com') || url.includes('twitch.tv') || url.includes('youtu.be')) {
    return;
  }

  // Network-first per la pagina principale (index.html / navigazioni):
  // così ogni aggiornamento pubblicato viene visto subito, senza restare bloccati
  // su una versione vecchia in cache. Se manca la rete, usa la copia in cache.
  const isNavigation = e.request.mode === 'navigate' || url.endsWith('/') || url.endsWith('index.html');
  if (isNavigation) {
    e.respondWith(
      fetch(e.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
