// دليل صفوى — Service Worker v3
const CACHE = 'daleel-safwa-v3';
const ASSETS = ['/', '/directory.html', '/terms.html', '/landing.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // تفعيل فوري بدون انتظار
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // السيطرة على كل التبويبات المفتوحة فوراً
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

  // شبكة أولاً دائماً — لضمان تحميل أحدث نسخة
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
