"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

type Props = {
  text: string;
  className?: string;
  /** Block display for pure equation strings */
  display?: boolean;
};

/**
 * Renders mixed plain text + LaTeX.
 * Supports: \(...\), \[...\], $...$, $$...$$
 * Safe: invalid TeX falls back to raw source.
 */
export default function MathText({ text, className = "", display = false }: Props) {
  const html = useMemo(() => renderMixedMath(text || "", display), [text, display]);

  return (
    <span
      className={`math-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTex(src: string, displayMode: boolean): string {
  try {
    return katex.renderToString(src, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return `<code class="math-fallback">${escapeHtml(src)}</code>`;
  }
}

/**
 * Split text into plain / math segments and render.
 * Order of matching: $$ $$ → \[ \] → $ $ → \( \)
 */
function renderMixedMath(input: string, forceDisplay: boolean): string {
  if (!input) return "";

  // If entire string is forced display and looks like pure math, render once
  if (forceDisplay && !/[\n]/.test(input) && !/[a-zA-Z]{4,}/.test(input.replace(/\\[a-zA-Z]+/g, ""))) {
    return renderTex(input, true);
  }

  const pattern =
    /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)/g;

  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(input)) !== null) {
    if (m.index > last) {
      out += escapeHtml(input.slice(last, m.index)).replace(/\n/g, "<br/>");
    }

    if (m[1] != null) {
      out += renderTex(m[1].trim(), true);
    } else if (m[2] != null) {
      out += renderTex(m[2].trim(), true);
    } else if (m[3] != null) {
      out += renderTex(m[3].trim(), false);
    } else if (m[4] != null) {
      out += renderTex(m[4].trim(), false);
    }

    last = m.index + m[0].length;
  }

  if (last < input.length) {
    out += escapeHtml(input.slice(last)).replace(/\n/g, "<br/>");
  }

  return out || escapeHtml(input).replace(/\n/g, "<br/>");
}
