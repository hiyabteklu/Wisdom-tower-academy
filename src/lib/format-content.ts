/** Normalize pasted admin text and lightly format for display. */

/** Turn literal \\n / \\t from JSON paste into real characters. */
export function unescapeText(input: string): string {
  if (!input) return "";
  let s = String(input);
  // Repeatedly flatten escaped sequences (paste sometimes double-escapes)
  for (let i = 0; i < 3; i++) {
    const next = s
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "")
      .replace(/\r\n/g, "\n");
    if (next === s) break;
    s = next;
  }
  return s;
}

/** Split multi-line field into clean list items. */
export function toLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((v) => toLines(v)).map((s) => s.trim()).filter(Boolean);
  }
  if (value == null) return [];
  const raw = unescapeText(String(value));
  return raw
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function asStringList(value: unknown): string[] {
  return toLines(value);
}

/** Light markdown → HTML for CMS body/intro. */
export function simpleMarkdownToHtml(src: string): string {
  let t = unescapeText(src).trim();
  if (!t) return "";

  t = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  t = t.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  t = t.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  t = t.replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>');

  t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__(.+?)__/g, "<strong>$1</strong>");
  t = t.replace(/(?<![\w*])\*(.+?)\*(?![\w*])/g, "<em>$1</em>");
  t = t.replace(/==(.+?)==/g, '<mark class="md-mark">$1</mark>');

  t = t.replace(/^(?:[-•*]\s+)(.+)$/gm, '<li class="md-li">$1</li>');
  t = t.replace(/(?:<li class="md-li">.*<\/li>\n?)+/g, (block) => `<ul class="md-ul">${block}</ul>`);

  const parts = t.split(/\n{2,}/);
  t = parts
    .map((p) => {
      const chunk = p.trim();
      if (!chunk) return "";
      if (chunk.startsWith("<h") || chunk.startsWith("<ul")) return chunk;
      return `<p class="md-p">${chunk.replace(/\n/g, "<br />")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return t;
}
