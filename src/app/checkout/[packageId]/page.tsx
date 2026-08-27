"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Shield,
  Smartphone,
  Building2,
} from "lucide-react";
import {
  getPackage,
  paymentMethods,
  formatEtb,
  type PaymentMethodId,
} from "@/data/packages";
import { generateOrderRef, saveOrder, type ManualOrder } from "@/lib/orders";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = String(params.packageId || "");
  const pkg = useMemo(() => getPackage(packageId), [packageId]);

  const [method, setMethod] = useState<PaymentMethodId>("telebirr");
  const [orderRef] = useState(() => generateOrderRef());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [txRef, setTxRef] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const pay = paymentMethods.find((m) => m.id === method)!;

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!pkg) return;
    if (!name.trim() || !phone.trim() || !txRef.trim()) {
      setError("Name, phone, and transaction reference are required.");
      return;
    }

    const order: ManualOrder = {
      id: orderRef,
      packageId: pkg.id,
      packageName: pkg.name,
      amountEtb: pkg.priceEtb,
      status: "pending_verification",
      paymentMethod: method,
      studentName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      transactionRef: txRef.trim(),
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    saveOrder(order);
    setDone(true);
  }

  if (!pkg) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-white font-semibold mb-2">Package not found</p>
        <Link href="/packages" className="text-cyan-400 text-sm hover:underline">
          Back to packages
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-3xl border border-emerald-400/30 bg-wisdom-card p-8 text-center shadow-card-3d">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mb-4">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Submitted for verification</h1>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
            Order <span className="text-white font-mono font-semibold">{orderRef}</span> for{" "}
            <span className="text-white">{pkg.name}</span> ({formatEtb(pkg.priceEtb)}) is pending
            manual confirmation. You’ll get access in My Learning after we verify the transfer.
          </p>
          <p className="text-xs text-wisdom-muted mb-6">
            Keep your receipt. Reference: {txRef}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/learning"
              className="px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
            >
              Open My Learning
            </Link>
            <Link
              href="/packages"
              className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/90"
            >
              More packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <Link
          href="/packages"
          className="inline-flex items-center gap-1.5 text-sm text-wisdom-muted hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Packages
        </Link>

        <div className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-card-3d mb-6">
          <div className="flex gap-4 p-5 sm:p-6 border-b border-white/10">
            <div
              className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
              style={{ backgroundImage: `url(${pkg.image})` }}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                Checkout
              </p>
              <h1 className="font-display text-xl font-bold text-white">{pkg.name}</h1>
              <p className="text-2xl font-black text-amber-300 mt-1">{formatEtb(pkg.priceEtb)}</p>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-4 bg-wisdom-dark/40 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">Order reference</p>
              <p className="font-mono text-lg font-bold text-white">{orderRef}</p>
            </div>
            <button
              type="button"
              onClick={() => copyText("ref", orderRef)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/90 hover:bg-white/5"
            >
              {copied === "ref" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy reference
            </button>
          </div>
        </div>

        {/* Payment method picker */}
        <h2 className="font-display text-lg font-bold text-white mb-3">1. Pay with</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                method === m.id
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100"
                  : "border-white/10 bg-wisdom-card text-white/80 hover:border-white/25"
              }`}
            >
              <span className="flex items-center gap-2">
                {m.id === "telebirr" ? (
                  <Smartphone className="w-4 h-4 shrink-0" />
                ) : (
                  <Building2 className="w-4 h-4 shrink-0" />
                )}
                {m.shortLabel}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5 mb-8">
          <p className="text-sm font-semibold text-white mb-1">{pay.name}</p>
          <p className="text-xs text-wisdom-muted mb-4">
            Send exactly <span className="text-amber-300 font-semibold">{formatEtb(pkg.priceEtb)}</span>{" "}
            and include order reference <span className="font-mono text-white">{orderRef}</span>.
          </p>

          <div className="rounded-xl bg-wisdom-dark/60 border border-white/10 p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">{pay.accountLabel}</p>
            <div className="flex items-center justify-between gap-2 mt-1">
              <p className="font-mono text-lg font-bold text-white break-all">{pay.accountValue}</p>
              <button
                type="button"
                onClick={() => copyText("acc", pay.accountValue)}
                className="shrink-0 p-2 rounded-lg border border-white/15 hover:bg-white/5"
                aria-label="Copy account"
              >
                {copied === "acc" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-wisdom-muted" />
                )}
              </button>
            </div>
            <p className="text-xs text-wisdom-muted mt-2">Account name: {pay.accountName}</p>
            <p className="text-[10px] text-amber-400/80 mt-2">
              Placeholder numbers — replace with real Telebirr / CBE details before public launch.
            </p>
          </div>

          <ol className="space-y-2">
            {pay.instructions.map((step, i) => (
              <li key={step} className="flex gap-2 text-sm text-white/85">
                <span className="text-cyan-400 font-bold shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <h2 className="font-display text-lg font-bold text-white mb-3">2. Confirm payment</h2>
        <form onSubmit={submit} className="rounded-2xl border border-white/12 bg-wisdom-card p-5 sm:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs text-wisdom-muted">Full name *</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                placeholder="As on your transfer"
              />
            </label>
            <label className="block">
              <span className="text-xs text-wisdom-muted">Phone (Telebirr / mobile) *</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                placeholder="09…"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-wisdom-muted">Email (optional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-xs text-wisdom-muted">Transaction / receipt ID *</span>
            <input
              required
              value={txRef}
              onChange={(e) => setTxRef(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-cyan-400/50"
              placeholder="From SMS or bank receipt"
            />
          </label>
          <label className="block">
            <span className="text-xs text-wisdom-muted">Note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50 resize-none"
              placeholder="Bank name if Other, or extra detail"
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex items-start gap-2 text-xs text-wisdom-muted">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              We verify payments manually. Access unlocks after confirmation — not instantly. Fake
              references will be rejected.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400 transition-colors"
          >
            I’ve paid · Submit for verification
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-wisdom-muted">
          Questions?{" "}
          <Link href="/contact" className="text-cyan-400 hover:underline">
            Contact us
          </Link>{" "}
          with your order reference.
        </p>
      </div>
    </div>
  );
}
