"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShoppingCart,
  Share2,
  BarChart3,
  Users,
  Sparkles,
} from "lucide-react";
import {
  businessServices,
  formatBizPrice,
} from "@/data/business-services";
import {
  addBusinessService,
  getBusinessCart,
  BUSINESS_CART_EVENT,
} from "@/lib/business-cart";

const SERVICE_IMAGES: Record<string, string> = {
  "social-media-management":
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=600&fit=crop&q=80",
  "digital-marketing":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600&fit=crop&q=80",
  seo: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=600&fit=crop&q=80",
  "graphic-design-retainer":
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=600&fit=crop&q=80",
  "website-build":
    "https://images.unsplash.com/photo-1467232004584-a241c7cabb93?w=600&h=600&fit=crop&q=80",
  "website-maintenance":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=600&fit=crop&q=80",
  "content-writing":
    "https://images.unsplash.com/photo-1455390580379-a91bf48e9372?w=600&h=600&fit=crop&q=80",
  "video-photo":
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=600&fit=crop&q=80",
  "virtual-ops":
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=600&fit=crop&q=80",
  "analytics-reporting":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop&q=80",
};

const pillars = [
  {
    icon: ShoppingCart,
    title: "Pick services",
    text: "Marketing, design, web, SEO, content — add what your company needs.",
    color: "text-sky-300 bg-sky-500/15 border-sky-400/30",
  },
  {
    icon: Users,
    title: "We run the team",
    text: "Writers, designers, and managers as one unit — not five scattered freelancers.",
    color: "text-violet-300 bg-violet-500/15 border-violet-400/30",
  },
  {
    icon: LayoutDashboard,
    title: "Your dashboard",
    text: "Posts, results, deliverables, and weekly goals in one live board.",
    color: "text-cyan-300 bg-cyan-500/15 border-cyan-400/30",
  },
];

export default function BusinessRegisterSection() {
  const [cartIds, setCartIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setCartIds(getBusinessCart().map((i) => i.serviceId));
    sync();
    window.addEventListener(BUSINESS_CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BUSINESS_CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <section className="mt-24 md:mt-32" id="register-business">
      {/* Header outside the box — matches Our Services */}
      <div className="text-center mb-10 md:mb-12">
        <p className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-wisdom-cyan mb-4 animate-fade-up">
          <Building2 className="w-4 h-4" />
          For companies
        </p>
        <h2 className="font-display text-4xl sm:text-5xl md:text-[3.25rem] font-extrabold tracking-tight mb-4 leading-[1.1] text-balance">
          <span className="text-gradient-cyan">Register your business?</span>
        </h2>
        <p className="text-wisdom-muted max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-balance">
          Subscribe to the services you need. We assemble the team and put live status — posts,
          progress, analytics — on <strong className="text-white font-semibold">your company dashboard</strong>.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/business/register" className="btn-primary text-base px-8 py-3.5">
            Register business
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/business/cart" className="btn-secondary text-base px-6 py-3.5">
            <ShoppingCart className="w-5 h-5" />
            Cart{cartIds.length > 0 ? ` (${cartIds.length})` : ""}
          </Link>
        </div>
      </div>

      {/* Content box */}
      <div className="relative rounded-[1.75rem] border border-white/12 bg-wisdom-card/90 overflow-hidden shadow-card-3d">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-wisdom-cyan/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-500/15 blur-[90px]" />
        </div>

        <div className="relative p-6 sm:p-8 md:p-10">
          {/* Flow pillars */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/12 bg-black/30 p-5 sm:p-6 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${p.color}`}
                >
                  <p.icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-1">
                  Step {i + 1}
                </p>
                <h3 className="font-display text-xl font-bold text-white mb-2">{p.title}</h3>
                <p className="text-base text-wisdom-muted leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-wisdom-cyan" />
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Popular subscriptions
              </h3>
            </div>
            <p className="text-sm text-wisdom-muted">Tap to add · finish on register</p>
          </div>

          {/* 1:1 image cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {businessServices.slice(0, 6).map((svc) => {
              const inCart = cartIds.includes(svc.id);
              const img =
                SERVICE_IMAGES[svc.id] ||
                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=600&fit=crop&q=80";
              return (
                <div
                  key={svc.id}
                  className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                    inCart
                      ? "border-wisdom-cyan/50 shadow-glow"
                      : "border-white/10 hover:border-wisdom-cyan/35"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-wisdom-dark">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wisdom-dark via-wisdom-dark/40 to-transparent" />
                    {inCart && (
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold px-2 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Added
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-cyan/90">
                        {svc.category}
                      </p>
                      <h4 className="font-semibold text-sm sm:text-base text-white leading-snug line-clamp-2">
                        {svc.name}
                      </h4>
                    </div>
                  </div>
                  <div className="p-3 bg-wisdom-dark/90 border-t border-white/8 flex flex-col gap-2 flex-1">
                    <p className="text-xs font-semibold text-wisdom-cyan">
                      {formatBizPrice(svc.priceFromEtb, svc.billing)}
                    </p>
                    <button
                      type="button"
                      disabled={inCart}
                      onClick={() => addBusinessService(svc.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${
                        inCart
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-wisdom-cyan text-wisdom-dark hover:bg-wisdom-cyan-dark"
                      }`}
                    >
                      {inCart ? "In cart" : "Add to cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 px-5 py-5">
            <div className="flex flex-wrap items-center gap-5 text-sm text-wisdom-muted">
              <span className="inline-flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" /> Social status
              </span>
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" /> Live analytics
              </span>
              <span className="inline-flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-wisdom-cyan" /> Goals & drafts
              </span>
            </div>
            <Link href="/business/register" className="btn-primary shrink-0">
              Full catalog & register
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
