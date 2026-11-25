const PROBE_TIMEOUT_MS = 4000;

/**
 * Reachability probe that does not rely solely on navigator.onLine.
 * Uses a non-precached asset so a service worker cache hit cannot fake online.
 */
export async function probeConnectivity(
  timeoutMs = PROBE_TIMEOUT_MS,
): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `/robots.txt?__online_probe=${Date.now()}`,
      {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      },
    );
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
