/* Wisdom Tower Academy — Offline Service Worker
 *
 * RULE: Never delete caches the user already filled.
 * Opening a page/note/exam/image while online must work offline forever
 * until the user clears site data themselves.
 *
 * - Pages HTML: network-first when online, cache fallback offline
 * - Static JS/CSS: cache-first
 * - Images/thumbnails: stale-while-revalidate (kept forever)
 * - Same-origin /api + supabase/appwrite GETs: cached after first success
 * - Large book PDFs: NOT in SW (app OfflineVault handles those)
 *
 * Cache size can grow (hundreds of MB / GB) — intentional for full offline study.
 */
const PAGE_CACHE = "wta-pages-permanent";
const STATIC_CACHE = "wta-static-permanent";
const IMAGE_CACHE = "wta-images-permanent";
const DATA_CACHE = "wta-data-permanent";

/* Legacy names we used to delete — KEEP them so yesterday's data still answers */
const LEGACY_PREFIXES = ["wta-offline-"];

const PRECACHE_URLS = [
  "/",
  "/learning",
  "/packages",
  "/account",
  "/academy",
  "/academy/freshman",
  "/academy/scholarships",
  "/offline",
];

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
  // DO NOT delete any caches. Ever.
  // Previous code wiped wta-offline-v1..v4 and destroyed offline notes/pages.
  event.waitUntil(self.clients.claim());
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

/** Match request across permanent + any legacy cache names. */
async function matchAny(request) {
  const names = await caches.keys();
  for (const name of names) {
    const cache = await caches.open(name);
    const hit = await cache.match(request);
    if (hit) return hit;
  }
  // Also try pathname-only for navigations
  try {
    const url = new URL(request.url);
    for (const name of names) {
      const cache = await caches.open(name);
      const hit = await cache.match(url.pathname);
      if (hit) return hit;
    }
  } catch {}
  return undefined;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      try {
        const u = new URL(request.url);
        if (u.origin === self.location.origin) {
          cache.put(u.pathname, response.clone());
        }
      } catch {}
    }
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await matchAny(request));
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      const offline =
        (await cache.match("/offline")) ||
        (await caches.match("/offline")) ||
        (await matchAny(new Request("/offline")));
      if (offline) return offline;
    }
    throw new Error("offline-and-uncached");
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = (await cache.match(request)) || (await matchAny(request));
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
  const cached = (await cache.match(request)) || (await matchAny(request));
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

  // Books/PDFs stay in the app Offline vault, not SW
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

  // Supabase / Appwrite GET responses the site already fetched while online
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
      const dataCache = await caches.open(DATA_CACHE);
      await Promise.allSettled(
        data.urls.map((u) => {
          try {
            const parsed = new URL(u, self.location.origin);
            if (isImage(parsed)) return imageCache.add(u).catch(() => null);
            if (isApiOrData(parsed)) return dataCache.add(u).catch(() => null);
            return pageCache.add(u).catch(() => null);
          } catch {
            return null;
          }
        })
      );
    })()
  );
});
