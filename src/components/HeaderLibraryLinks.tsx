"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ShoppingBag } from "lucide-react";
import { demoCart } from "@/data/learning";

/** Compact Learning + Cart icons for the top bar */
export default function HeaderLibraryLinks({
  onNavigate,
  size = "md",
}: {
  onNavigate?: () => void;
  size?: "md" | "lg";
}) {
  const pathname = usePathname();
  const cartCount = demoCart.length;
  const icon = size === "lg" ? 22 : 18;
  const pad = size === "lg" ? "p-2" : "p-2";

  const learningActive = pathname.startsWith("/learning");
  const cartActive = pathname.startsWith("/cart");

  return (
    <div className="flex items-center gap-0.5">
      <Link
        href="/learning"
        onClick={onNavigate}
        aria-label="My Learning"
        title="My Learning"
        className={`relative ${pad} rounded-full border transition-all duration-200 ${
          learningActive
            ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
            : "border-transparent text-wisdom-muted hover:text-white hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <BookOpen style={{ width: icon, height: icon }} />
      </Link>
      <Link
        href="/cart"
        onClick={onNavigate}
        aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
        title="Cart"
        className={`relative ${pad} rounded-full border transition-all duration-200 ${
          cartActive
            ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
            : "border-transparent text-wisdom-muted hover:text-white hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <ShoppingBag style={{ width: icon, height: icon }} />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-wisdom-cyan text-[9px] font-bold text-wisdom-dark flex items-center justify-center leading-none ring-2 ring-wisdom-dark">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}
