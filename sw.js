// Service worker v3: network-first for pages/app shell (3s timeout, cache fallback offline),
// stale-while-revalidate for the supabase-js CDN + Google Fonts, never caches Supabase API.
const CACHE_NAME = 'maint-v3';
const SHELL = ['./', './index.html', './catalog.js', './manifest.json', './icon-192.png', './icon-512.png'];
const SWR_PREFIXES = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function networkFirst(req) {
  return new Promise((resolve) => {
    let done = false;
    const fallback = () => caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('./index.html'));
    const timer = setTimeout(() => { fallback().then((h) => { if (h && !done) { done = true; resolve(h); } }); }, 3000);
    fetch(req, { cache: 'no-store' }).then((r) => {
      if (r && r.ok) { const cp = r.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, cp)); }
      clearTimeout(timer); if (!done) { done = true; resolve(r); }
    }).catch(() => { clearTimeout(timer); fallback().then((h) => { if (!done) { done = true; resolve(h || Response.error()); } }); });
  });
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (SWR_PREFIXES.some((p) => req.url.startsWith(p))) {
    e.respondWith(caches.open(CACHE_NAME).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return; // Supabase API etc: network only
  // Same-origin: network-first so updates always show up; cache is the offline fallback.
  e.respondWith(networkFirst(req));
});
