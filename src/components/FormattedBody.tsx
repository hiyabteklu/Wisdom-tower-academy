"use client";

import { simpleMarkdownToHtml } from "@/lib/format-content";

type Props = {
  text: string;
  className?: string;
};

/** Renders admin Markdown / plain text with real line breaks and light formatting. */
export default function FormattedBody({ text, className = "" }: Props) {
  const html = simpleMarkdownToHtml(text);
  if (!html) return null;
  return (
    <div
      className={`formatted-body text-[15px] leading-relaxed text-wisdom-muted ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
