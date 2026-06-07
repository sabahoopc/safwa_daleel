const CACHE_NAME = 'safwa-v7';
const STATIC = [
  '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // index.html و HTML pages — دائماً من الشبكة
  if (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname === ''
  ) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // باقي الملفات — cache first
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
