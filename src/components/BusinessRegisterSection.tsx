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
  Plus,
} from "lucide-react";
import {
  businessPackages,
  formatBizPrice,
  getPackageServices,
  type BusinessPackage,
} from "@/data/business-services";
import {
  addBusinessService,
  getBusinessCart,
  BUSINESS_CART_EVENT,
} from "@/lib/business-cart";

/** 4 package covers — public/images/digital/business/{packageId}.jpg */
const pkgImage = (id: string) => `/images/digital/business/${id}.jpg`;

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
    text: "Pick packages or individual lines below. We deliver under a clear agreement — not scattered freelancers.",
  },
  {
    n: 3,
    icon: Handshake,
    title: "We align, then run it",
    text: "We review scope, confirm pricing and cadence, and assemble the team as one unit.",
  },
  {
    n: 4,
    icon: LayoutDashboard,
    title: "Your live dashboard",
    text: "Track posts, progress, deliverables, and goals. Send feedback or recommendations anytime.",
  },
];

function PackageCard({
  pkg,
  cartIds,
}: {
  pkg: BusinessPackage;
  cartIds: string[];
}) {
  const services = getPackageServices(pkg);
  const allInCart =
    services.length > 0 && services.every((s) => cartIds.includes(s.id));
  const someInCart = services.some((s) => cartIds.includes(s.id));

  const addAll = () => {
    services.forEach((s) => addBusinessService(s.id));
  };

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-wisdom-card transition-all duration-300 ${
        allInCart
          ? "border-wisdom-cyan/45 shadow-[0_0_0_1px_rgba(34,224,255,0.2)]"
          : "border-white/12 hover:border-wisdom-cyan/30"
      }`}
    >
      {/* 16:9 package image */}
      <div className="relative aspect-video overflow-hidden bg-wisdom-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkgImage(pkg.id)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a101c]/95 via-[#0a101c]/35 to-transparent" />
        {(allInCart || someInCart) && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 text-white text-[11px] font-bold px-2.5 py-1 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {allInCart ? "All in cart" : "Partial"}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-wisdom-cyan/95 mb-1">
            {pkg.category}
          </p>
          <h4 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-snug">
            {pkg.name}
          </h4>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 border-t border-white/8">
        <p className="text-sm text-wisdom-muted leading-relaxed mb-4">{pkg.description}</p>

        {/* Included list */}
        <ul className="space-y-2 mb-4 flex-1">
          {services.map((s) => {
            const inCart = cartIds.includes(s.id);
            return (
              <li
                key={s.id}
                className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-black/25 px-3 py-2.5"
              >
                <button
                  type="button"
                  onClick={() => addBusinessService(s.id)}
                  disabled={inCart}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                    inCart
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-wisdom-cyan/35 bg-wisdom-cyan/10 text-wisdom-cyan hover:bg-wisdom-cyan hover:text-wisdom-dark"
                  }`}
                  aria-label={inCart ? `${s.name} in cart` : `Add ${s.name}`}
                >
                  {inCart ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white leading-snug">{s.name}</p>
                  <p className="text-xs text-wisdom-cyan mt-0.5 font-semibold">
                    {formatBizPrice(s.priceFromEtb, s.billing)}
                  </p>
                </div>
              </li>
            );
          })}
          {pkg.includeNotes?.map((note) => (
            <li
              key={note}
              className="flex items-start gap-2.5 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-2"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
              <p className="text-sm text-wisdom-muted leading-snug">{note}</p>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={allInCart}
          onClick={addAll}
          className={`w-full rounded-xl py-2.5 text-sm font-bold transition ${
            allInCart
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 cursor-default"
              : "bg-wisdom-cyan text-wisdom-dark hover:bg-wisdom-cyan-dark"
          }`}
        >
          {allInCart ? "Package in cart" : "Add all in package"}
        </button>
      </div>
    </div>
  );
}

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
      {/* Explanation */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-wisdom-cyan mb-4">
          <Building2 className="w-4 h-4" />
          For companies
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-[1.12] text-balance">
          Register your business
        </h2>
        <p className="text-wisdom-muted text-base sm:text-lg md:text-xl leading-relaxed text-balance">
          Prefer to{" "}
          <strong className="text-white/95 font-semibold">
            leave marketing, design, web, or ops to us
          </strong>
          ? Register the company, choose a package (or individual lines), and we deliver under a
          clear agreement. You get a{" "}
          <strong className="text-white/95 font-semibold">dedicated dashboard</strong> for status,
          results, and feedback.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-wisdom-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> No charge until scope is agreed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-wisdom-cyan" /> Feedback anytime from the dashboard
          </span>
        </div>
      </div>

      {/* How it works */}
      <div>
        <div className="mb-6 px-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-1">
            How it works
          </p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Four simple steps</h3>
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

      {/* 4 package cards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-1">
              Service packages
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Four packages — pick lines inside each
            </h3>
            <p className="mt-1.5 text-sm text-wisdom-muted max-w-xl">
              Add individual services or the whole package. Finish on the registration form; we
              confirm agreement before anything goes live.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {businessPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} cartIds={cartIds} />
          ))}
        </div>
      </div>

      {/* Next step CTA */}
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
              Open the form with your cart, submit company details, and we&apos;ll review. After
              approval, services appear on{" "}
              <strong className="text-white/90">your dashboard</strong> so you can follow progress
              and leave feedback.
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
          <div className="flex flex-col gap-3">
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
