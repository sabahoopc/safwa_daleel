// دليل صفوى — Service Worker v4
const CACHE = 'daleel-safwa-v4';
// لا نخزّن directory.html في الـ cache لضمان تحميل أحدث نسخة دائماً
const ASSETS = ['/terms.html', '/landing.html'];

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

  // لا تتدخل في طلبات API أو غير GET
  if (
    url.includes('supabase.co') ||
    url.includes('googleapis.com') ||
    url.includes('googletagmanager') ||
    url.includes('fonts.g') ||
    e.request.method !== 'GET'
  ) return;

  // directory.html و index.html — شبكة أولاً دائماً بدون cache
  if (url.includes('directory.html') || url.endsWith('/') || url.includes('index.html')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // باقي الملفات — شبكة أولاً ثم cache
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
