/* Wisdom Tower Academy — Offline Service Worker
 * Caches pages, static assets, images the user has opened.
 * Does NOT cache large PDF book downloads (Appwrite /api/content/pdf).
 * Strategy: network-first for navigations, cache-first for static/images.
 */
const CACHE_VERSION = "wta-offline-v4";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

const PRECACHE_URLS = ["/", "/learning", "/packages", "/account", "/academy", "/academy/freshman", "/academy/scholarships", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      await Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u).catch(() => null)));
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("wta-offline-") && !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
}

function isImage(url) {
  return (
    url.pathname.startsWith("/images/") ||
    /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname)
  );
}

function isLargeBookPdf(url) {
  return url.pathname.startsWith("/api/content/pdf");
}

function isApiOrData(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("appwrite") ||
    url.pathname.includes("/rest/v1/")
  );
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      const offline = (await cache.match("/offline")) || (await caches.match("/offline"));
      if (offline) return offline;
    }
    throw new Error("offline-and-uncached");
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Never cache full textbook PDFs in the SW (too large; use in-reader download instead)
  if (isLargeBookPdf(url)) {
    return;
  }

  if (url.origin === self.location.origin) {
    if (isNavigationRequest(request)) {
      event.respondWith(networkFirst(request, PAGE_CACHE));
      return;
    }
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }
    if (isImage(url)) {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
      return;
    }
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  if (isImage(url) || request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  if (isApiOrData(url)) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "PRECACHE_URLS" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const pageCache = await caches.open(PAGE_CACHE);
      const imageCache = await caches.open(IMAGE_CACHE);
      await Promise.allSettled(
        data.urls.map((u) => {
          try {
            const parsed = new URL(u, self.location.origin);
            if (isImage(parsed)) return imageCache.add(u).catch(() => null);
            return pageCache.add(u).catch(() => null);
          } catch {
            return null;
          }
        })
      );
    })()
  );
});
