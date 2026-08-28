"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  Shield,
  Smartphone,
  Building2,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  LogIn,
} from "lucide-react";
import {
  getPackage,
  paymentMethods,
  formatEtb,
  type PaymentMethodId,
} from "@/data/packages";
import {
  generateOrderRef,
  saveOrder,
  uploadPaymentReceipt,
  type ManualOrder,
} from "@/lib/orders";
import { removeFromCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

type ConfirmMode = "receipt" | "details";

function BankLogo({
  src,
  label,
  fallback,
}: {
  src: string;
  label: string;
  fallback: "phone" | "bank";
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return fallback === "phone" ? (
      <Smartphone className="w-7 h-7 text-cyan-400" />
    ) : (
      <Building2 className="w-7 h-7 text-cyan-400" />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="w-8 h-8 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const packageId = String(params.packageId || "");
  const pkg = useMemo(() => getPackage(packageId), [packageId]);

  const [authLoading, setAuthLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [method, setMethod] = useState<PaymentMethodId>("telebirr");
  const [orderRef] = useState(() => generateOrderRef());
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>("receipt");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [txRef, setTxRef] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTx, setSubmittedTx] = useState("");
  const [submittedReceipt, setSubmittedReceipt] = useState<string | undefined>();

  const pay = paymentMethods.find((m) => m.id === method)!;
  const loginHref = `/login?next=${encodeURIComponent(`/checkout/${packageId}`)}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        setSignedIn(true);
        setUserId(session.user.id);
        if (session.user.email) setEmail(session.user.email);
        const metaName =
          (session.user.user_metadata?.full_name as string | undefined) ||
          (session.user.user_metadata?.name as string | undefined);
        if (metaName) setName(metaName);
      } else {
        setSignedIn(false);
        setUserId(null);
      }
      setAuthLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function onFilePick(f: File | null) {
    setFile(f);
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!pkg) return;

    if (!signedIn) {
      setError("Please sign in first to submit payment for verification.");
      return;
    }

    if (confirmMode === "receipt") {
      if (!file) {
        setError("Add a screenshot or PDF of your payment receipt.");
        return;
      }
      if (!phone.trim()) {
        setError("Phone is required so we can reach you if needed.");
        return;
      }
    } else {
      if (!name.trim() || !phone.trim() || !txRef.trim()) {
        setError("Name, phone, and transaction reference are required.");
        return;
      }
    }

    setSubmitting(true);
    let receiptUrl: string | undefined;

    if (confirmMode === "receipt" && file) {
      const up = await uploadPaymentReceipt(orderRef, file);
      if (up.error || !up.url) {
        setSubmitting(false);
        setError(
          up.error ||
            "Could not upload receipt. Create a public Storage bucket named payment-receipts in Supabase, or use Type details instead."
        );
        return;
      }
      receiptUrl = up.url;
    }

    const order: ManualOrder = {
      id: orderRef,
      packageId: pkg.id,
      packageName: pkg.name,
      amountEtb: pkg.priceEtb,
      status: "pending_verification",
      paymentMethod: method,
      studentName: name.trim() || "Receipt upload",
      phone: phone.trim(),
      email: email.trim() || undefined,
      transactionRef:
        confirmMode === "receipt"
          ? txRef.trim() || `RECEIPT:${file?.name || "upload"}`
          : txRef.trim(),
      note:
        confirmMode === "receipt"
          ? [note.trim(), file ? `Attached: ${file.name}` : ""].filter(Boolean).join(" · ") ||
            undefined
          : note.trim() || undefined,
      receiptUrl,
      createdAt: new Date().toISOString(),
      userId,
    };

    const result = await saveOrder(order);
    removeFromCart(pkg.id);
    setSubmitting(false);
    setSubmittedTx(order.transactionRef);
    setSubmittedReceipt(receiptUrl);

    if (result.error) {
      setError(
        "Saved on this device. If it does not appear in Admin → Payments, contact support with order " +
          orderRef
      );
    }
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

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <Link
          href="/packages"
          className="inline-flex items-center gap-1.5 text-sm text-wisdom-muted hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Packages
        </Link>
        <div className="rounded-3xl border border-white/12 bg-wisdom-card p-8 text-center shadow-card-3d">
          <div className="mx-auto w-14 h-14 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mb-4">
            <LogIn className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Sign in to checkout</h1>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-2">
            <span className="text-white/90 font-medium">{pkg.name}</span> ·{" "}
            {formatEtb(pkg.priceEtb)}
          </p>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-6">
            Create an account or sign in first so we can unlock this package in My Learning after
            payment is verified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={loginHref}
              className="px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
            >
              Sign in
            </Link>
            <Link
              href={`/signup?next=${encodeURIComponent(`/checkout/${packageId}`)}`}
              className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/90"
            >
              Create account
            </Link>
          </div>
        </div>
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
          <h1 className="font-display text-2xl font-bold text-white mb-2">
            Submitted for verification
          </h1>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
            Order <span className="text-white font-mono font-semibold">{orderRef}</span> for{" "}
            <span className="text-white">{pkg.name}</span> ({formatEtb(pkg.priceEtb)}) is pending
            manual confirmation. You'll get access in My Learning after we verify the transfer.
          </p>
          {submittedReceipt ? (
            <p className="text-xs text-wisdom-muted mb-2">
              Receipt uploaded.{" "}
              <a
                href={submittedReceipt}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Open file
              </a>
            </p>
          ) : (
            <p className="text-xs text-wisdom-muted mb-2">Keep your receipt. Reference: {submittedTx}</p>
          )}
          <p className="text-xs text-wisdom-muted mb-6">
            Admin: open <span className="text-cyan-300">/admin</span> → Payments to approve.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/learning"
              className="px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
            >
              Open My Learning
            </Link>
            <Link
              href="/orders"
              className="px-5 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/90"
            >
              My orders
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
              className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0 border border-white/10 bg-wisdom-dark"
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
              <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">
                Order reference
              </p>
              <p className="font-mono text-lg font-bold text-white">{orderRef}</p>
            </div>
            <button
              type="button"
              onClick={() => copyText("ref", orderRef)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/90 hover:bg-white/5"
            >
              {copied === "ref" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy reference
            </button>
          </div>
        </div>

        <h2 className="font-display text-lg font-bold text-white mb-3">1. Pay with</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
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
              <span className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95">
                  <BankLogo
                    src={m.logo}
                    label={m.shortLabel}
                    fallback={m.id === "telebirr" ? "phone" : "bank"}
                  />
                </span>
                {m.shortLabel}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 border border-white/20">
              <BankLogo
                src={pay.logo}
                label={pay.name}
                fallback={pay.id === "telebirr" ? "phone" : "bank"}
              />
            </span>
            <p className="text-sm font-semibold text-white">{pay.name}</p>
          </div>
          <p className="text-xs text-wisdom-muted mb-4">
            Send exactly <span className="text-amber-300 font-semibold">{formatEtb(pkg.priceEtb)}</span>{" "}
            and include order reference <span className="font-mono text-white">{orderRef}</span>.
          </p>

          <div className="rounded-xl bg-wisdom-dark/60 border border-white/10 p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">
              {pay.accountLabel}
            </p>
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

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setConfirmMode("receipt")}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border ${
              confirmMode === "receipt"
                ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
                : "border-white/10 text-wisdom-muted hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload receipt
          </button>
          <button
            type="button"
            onClick={() => setConfirmMode("details")}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border ${
              confirmMode === "details"
                ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100"
                : "border-white/10 text-wisdom-muted hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            Type details
          </button>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/12 bg-wisdom-card p-5 sm:p-6 space-y-4"
        >
          {confirmMode === "receipt" ? (
            <>
              <p className="text-sm text-wisdom-muted">
                Fastest path: upload a <span className="text-white/90">screenshot or PDF</span> of
                the SMS / bank receipt. No transaction ID needed.
              </p>

              <label className="block">
                <span className="text-xs text-wisdom-muted">Receipt photo or PDF *</span>
                <div className="mt-1">
                  {!file ? (
                    <label className="flex flex-col items-center justify-center gap-2 min-h-[120px] rounded-xl border border-dashed border-white/20 bg-wisdom-dark/40 px-4 py-6 cursor-pointer hover:border-cyan-400/40 hover:bg-wisdom-dark/60 transition-colors">
                      <ImageIcon className="w-8 h-8 text-cyan-400/80" />
                      <span className="text-sm text-white/85 font-medium">Tap to choose file</span>
                      <span className="text-[11px] text-wisdom-muted">
                        JPG, PNG, WebP or PDF · max 8 MB
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={(e) => onFilePick(e.target.files?.[0] || null)}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-3">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="w-8 h-8 text-cyan-400 shrink-0" />
                      ) : (
                        <FileText className="w-8 h-8 text-amber-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate font-medium">{file.name}</p>
                        <p className="text-[11px] text-wisdom-muted">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onFilePick(null)}
                        className="p-2 rounded-lg border border-white/12 text-wisdom-muted hover:text-white"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
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

              <label className="block">
                <span className="text-xs text-wisdom-muted">Email (from your account)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                  placeholder="you@example.com"
                />
              </label>

              <details className="text-sm">
                <summary className="cursor-pointer text-wisdom-muted hover:text-white text-xs font-medium">
                  Optional: name or extra note
                </summary>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="text-xs text-wisdom-muted">Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                      placeholder="As on your transfer"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-wisdom-muted">Note</span>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                      placeholder="Bank name if Other"
                    />
                  </label>
                </div>
              </details>
            </>
          ) : (
            <>
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
                <span className="text-xs text-wisdom-muted">Email (from your account)</span>
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
            </>
          )}

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex items-start gap-2 text-xs text-wisdom-muted">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              We verify payments manually. Access unlocks after confirmation — not instantly. Keep
              the same account email for My Learning.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-60"
          >
            {submitting
              ? confirmMode === "receipt"
                ? "Uploading & submitting…"
                : "Submitting…"
              : "I’ve paid · Submit for verification"}
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
