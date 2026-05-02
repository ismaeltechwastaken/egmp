// Bump CACHE_VERSION to force update of cached responses.
const CACHE_VERSION = "v7";
const CACHE_NAME = `EgMpCache-${CACHE_VERSION}`;
const OFFLINE_HTML = "/offline.html";

// App shell extensions are served network-first so updates appear without
// a hard refresh. IPFS / immutable game assets are cache-first.
const APP_SHELL_EXTS = [".html", ".js", ".css", ".json", ".webmanifest"];
const IPFS_HOST_HINTS = [
  ".ipfs.dweb.link",
  ".ipfs.w3s.link",
  ".ipfs.flk-ipfs.xyz",
  ".ipfs.cf-ipfs.com",
  "ipfs.io/ipfs/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.add(OFFLINE_HTML).catch((err) => {
          console.warn("Failed to cache offline page:", err);
        }),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("Deleting old cache:", name);
              return caches.delete(name);
            }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isIpfsUrl(url) {
  return IPFS_HOST_HINTS.some((hint) => url.href.includes(hint));
}

function isAppShell(url) {
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  if (path === "/" || path.endsWith("/")) return true;
  return APP_SHELL_EXTS.some((ext) => path.endsWith(ext));
}

async function networkFirst(request, cache) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await cache.match(OFFLINE_HTML);
      if (offline) return offline;
    }
    throw err;
  }
}

async function staleWhileRevalidate(request, cache) {
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      } else if (response && !response.ok && request.url.includes(".part")) {
        cache.delete(request).catch(() => {});
      }
      return response;
    })
    .catch((err) => {
      if (cached) return cached;
      throw err;
    });

  return cached || networkPromise;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  url.href = url.href.split("#")[0];

  if (!url.href.startsWith("http")) return;
  if (url.href.includes("onlineCheck")) return;
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      if (isAppShell(url)) return networkFirst(event.request, cache);
      if (isIpfsUrl(url)) return staleWhileRevalidate(event.request, cache);
      return staleWhileRevalidate(event.request, cache);
    }),
  );
});
