"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShoppingCart,
  Users,
  MessageSquare,
  ClipboardList,
  Handshake,
  ShieldCheck,
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

/** Local covers — public/images/digital/business/{id}.jpg (16:9) */
const bizImage = (id: string) => `/images/digital/business/${id}.jpg`;

const howItWorks = [
  {
    n: 1,
    icon: Building2,
    title: "Register your company",
    text: "Tell us who you are — name, contact, and what the business does. No card is charged at this step.",
  },
  {
    n: 2,
    icon: ClipboardList,
    title: "Choose the work to leave with us",
    text: "Pick ongoing services from the list (marketing, design, web, ops…). Add what you want handled — we take care of delivery under the agreement.",
  },
  {
    n: 3,
    icon: Handshake,
    title: "We align, then run it",
    text: "We review scope, confirm pricing and cadence, and assemble the team as one unit — not scattered freelancers.",
  },
  {
    n: 4,
    icon: LayoutDashboard,
    title: "Your live dashboard",
    text: "Track posts, progress, deliverables, and goals. Send feedback or recommendations anytime from the same place.",
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
    <section className="mt-24 md:mt-32 space-y-16 md:space-y-20" id="register-business">
      {/* ——— 1. Explanation ——— */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-wisdom-cyan mb-4">
          <Building2 className="w-4 h-4" />
          For companies
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-[1.12] text-balance">
          Register your business
        </h2>
        <p className="text-wisdom-muted text-base sm:text-lg md:text-xl leading-relaxed text-balance">
          Prefer to <strong className="text-white/95 font-semibold">leave marketing, design, web, or ops to us</strong>?
          Register the company, pick the services you want on an ongoing basis, and we deliver under a clear agreement.
          You get a <strong className="text-white/95 font-semibold">dedicated dashboard</strong> for status, results, and feedback — without juggling five freelancers.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-wisdom-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> No charge until scope is agreed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-wisdom-cyan" /> Feedback & recommendations anytime
          </span>
        </div>
      </div>

      {/* ——— 2. How it works (separate from catalog) ——— */}
      <div>
        <div className="flex items-end justify-between gap-4 mb-6 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-1">How it works</p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Four simple steps</h3>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {howItWorks.map((step) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-6 overflow-hidden"
            >
              <span className="absolute top-3 right-4 font-display text-4xl font-extrabold text-white/[0.06] select-none">
                {step.n}
              </span>
              <div className="w-11 h-11 rounded-xl border border-wisdom-cyan/25 bg-wisdom-cyan/10 text-wisdom-cyan flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-wisdom-cyan mb-1">
                Step {step.n}
              </p>
              <h4 className="font-display text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                {step.title}
              </h4>
              <p className="text-sm text-wisdom-muted leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ——— 3. Service catalog (image cards) ——— */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-1">
              Subscription catalog
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Services you can leave with us
            </h3>
            <p className="mt-1.5 text-sm text-wisdom-muted max-w-xl">
              Add what you need to the cart, then finish on the registration form. We confirm agreement before anything goes live.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/business/cart" className="btn-secondary text-sm px-4 py-2.5">
              <ShoppingCart className="w-4 h-4" />
              Cart{cartIds.length > 0 ? ` (${cartIds.length})` : ""}
            </Link>
            <Link href="/business/register" className="btn-primary text-sm px-5 py-2.5">
              Register & submit
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {businessServices.map((svc) => {
            const inCart = cartIds.includes(svc.id);
            return (
              <div
                key={svc.id}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-wisdom-card transition-all duration-300 ${
                  inCart
                    ? "border-wisdom-cyan/45 shadow-[0_0_0_1px_rgba(34,224,255,0.2)]"
                    : "border-white/12 hover:border-wisdom-cyan/30"
                }`}
              >
                <div className="relative aspect-video overflow-hidden bg-wisdom-navy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bizImage(svc.id)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a101c]/90 via-[#0a101c]/25 to-transparent" />
                  {inCart && (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 text-white text-[11px] font-bold px-2.5 py-1 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In cart
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-cyan/95 mb-0.5">
                      {svc.category}
                    </p>
                    <h4 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                      {svc.name}
                    </h4>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5 border-t border-white/8">
                  <p className="text-sm text-wisdom-muted leading-relaxed line-clamp-2 flex-1">
                    {svc.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-wisdom-cyan">
                      {formatBizPrice(svc.priceFromEtb, svc.billing)}
                    </p>
                    <button
                      type="button"
                      disabled={inCart}
                      onClick={() => addBusinessService(svc.id)}
                      className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
                        inCart
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 cursor-default"
                          : "bg-wisdom-cyan text-wisdom-dark hover:bg-wisdom-cyan-dark"
                      }`}
                    >
                      {inCart ? "Added" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ——— 4. Registration / dashboard CTAs (separate) ——— */}
      <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-wisdom-card via-wisdom-card to-[#0e1a2e] p-6 sm:p-8 md:p-10 shadow-card-3d">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-2">
              Next step
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Finish registration
            </h3>
            <p className="text-wisdom-muted text-sm sm:text-base leading-relaxed mb-5">
              Open the form with your cart, submit company details, and we&apos;ll review.
              After approval, services appear on <strong className="text-white/90">your dashboard</strong> so you can follow progress and leave feedback.
            </p>
            <ul className="space-y-2 text-sm text-wisdom-muted mb-6">
              <li className="flex gap-2">
                <Users className="w-4 h-4 text-wisdom-cyan shrink-0 mt-0.5" />
                One coordinated team for the services you selected
              </li>
              <li className="flex gap-2">
                <LayoutDashboard className="w-4 h-4 text-wisdom-cyan shrink-0 mt-0.5" />
                Live board for status, deliverables, and goals
              </li>
              <li className="flex gap-2">
                <MessageSquare className="w-4 h-4 text-wisdom-cyan shrink-0 mt-0.5" />
                Submit feedback or recommendations from the dashboard
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:items-stretch">
            <Link
              href="/business/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-wisdom-cyan px-6 py-4 text-base font-bold text-wisdom-dark hover:bg-wisdom-cyan-dark transition shadow-lg shadow-cyan-500/20"
            >
              Register business
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/business/cart"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white hover:border-wisdom-cyan/40 hover:bg-white/[0.07] transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Review cart{cartIds.length > 0 ? ` (${cartIds.length})` : ""}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-sm font-medium text-wisdom-muted hover:text-wisdom-cyan hover:border-wisdom-cyan/30 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Already registered? Open dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
