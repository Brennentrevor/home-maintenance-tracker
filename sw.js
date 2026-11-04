// Service worker: cache-first app shell, stale-while-revalidate for the supabase-js CDN + Google Fonts,
// never caches Supabase API / other cross-origin requests.
const CACHE_NAME = 'maint-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const SWR_PREFIXES = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (SWR_PREFIXES.some((p) => req.url.startsWith(p))) {
    // stale-while-revalidate
    e.respondWith(caches.open(CACHE_NAME).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return; // Supabase API etc: network only
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((r) => {
    if (r && r.ok) { const cp = r.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, cp)); }
    return r;
  }).catch(() => caches.match('./index.html'))));
});
