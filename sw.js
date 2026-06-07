const CACHE_NAME = 'safwa-v8';

self.addEventListener('install', e => {
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
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // لا تخزن أي ملف HTML
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    e.respondWith(fetch(e.request));
    return;
  }
  // باقي الملفات من الشبكة أولاً
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
