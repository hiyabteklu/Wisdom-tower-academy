"use client";

import { useMemo } from "react";
import MathText from "@/components/MathText";

/**
 * Advanced study-content renderer.
 *
 * Markdown-ish + study features:
 *  # / ## / ###  topics & subtopics
 *  > callouts
 *  - / * lists
 *  **bold**, *italic*, `code`
 *  ==highlight== or [[key term]] → amber key-term pills
 *  **KEY:** patterns for definition emphasis
 *  LaTeX via MathText ($...$, $$...$$)
 */

export type TocItem = { id: string; level: number; text: string };

type Props = {
  body: string;
  className?: string;
  onToc?: (items: TocItem[]) => void;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

/** Inline marks → React nodes (string segments + spans) */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Order: [[term]] ==hl== **bold** *italic* `code`
  const pattern =
    /\[\[([^\]]+)\]\]|==([^=]+)==|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <MathText key={`${keyPrefix}-t-${i++}`} text={text.slice(last, m.index)} />
      );
    }
    if (m[1] != null) {
      nodes.push(
        <mark
          key={`${keyPrefix}-k-${i++}`}
          className="key-term"
          title="Key term"
        >
          {m[1]}
        </mark>
      );
    } else if (m[2] != null) {
      nodes.push(
        <mark key={`${keyPrefix}-h-${i++}`} className="hl-term">
          {m[2]}
        </mark>
      );
    } else if (m[3] != null) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-white">
          {m[3]}
        </strong>
      );
    } else if (m[4] != null) {
      nodes.push(
        <em key={`${keyPrefix}-i-${i++}`} className="text-cyan-100/90 italic">
          {m[4]}
        </em>
      );
    } else if (m[5] != null) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.85em] font-mono text-amber-100"
        >
          {m[5]}
        </code>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(<MathText key={`${keyPrefix}-t-${i++}`} text={text.slice(last)} />);
  }
  return nodes.length ? nodes : [<MathText key={`${keyPrefix}-empty`} text={text} />];
}

export default function RichContent({ body, className = "", onToc }: Props) {
  const { blocks, toc } = useMemo(() => parseBlocks(body || ""), [body]);

  // surface TOC once
  useMemo(() => {
    onToc?.(toc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toc]);

  return (
    <article className={`study-prose ${className}`}>
      {blocks.map((b, idx) => {
        if (b.type === "h1") {
          return (
            <h1 key={idx} id={b.id} className="study-h1">
              {renderInline(b.text, `h1-${idx}`)}
            </h1>
          );
        }
        if (b.type === "h2") {
          return (
            <h2 key={idx} id={b.id} className="study-h2">
              <span className="study-h2-bar" aria-hidden />
              {renderInline(b.text, `h2-${idx}`)}
            </h2>
          );
        }
        if (b.type === "h3") {
          return (
            <h3 key={idx} id={b.id} className="study-h3">
              {renderInline(b.text, `h3-${idx}`)}
            </h3>
          );
        }
        if (b.type === "callout") {
          return (
            <aside key={idx} className="study-callout">
              {renderInline(b.text, `co-${idx}`)}
            </aside>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={idx} className="study-list">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it, `li-${idx}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "hr") {
          return <hr key={idx} className="study-hr" />;
        }
        return (
          <p key={idx} className="study-p">
            {renderInline(b.text, `p-${idx}`)}
          </p>
        );
      })}
    </article>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3"; text: string; id: string }
  | { type: "p" | "callout"; text: string }
  | { type: "list"; items: string[] }
  | { type: "hr" };

function parseBlocks(raw: string): { blocks: Block[]; toc: TocItem[] } {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const toc: TocItem[] = [];
  let i = 0;
  let para: string[] = [];

  const flushPara = () => {
    const t = para.join(" ").trim();
    if (t) blocks.push({ type: "p", text: t });
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushPara();
      i++;
      continue;
    }

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushPara();
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const h1 = trimmed.match(/^#\s+(.+)/);
    const h2 = trimmed.match(/^##\s+(.+)/);
    const h3 = trimmed.match(/^###\s+(.+)/);
    if (h1 || h2 || h3) {
      flushPara();
      const text = (h1?.[1] || h2?.[1] || h3?.[1] || "").trim();
      const level = h1 ? 1 : h2 ? 2 : 3;
      const id = slugify(text) || `sec-${toc.length}`;
      const type = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      blocks.push({ type, text, id });
      toc.push({ id, level, text });
      i++;
      continue;
    }

    if (trimmed.startsWith("> ") || trimmed === ">") {
      flushPara();
      const parts: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith(">") || lines[i].trim() === ">")) {
        parts.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "callout", text: parts.join(" ").trim() });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    para.push(trimmed);
    i++;
  }
  flushPara();
  return { blocks, toc };
}
