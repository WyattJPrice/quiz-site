import { Unzip, UnzipInflate, type UnzipFile } from 'fflate';

/**
 * Offline games cache.
 *
 * The archive is fetched from a deliberately boring static path, expanded in
 * the page, and written into the Cache API under a virtual prefix. A tiny
 * service worker (public/sw.js) serves that prefix only while the device is
 * offline, so the files are unreachable while online and the real URL never
 * changes.
 */

const ZIP_PATH = '/a/2b7d3f9c.zip';
const CACHE_NAME = 'study-offline-v1';
const PREFIX = '/v/d/';

/** Virtual entry point for the extracted launcher. */
export const GAMES_ENTRY = `${PREFIX}Version1/index.html`;

export interface GamesProgress {
  phase: 'download' | 'extract';
  /** Bytes downloaded (download phase) */
  loaded: number;
  /** Total bytes when known (download phase) */
  total: number;
  /** Files written so far (extract phase) */
  files: number;
}

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  wasm: 'application/wasm',
  gz: 'application/gzip',
  swf: 'application/x-shockwave-flash',
  txt: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  xml: 'application/xml',
};

function mimeFor(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  return MIME[ext] ?? 'application/octet-stream';
}

function cacheKey(path: string): string {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return new URL(PREFIX + encoded, window.location.origin).href;
}

function normalizePath(name: string): string | null {
  const path = name.replace(/\\/g, '/').replace(/^\.\//, '');
  if (!path || path.endsWith('/')) return null;
  const segments = path.split('/');
  if (segments.some((s) => !s || s === '.' || s === '..')) return null;
  return path;
}

function concat(parts: Uint8Array[], size: number): Uint8Array {
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

/** True when the archive has been fully expanded into the cache. */
export async function hasGames(): Promise<boolean> {
  if (typeof caches === 'undefined') return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return !!(await cache.match(cacheKey('Version1/index.html')));
  } catch {
    return false;
  }
}

let workerPromise: Promise<ServiceWorkerRegistration> | null = null;

function waitForActivation(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.active) return Promise.resolve();
  const worker = registration.installing ?? registration.waiting;
  if (!worker) return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (worker.state === 'activated' || worker.state === 'redundant') {
        worker.removeEventListener('statechange', check);
        resolve();
      }
    };
    worker.addEventListener('statechange', check);
    check();
  });
}

/**
 * Register (or reuse) the worker that serves the archive. Its scope is `/v/`,
 * never `/`, so it cannot control or reload the actual site pages.
 */
export function ensureWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.reject(new Error('Service workers are unavailable'));
  }
  if (!workerPromise) {
    workerPromise = (async () => {
      // Reuse an existing registration so this never depends on the network
      // (calling register() while offline triggers an update check).
      const existing = await navigator.serviceWorker.getRegistration('/v/');
      if (existing) {
        await waitForActivation(existing);
        return existing;
      }
      const registration = await navigator.serviceWorker.register('/v/sw.js', { scope: '/v/' });
      await waitForActivation(registration);
      return registration;
    })().catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

/**
 * Tell the worker whether the page considers the device offline. The worker
 * still refuses to serve the archive while it sees a live connection; this
 * hint covers platforms where workers misreport navigator.onLine.
 */
export async function setArchiveOffline(offline: boolean): Promise<void> {
  try {
    const registration = await ensureWorker();
    const worker = registration.active;
    if (!worker) return;

    await new Promise<void>((resolve) => {
      const channel = new MessageChannel();
      const timer = setTimeout(resolve, 400);
      channel.port1.onmessage = () => {
        clearTimeout(timer);
        resolve();
      };
      worker.postMessage({ type: offline ? 'archive:offline' : 'archive:online' }, [channel.port2]);
    });
  } catch {
    // The worker falls back to its own connection check.
  }
}

let pending: Promise<void> | null = null;

/**
 * Download and expand the games archive. Safe to call repeatedly: concurrent
 * calls share one task and completed caches are reused.
 */
export function ensureGames(onProgress?: (progress: GamesProgress) => void): Promise<void> {
  if (!pending) {
    pending = run(onProgress).finally(() => {
      pending = null;
    });
  }
  return pending;
}

async function run(onProgress?: (progress: GamesProgress) => void): Promise<void> {
  if (typeof caches === 'undefined' || typeof window === 'undefined') {
    throw new Error('Cache API is unavailable');
  }

  await ensureWorker();

  if (await hasGames()) {
    onProgress?.({ phase: 'extract', loaded: 0, total: 0, files: 0 });
    return;
  }

  // Drop any partial previous attempt before starting over.
  await caches.delete(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);

  const response = await fetch(ZIP_PATH, {
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok || !response.body) {
    throw new Error(`Archive unavailable (${response.status})`);
  }
  const total = Number(response.headers.get('content-length') ?? 0) || 0;

  let writeError: unknown = null;
  let files = 0;
  let writeChain: Promise<void> = Promise.resolve();

  const queueWrite = (url: string, blob: Blob) => {
    writeChain = writeChain.then(async () => {
      if (writeError) return;
      try {
        await cache.put(url, new Response(blob, { headers: { 'content-type': blob.type } }));
      } catch (err) {
        writeError = err;
      }
    });
  };

  const handleFile = (file: UnzipFile) => {
    const path = normalizePath(file.name);
    if (!path) {
      file.ondata = () => {};
      file.start();
      return;
    }

    const parts: Uint8Array[] = [];
    let size = 0;

    file.ondata = (err, chunk, final) => {
      if (err) {
        writeError = err;
        return;
      }
      if (chunk && chunk.byteLength > 0) {
        parts.push(chunk);
        size += chunk.byteLength;
      }
      if (!final) return;

      let bytes = parts.length === 1 ? parts[0] : concat(parts, size);
      if (/\.html?$/i.test(path)) {
        // The dino build registers its own service worker, which would claim a
        // scope inside the cached tree and interfere with the archive worker.
        const text = new TextDecoder().decode(bytes);
        if (text.includes('register-sw.js')) {
          bytes = new TextEncoder().encode(
            text.replace(/<script\b[^>]*\bsrc=["'][^"']*register-sw\.js["'][^>]*>\s*<\/script>/gi, '')
          );
        }
      }

      files += 1;
      queueWrite(cacheKey(path), new Blob([bytes as unknown as BlobPart], { type: mimeFor(path) }));
      onProgress?.({ phase: 'extract', loaded: size, total: 0, files });
    };

    file.start();
  };

  const unzip = new Unzip(handleFile);
  unzip.register(UnzipInflate);
  const reader = response.body.getReader();
  let loaded = 0;
  let lastYield = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      unzip.push(new Uint8Array(0), true);
      break;
    }
    loaded += value.byteLength;
    unzip.push(value, false);
    onProgress?.({ phase: 'download', loaded, total, files });

    // Let cache writes and paint run during the expansion.
    if (loaded - lastYield > 4 * 1024 * 1024) {
      lastYield = loaded;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  await writeChain;
  if (writeError) throw writeError;

  if (!(await hasGames())) {
    throw new Error('Archive did not contain a complete game set');
  }

  try {
    await navigator.storage?.persist?.();
  } catch {
    // Best effort only.
  }
}
