"use client";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<Size, string> = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

/**
 * Official Wisdom Tower loading mark — logo with pulsing cyan accent.
 * Use as full-screen overlay or inline spinner.
 */
export default function BrandLoader({
  size = "lg",
  label = "Loading…",
  fullScreen = false,
  className = "",
}: {
  size?: Size;
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  const body = (
    <div
      className={`brand-loader flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={`brand-loader-mark relative ${SIZE_MAP[size]}`}>
        <div className="brand-loader-glow" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/brand/logo.png"
          alt=""
          className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
        <span className="brand-loader-cyan-dot" aria-hidden />
      </div>
      {label ? (
        <p className="text-sm text-cyan-300/80 font-medium tracking-wide animate-pulse">
          {label}
        </p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1220]/92 backdrop-blur-sm">
        {body}
      </div>
    );
  }

  return body;
}
