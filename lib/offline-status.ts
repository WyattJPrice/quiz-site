/**
 * Real connectivity check for the hidden offline archive.
 *
 * `navigator.onLine` alone is not trustworthy: it stays true whenever any
 * network interface is up (VPN/virtual adapters, ethernet with no internet,
 * localhost dev server). When it reports online we verify with a tiny
 * cross-origin probe, and outside local development also confirm that the site
 * itself is unreachable before calling the device offline.
 */

const PROBE_URLS = [
  'https://www.gstatic.com/generate_204',
  'https://example.com/favicon.ico',
];

function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function isLocalHost(): boolean {
  const host = location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '0.0.0.0';
}

export async function isOffline(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.onLine) return true;
  if (typeof fetch !== 'function') return false;

  // On localhost the dev server stays reachable even with the internet off, so
  // only the external probes can tell us anything there.
  const external = await Promise.any(
    PROBE_URLS.map((url) =>
      fetch(url, {
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        signal: timeoutSignal(1800),
      }).then(() => true)
    )
  ).catch(() => false);

  if (external) return false;
  if (isLocalHost()) return true;

  // Outside local dev, a reachable site means we are online even if the
  // outbound probes are blocked.
  try {
    await fetch(`/icon.svg?offline-check=${Date.now()}`, {
      cache: 'no-store',
      method: 'HEAD',
      signal: timeoutSignal(1500),
    });
    return false;
  } catch {
    return true;
  }
}
