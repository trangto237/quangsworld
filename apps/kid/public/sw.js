/*
 * Offline-first service worker shared by the kid app (/) and parent app (/parent/).
 * Navigations: network first, falling back to the cached app shell.
 * Assets (hashed JS/CSS/wasm, fonts): cache first, then network (and cache).
 */
const CACHE = 'atlas-v6';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/parent/', '/manifest.webmanifest', '/icon.svg', '/icons/icon-192.png'])).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');
  if (!sameOrigin && !isFont) return;

  if (req.mode === 'navigate') {
    const shell = url.pathname.startsWith('/parent') ? '/parent/' : '/';
    const network = fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(shell, copy));
      }
      return res;
    });
    const cached = () => caches.match(shell).then((r) => r || caches.match('/'));
    // Network first, but never leave the app hanging on a slow connection: after 4 s, open the saved copy
    // (the network answer still refreshes the cache for next time).
    const slow = new Promise((resolve) => setTimeout(() => cached().then((r) => r && resolve(r)), 4000));
    e.respondWith(Promise.race([network.catch(() => cached()), slow]).then((r) => r || network));
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
