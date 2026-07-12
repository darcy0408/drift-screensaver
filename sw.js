/* DRIFT service worker — deliberately minimal.
   The app is useless without the network (map tiles, weather, archives), so
   this exists for installability and to keep the shell openable offline.
   Network-first everywhere; same-origin GETs fall back to the last good copy.
   Map tiles and third-party APIs are never cached (Esri terms + storage). */

const SHELL = "drift-shell-v1";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(["./"])));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: url.pathname.endsWith("/") }))
  );
});
