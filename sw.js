/* Service worker: cache "cangkang" aplikasi agar bisa dibuka cepat/offline & memenuhi syarat instal PWA.
   Data tetap selalu diambil online dari Apps Script (tidak di-cache di sini).
   Naikkan nomor versi CACHE setiap kali file aplikasi/ikon diganti. */
const CACHE = 'doa-shell-v2';
const SHELL = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png',
  './icon-maskable-192.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first untuk file milik sendiri; bila offline pakai cache. Request lintas-origin (Apps Script) dibiarkan. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
