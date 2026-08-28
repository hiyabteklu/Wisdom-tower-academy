"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Building2,
} from "lucide-react";
import { formatBizPrice, type BusinessService } from "@/data/business-services";
import {
  getBusinessCartServices,
  removeBusinessService,
  BUSINESS_CART_EVENT,
} from "@/lib/business-cart";

export default function BusinessCartPage() {
  const [items, setItems] = useState<BusinessService[]>([]);
  const [ready, setReady] = useState(false);

  function sync() {
    setItems(getBusinessCartServices());
    setReady(true);
  }

  useEffect(() => {
    sync();
    window.addEventListener(BUSINESS_CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BUSINESS_CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="relative min-h-[70vh] py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-wisdom-cyan mb-1">
          Business cart
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white mb-2">Service cart</h1>
        <p className="text-sm text-wisdom-muted mb-8">
          Subscription and project services for your company registration.
        </p>

        {!ready ? null : items.length === 0 ? (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card p-10 text-center">
            <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-semibold text-white mb-2">Cart is empty</p>
            <p className="text-sm text-wisdom-muted mb-6">
              Add services from Digital → Register your business.
            </p>
            <Link
              href="/digital#register-business"
              className="inline-flex px-4 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
            >
              Browse business services
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-6">
              {items.map((svc) => (
                <li
                  key={svc.id}
                  className="flex gap-3 rounded-2xl border border-white/12 bg-wisdom-card p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{svc.name}</p>
                    <p className="text-xs text-wisdom-muted">{svc.category}</p>
                    <p className="text-sm font-bold text-wisdom-cyan mt-1">
                      {formatBizPrice(svc.priceFromEtb, svc.billing)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBusinessService(svc.id)}
                    className="p-2 rounded-lg text-wisdom-muted hover:text-rose-400 hover:bg-rose-500/10 h-fit"
                    aria-label={`Remove ${svc.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5 space-y-4">
              <p className="text-xs text-wisdom-muted leading-relaxed">
                Next: register the business and submit this cart for review. Pricing is finalized
                after scope discussion — no charge on submit.
              </p>
              <Link
                href="/business/register"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold hover:bg-wisdom-cyan-dark"
              >
                <Building2 className="w-4 h-4" />
                Continue to register
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
