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
  ChevronDown,
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

const pkgImage = (id: string) => `/images/digital/${id}.jpg`;
/** How-it-works cover — upload public/images/digital/how-it-works.jpg (16:9) */
const HOW_COVER = "/images/digital/how-it-works.jpg";

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
  const [open, setOpen] = useState(false);
  const services = getPackageServices(pkg);
  const allInCart =
    services.length > 0 && services.every((s) => cartIds.includes(s.id));
  const someInCart = services.some((s) => cartIds.includes(s.id));
  const selectedCount = services.filter((s) => cartIds.includes(s.id)).length;

  const addAll = () => {
    services.forEach((s) => addBusinessService(s.id));
  };

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-wisdom-card transition-all duration-300 ${
        allInCart
          ? "border-wisdom-cyan/45 shadow-[0_0_0_1px_rgba(34,224,255,0.15)]"
          : "border-white/12 hover:border-wisdom-cyan/30"
      }`}
    >
      {/* Image — no heavy gradient; light scrim for text only */}
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
        <div className="absolute inset-0 bg-black/30" />
        {(allInCart || someInCart) && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 text-white text-[11px] font-bold px-2.5 py-1 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {allInCart ? "All in cart" : `${selectedCount} selected`}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-wisdom-cyan mb-1"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
          >
            {pkg.category}
          </p>
          <h4
            className="font-display text-xl sm:text-2xl font-extrabold text-white leading-snug"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
          >
            {pkg.name}
          </h4>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 border-t border-white/8">
        <p className="text-sm text-wisdom-muted leading-relaxed">{pkg.description}</p>

        {/* Collapsible service list */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-left transition hover:border-wisdom-cyan/30 hover:bg-black/30"
          aria-expanded={open}
        >
          <span className="text-sm font-semibold text-white">
            {open ? "Hide services" : "Show services"}
            <span className="ml-2 text-xs font-medium text-wisdom-muted">
              ({services.length}
              {pkg.includeNotes?.length ? `+` : ""})
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-wisdom-cyan shrink-0 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
        >
          <div className="overflow-hidden min-h-0">
            <ul className="space-y-2">
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
              className={`mt-3 w-full rounded-xl py-2.5 text-sm font-bold transition ${
                allInCart
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 cursor-default"
                  : "bg-wisdom-cyan text-wisdom-dark hover:bg-wisdom-cyan-dark"
              }`}
            >
              {allInCart ? "Package in cart" : "Add all in package"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorksCover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative block w-full aspect-video overflow-hidden bg-wisdom-navy text-left group"
        aria-expanded={open}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HOW_COVER}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0";
          }}
        />
        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-wisdom-cyan/95 mb-2">
            How it works
          </p>
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-lg">
            Four simple steps
          </h3>
          <p className="mt-3 text-sm text-white/80 max-w-md">
            {open ? "Steps open below" : "Tap to read the path from register to dashboard"}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold shadow-lg shadow-cyan-500/25">
            {open ? "Hide steps" : "Open steps"}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="p-5 sm:p-7 md:p-8 border-t border-white/10 grid sm:grid-cols-2 gap-4">
            {howItWorks.map((step) => (
              <div
                key={step.n}
                className="relative rounded-2xl border border-white/10 bg-black/25 p-5"
              >
                <span className="absolute top-3 right-4 font-display text-3xl font-extrabold text-white/[0.06]">
                  {step.n}
                </span>
                <div className="w-10 h-10 rounded-xl border border-wisdom-cyan/25 bg-wisdom-cyan/10 text-wisdom-cyan flex items-center justify-center mb-3">
                  <step.icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-wisdom-cyan mb-1">
                  Step {step.n}
                </p>
                <h4 className="font-display text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
                  {step.title}
                </h4>
                <p className="text-sm text-wisdom-muted leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
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
    <section className="mt-24 md:mt-32 space-y-12 md:space-y-16" id="register-business">
      {/* Header — task-first, not "register for no reason" */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-wisdom-cyan mb-4">
          <Building2 className="w-4 h-4" />
          For companies
        </p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-[1.12] text-balance">
          Want to leave your tasks to us?
        </h2>
        <p className="text-wisdom-muted text-base sm:text-lg md:text-xl leading-relaxed text-balance">
          Hand off marketing, design, web, or ops. Register once, pick what should run ongoing, and
          follow everything on a{" "}
          <strong className="text-white/95 font-semibold">dedicated dashboard</strong> — status,
          results, and feedback in one place.
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

      {/* How it works — 16:9 cover + expandable steps */}
      <HowItWorksCover />

      {/* Packages */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-1">
              Service packages
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Four packages — open to pick lines
            </h3>
            <p className="mt-1.5 text-sm text-wisdom-muted max-w-xl">
              Expand a card, add what you need, then finish registration.
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

      {/* Next step */}
      <div className="rounded-3xl border border-white/12 bg-wisdom-card p-6 sm:p-8 md:p-10 shadow-card-3d">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wisdom-cyan mb-2">
              Next step
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
              Finish registration
            </h3>
            <p className="text-wisdom-muted text-sm sm:text-base leading-relaxed mb-5">
              Submit company details with your cart. After we align on scope, work shows on{" "}
              <strong className="text-white/90">your dashboard</strong>.
            </p>
            <ul className="space-y-2 text-sm text-wisdom-muted">
              <li className="flex gap-2">
                <Users className="w-4 h-4 text-wisdom-cyan shrink-0 mt-0.5" />
                One coordinated team
              </li>
              <li className="flex gap-2">
                <LayoutDashboard className="w-4 h-4 text-wisdom-cyan shrink-0 mt-0.5" />
                Live status, deliverables, goals
              </li>
              <li className="flex gap-2">
                <MessageSquare className="w-4 h-4 text-wisdom-cyan shrink-0 mt-0.5" />
                Feedback from the dashboard
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
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white hover:border-wisdom-cyan/40 transition"
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
