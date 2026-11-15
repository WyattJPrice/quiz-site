/*
 * Minimal service worker for the cached offline archive.
 *
 * Only the virtual prefix below is handled. While the device is online every
 * request to that prefix resolves to a 404, so the cached files stay invisible.
 * Nothing else on the site is intercepted.
 */
const CACHE_NAME = 'study-offline-v1';
const PREFIX = '/v/d/';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// The overlay page reports what it sees, because worker navigator.onLine can
// lag or misreport (virtual adapters, localhost).
let offlineHint = false;

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type !== 'archive:offline' && type !== 'archive:online') return;
  offlineHint = type === 'archive:offline';
  const port = event.ports && event.ports[0];
  if (port) port.postMessage('ok');
});

self.addEventListener('fetch', (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname !== PREFIX.slice(0, -1) && !url.pathname.startsWith(PREFIX)) return;

  event.respondWith(serve(event.request));
});

async function serve(request) {
  // Stealth rule: no archive files exist while online.
  if (!offlineHint && self.navigator.onLine !== false) {
    return notFound();
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
  } catch {
    // Fall through to 404.
  }
  return notFound();
}

function notFound() {
  return new Response('', { status: 404, statusText: 'Not Found' });
}
