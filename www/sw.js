// BibleVerse offline cache: app shell + logo/icons + the complete bundled Catholic Bible (all 73 books).
const CACHE = "bibleverse-v9-webc";
const SHELL = ["./", "index.html", "privacy.html", "style.css", "fonts.css", "app.js", "bible.js", "feed-rotation.js", "pull-refresh.js", "manifest.webmanifest", "data/books.json", "assets/logo.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/maskable-512.png", "assets/icons/apple-touch-icon.png", "assets/fonts/fraunces.woff2", "assets/fonts/fraunces-italic.woff2", "assets/fonts/newsreader.woff2", "assets/fonts/newsreader-italic.woff2", "assets/fonts/dm-sans.woff2", "assets/fonts/dm-sans-italic.woff2"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    try {
      const res = await fetch("data/books.json");
      const meta = await res.clone().json();
      await cache.put("data/books.json", res);
      // Cache every book so the entire Bible works with no connection.
      await Promise.allSettled(meta.books.map((b) => cache.add(`data/bible/${b.file}`)));
    } catch {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      if (res.ok && new URL(event.request.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, res.clone());
      }
      return res;
    } catch {
      if (event.request.mode === "navigate") return caches.match("index.html");
      throw new Error("offline");
    }
  })());
});
