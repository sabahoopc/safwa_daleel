// دليل صفوى — Service Worker v5
const CACHE = 'daleel-safwa-v5';
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
  const method = e.request.method;

  // تجاهل كل طلبات غير GET تماماً بدون أي تدخل
  if (method !== 'GET') return;

  // تجاهل كل الـ APIs والخدمات الخارجية
  if (
    url.includes('supabase.co') ||
    url.includes('googleapis.com') ||
    url.includes('googletagmanager') ||
    url.includes('resend.com') ||
    url.includes('onesignal.com')
  ) return;

  // directory.html و index.html — شبكة أولاً دائماً
  if (url.includes('directory.html') || url.endsWith('/') || url.includes('index.html')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // باقي الملفات الثابتة — شبكة أولاً ثم cache
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
