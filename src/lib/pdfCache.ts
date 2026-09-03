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

/**
 * Fetch a PDF (or return a cached copy).
 * Optional onProgress(loaded, total) — total may be null when Content-Length is missing.
 */
export async function fetchPdfCached(
  url: string,
  onProgress?: (loaded: number, total: number | null) => void
): Promise<ArrayBuffer> {
  const hit = getCachedPdf(url);
  if (hit) {
    onProgress?.(hit.byteLength, hit.byteLength);
    return hit.slice(0);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load PDF (${res.status})`);

  const contentLength = res.headers.get("Content-Length");
  const total = contentLength ? parseInt(contentLength, 10) : null;
  const body = res.body;

  if (!body || !onProgress) {
    const buf = await res.arrayBuffer();
    setCachedPdf(url, buf);
    onProgress?.(buf.byteLength, buf.byteLength);
    return buf.slice(0);
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, total && Number.isFinite(total) ? total : null);
    }
  }

  const buf = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const ab = buf.buffer;
  setCachedPdf(url, ab);
  onProgress(loaded, loaded);
  return ab.slice(0);
}
