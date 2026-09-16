"use client";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<Size, string> = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10 border-[3px]",
  xl: "w-12 h-12 border-[3px]",
};

/** Simple cyan circular spinner for all waiting states */
export default function BrandLoader({
  size = "lg",
  label,
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
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
    >
      <div
        className={`${SIZE_MAP[size]} rounded-full border-cyan-400/25 border-t-cyan-400 animate-spin`}
      />
      {label ? (
        <p className="text-sm text-wisdom-muted font-medium tracking-wide">{label}</p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1220]/90">
        {body}
      </div>
    );
  }

  return body;
}
