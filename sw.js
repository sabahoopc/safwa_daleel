// دليل صفوى — Service Worker
const CACHE = 'daleel-safwa-v3';
const ASSETS = ['/', '/directory.html', '/terms.html', '/landing.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // لا تتدخل في طلبات Supabase أو APIs خارجية
  if (
    url.includes('supabase.co') ||
    url.includes('onesignal.com') ||
    url.includes('googletagmanager') ||
    e.request.method !== 'GET'
  ) {
    return; // اتركها تمر بشكل طبيعي
  }

  // باقي الطلبات: شبكة أولاً ثم cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
