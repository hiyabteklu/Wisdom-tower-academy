/** In-memory PDF cache so reopening the same book is instant. */

const cache = new Map<string, ArrayBuffer>();
const MAX_ENTRIES = 8;

export function getCachedPdf(key: string): ArrayBuffer | undefined {
  return cache.get(key);
}

export function setCachedPdf(key: string, data: ArrayBuffer) {
  if (cache.size >= MAX_ENTRIES && !cache.has(key)) {
    const oldest = cache.keys().next().value;
    if (oldest != null) cache.delete(oldest);
  }
  cache.set(key, data);
}

export async function fetchPdfCached(url: string): Promise<ArrayBuffer> {
  const hit = getCachedPdf(url);
  if (hit) return hit.slice(0);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load PDF (${res.status})`);
  const buf = await res.arrayBuffer();
  setCachedPdf(url, buf);
  return buf.slice(0);
}
