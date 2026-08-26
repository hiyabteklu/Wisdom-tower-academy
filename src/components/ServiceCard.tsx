import Link from "next/link";
import type { Service } from "@/data/services";

type Props = {
  service: Service;
  categoryName: string;
};

export default function ServiceCard({ service, categoryName }: Props) {
  return (
    <Link
      href={`/request?service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(categoryName)}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-wisdom-card hover:border-wisdom-cyan/40 transition-all duration-300 hover:shadow-lg hover:shadow-wisdom-cyan/10 hover:-translate-y-0.5"
    >
      {/* 1:1 image */}
      <div className="relative aspect-square w-full overflow-hidden bg-wisdom-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            const fallback = el.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        {/* Fallback when image not uploaded yet */}
        <div
          className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-wisdom-navy via-wisdom-card to-wisdom-dark"
          style={{ display: "none" }}
          aria-hidden
        >
          <span className="px-2 text-center text-[10px] sm:text-xs text-wisdom-muted leading-tight">
            {service.name}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card/90 via-transparent to-transparent opacity-80 pointer-events-none" />
      </div>

      <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
        <h3 className="text-[11px] sm:text-sm font-medium leading-snug text-white group-hover:text-wisdom-cyan transition-colors line-clamp-3">
          {service.name}
        </h3>
      </div>
    </Link>
  );
}
