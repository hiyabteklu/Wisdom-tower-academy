"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  ShoppingCart,
  Trash2,
  Send,
  User,
} from "lucide-react";
import {
  businessServices,
  formatBizPrice,
  type BusinessService,
} from "@/data/business-services";
import {
  addBusinessService,
  removeBusinessService,
  getBusinessCartServices,
  clearBusinessCart,
  BUSINESS_CART_EVENT,
} from "@/lib/business-cart";
import { supabase } from "@/lib/supabase";

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [cart, setCart] = useState<BusinessService[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    industry: "",
    website: "",
    city: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
    goals: "",
  });

  function syncCart() {
    setCart(getBusinessCartServices());
  }

  useEffect(() => {
    syncCart();
    window.addEventListener(BUSINESS_CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener(BUSINESS_CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    if (cart.length === 0) {
      setErrorMsg("Add at least one service to your cart before submitting.");
      setStatus("error");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const servicesLabel = cart.map((s) => s.name).join(", ");

      // Prefer structured tables; fall back to inquiries if not migrated yet
      const payload = {
        owner_user_id: user?.id ?? null,
        name: form.name.trim(),
        industry: form.industry.trim() || null,
        website: form.website.trim() || null,
        city: form.city.trim() || null,
        contact_name: form.contactName.trim(),
        contact_email: form.contactEmail.trim(),
        contact_phone: form.contactPhone.trim() || null,
        description:
          [form.description.trim(), form.goals.trim() ? `Goals: ${form.goals.trim()}` : ""]
            .filter(Boolean)
            .join("\n\n") || null,
        status: "pending",
      };

      const { data: biz, error: bizErr } = await supabase
        .from("businesses")
        .insert(payload)
        .select("id")
        .single();

      if (bizErr) {
        // Fallback: store as inquiry so nothing is lost
        const { error: inqErr } = await supabase.from("inquiries").insert({
          name: form.contactName.trim(),
          email: form.contactEmail.trim(),
          phone: form.contactPhone.trim() || null,
          service: `Business registration · ${form.name.trim()}`,
          message: [
            `Company: ${form.name.trim()}`,
            form.industry && `Industry: ${form.industry}`,
            form.website && `Website: ${form.website}`,
            form.city && `City: ${form.city}`,
            `Services: ${servicesLabel}`,
            form.description && `About: ${form.description}`,
            form.goals && `Goals: ${form.goals}`,
          ]
            .filter(Boolean)
            .join("\n"),
          status: "new",
        });
        if (inqErr) {
          setErrorMsg(bizErr.message || inqErr.message || "Could not submit. Try again.");
          setStatus("error");
          return;
        }
      } else if (biz?.id) {
        const rows = cart.map((s) => ({
          business_id: biz.id,
          service_id: s.id,
          service_name: s.name,
          billing: s.billing,
          status: "requested",
        }));
        await supabase.from("business_subscriptions").insert(rows);
        try {
          localStorage.setItem("wt_active_business_id", biz.id);
        } catch {
          /* ignore */
        }
      }

      clearBusinessCart();
      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center rounded-3xl border border-white/15 bg-wisdom-card p-8">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Registration received</h2>
          <p className="text-wisdom-muted mb-6 leading-relaxed text-sm">
            We&apos;ll review scope and deliverables with you. Once approved, services move to your{" "}
            <strong className="text-white/90">business dashboard</strong> for live tracking.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold"
            >
              Open dashboard
            </Link>
            <Link href="/digital" className="text-sm text-wisdom-cyan hover:underline">
              Back to Digital
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12 md:py-16 min-h-[80vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/digital#register-business")}
          className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-wisdom-cyan mb-2">
            Business hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Register your business
          </h1>
          <p className="text-wisdom-muted max-w-2xl text-sm leading-relaxed">
            Select services, tell us about the company, and submit. We review, align on scope, then
            activate your dashboard.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Catalog */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-wisdom-cyan" />
              Choose services
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {businessServices.map((svc) => {
                const on = cart.some((c) => c.id === svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => (on ? removeBusinessService(svc.id) : addBusinessService(svc.id))}
                    className={`text-left rounded-2xl border p-4 transition ${
                      on
                        ? "border-wisdom-cyan/45 bg-wisdom-cyan/10"
                        : "border-white/10 bg-wisdom-card hover:border-white/25"
                    }`}
                  >
                    <div className="flex justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-white">{svc.name}</p>
                      {on && <CheckCircle2 className="w-4 h-4 text-wisdom-cyan shrink-0" />}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-wisdom-muted mb-1">
                      {svc.category}
                    </p>
                    <p className="text-xs text-wisdom-muted line-clamp-2 mb-2">{svc.description}</p>
                    <p className="text-[11px] font-semibold text-wisdom-cyan">
                      {formatBizPrice(svc.priceFromEtb, svc.billing)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form + cart summary */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/12 bg-wisdom-card p-5 sm:p-6 space-y-5 sticky top-24"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-2">
                  In cart ({cart.length})
                </p>
                {cart.length === 0 ? (
                  <p className="text-sm text-wisdom-muted">Select services on the left.</p>
                ) : (
                  <ul className="space-y-1.5 mb-2">
                    {cart.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 text-sm text-white/90"
                      >
                        <span className="truncate">{s.name}</span>
                        <button
                          type="button"
                          onClick={() => removeBusinessService(s.id)}
                          className="p-1 text-wisdom-muted hover:text-rose-400"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <fieldset className="space-y-3 border-t border-white/10 pt-4">
                <legend className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                  <Building2 className="w-4 h-4 text-wisdom-cyan" />
                  Company
                </legend>
                <input
                  required
                  placeholder="Business name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field-input"
                />
                <input
                  placeholder="Industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="field-input"
                />
                <input
                  placeholder="Website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="field-input"
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="field-input"
                />
                <textarea
                  rows={2}
                  placeholder="About the business"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="field-input resize-none"
                />
              </fieldset>

              <fieldset className="space-y-3 border-t border-white/10 pt-4">
                <legend className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                  <User className="w-4 h-4 text-wisdom-cyan" />
                  Contact
                </legend>
                <input
                  required
                  placeholder="Your name *"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="field-input"
                />
                <input
                  required
                  type="email"
                  placeholder="Email *"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="field-input"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="field-input"
                />
                <textarea
                  rows={2}
                  placeholder="Goals for the first 30–90 days"
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  className="field-input resize-none"
                />
              </fieldset>

              <button
                type="submit"
                disabled={status === "sending" || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark font-bold text-sm hover:bg-wisdom-cyan-dark disabled:opacity-50 transition"
              >
                {status === "sending" ? "Submitting…" : (
                  <>
                    Submit for review
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {status === "error" && (
                <p className="text-sm text-red-400 text-center">{errorMsg}</p>
              )}

              <p className="text-[11px] text-wisdom-muted text-center leading-relaxed">
                Submitting does not charge a card. We contact you to align scope and pricing before
                anything goes live on the dashboard.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
