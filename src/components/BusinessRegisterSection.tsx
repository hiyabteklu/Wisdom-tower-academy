"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  Share2,
  BarChart3,
  Users,
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

const pillars = [
  {
    icon: ShoppingCart,
    title: "Pick services",
    text: "Marketing, design, web, SEO, content — add what your company needs to the cart.",
  },
  {
    icon: Users,
    title: "We run the team",
    text: "Writers, designers, SM managers, and ops work as one unit — not five fragmented freelancers.",
  },
  {
    icon: LayoutDashboard,
    title: "Your dashboard",
    text: "Track posts, results, deliverables, and weekly goals in one place after we approve scope.",
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
    <section className="mt-20 md:mt-28" id="register-business">
      <div className="relative rounded-[1.75rem] border border-wisdom-cyan/25 bg-gradient-to-br from-wisdom-cyan/[0.08] via-wisdom-card to-violet-500/[0.06] overflow-hidden shadow-card-3d">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-wisdom-cyan/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-8 md:p-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-wisdom-cyan mb-3">
                <Building2 className="w-3.5 h-3.5" />
                For companies
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight mb-3 leading-[1.15]">
                Register your business?
              </h2>
              <p className="text-wisdom-muted text-base md:text-lg leading-relaxed">
                Subscribe to the services you need. We assemble the team, deliver the work, and put
                live status — posts, progress, analytics — on{" "}
                <strong className="text-white/90">your company dashboard</strong>. One partner instead
                of a scattered stack of freelancers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/business/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold hover:bg-wisdom-cyan-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20"
              >
                Register business
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/business/cart"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/15 text-sm font-semibold text-white/90 hover:bg-white/5 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart{cartIds.length > 0 ? ` (${cartIds.length})` : ""}
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-wisdom-cyan/15 border border-wisdom-cyan/25 flex items-center justify-center text-wisdom-cyan mb-3">
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">{p.title}</h3>
                <p className="text-sm text-wisdom-muted leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-wisdom-cyan" />
            <h3 className="font-semibold text-white">Popular subscriptions</h3>
            <span className="text-xs text-wisdom-muted">Add to cart · finalize on register</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {businessServices.slice(0, 6).map((svc) => {
              const inCart = cartIds.includes(svc.id);
              return (
                <div
                  key={svc.id}
                  className="rounded-2xl border border-white/10 bg-wisdom-dark/50 p-4 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted">
                        {svc.category}
                      </p>
                      <h4 className="font-semibold text-white text-sm leading-snug">{svc.name}</h4>
                    </div>
                    {inCart && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-wisdom-muted line-clamp-2 mb-3 flex-1">{svc.description}</p>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-[11px] font-semibold text-wisdom-cyan">
                      {formatBizPrice(svc.priceFromEtb, svc.billing)}
                    </span>
                    <button
                      type="button"
                      disabled={inCart}
                      onClick={() => addBusinessService(svc.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        inCart
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/5 text-white border border-white/12 hover:border-wisdom-cyan/40 hover:text-wisdom-cyan"
                      }`}
                    >
                      {inCart ? "In cart" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-wisdom-muted">
              <span className="inline-flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-sky-400" /> Social status
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-violet-400" /> Live analytics
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-wisdom-cyan" /> Goals & drafts
              </span>
            </div>
            <Link
              href="/business/register"
              className="text-sm font-semibold text-wisdom-cyan hover:text-cyan-300 inline-flex items-center gap-1"
            >
              See full catalog & register
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
