"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Send, ArrowLeft, CheckCircle2 } from "lucide-react";

function BackButton({ fallback = "/services" }: { fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}

function RequestForm() {
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("service") || "";
  const categoryName = searchParams.get("category") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    details: "",
    budget: "",
    timeline: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setErrorMsg("Configuration error. Please try again later.");
        setStatus("error");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const message = [
        serviceName ? `Service: ${serviceName}` : "",
        categoryName ? `Category: ${categoryName}` : "",
        formData.phone ? `Phone: ${formData.phone}` : "",
        formData.budget ? `Budget: ${formData.budget}` : "",
        formData.timeline ? `Timeline: ${formData.timeline}` : "",
        "",
        formData.details,
      ]
        .filter(Boolean)
        .join("\n");

      const { error } = await supabase.from("inquiries").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        service: serviceName || categoryName || null,
        message: message,
        status: "new",
      });

      if (error) {
        console.error("Insert error:", error);
        setErrorMsg(error.message || "Failed to submit. Please try again.");
        setStatus("error");
        return;
      }

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
        <div className="max-w-md w-full text-center rounded-3xl border border-white/15 bg-wisdom-card p-8 shadow-card-3d animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-wisdom-muted mb-8 leading-relaxed">
            Thank you. We&apos;ve received your request for{" "}
            <strong className="text-white">{serviceName || "this service"}</strong>. We&apos;ll
            contact you within 24 hours with a custom quote.
          </p>
          <BackButton fallback="/services" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 min-h-[80vh]">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <BackButton fallback="/services" />

        {/* Solid bordered panel */}
        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up">
          {/* Header band */}
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-white/10 bg-gradient-to-br from-wisdom-cyan/10 via-transparent to-transparent">
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
              Request a Service
            </h1>
            {serviceName && (
              <div className="inline-flex max-w-full items-center px-3 py-1.5 rounded-lg bg-wisdom-cyan/15 border border-wisdom-cyan/35 text-wisdom-cyan text-sm font-medium mb-2">
                <span className="truncate">{serviceName}</span>
              </div>
            )}
            {categoryName && (
              <p className="text-sm text-wisdom-muted mt-1">Category: {categoryName}</p>
            )}
            <p className="text-sm text-wisdom-muted mt-3 leading-relaxed">
              Pricing is custom based on your project scope. Fill the form and we&apos;ll send you a
              personalized quote.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/90">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field-input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/90">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="field-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/90">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="field-input"
                placeholder="+251..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/90">Project Details *</label>
              <textarea
                required
                rows={4}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="field-input resize-none"
                placeholder="Describe what you need, any requirements, quantity, etc."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Budget (optional)</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="field-input"
                  placeholder="e.g. 2000-5000 ETB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">Timeline (optional)</label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="field-input"
                  placeholder="e.g. 1 week, ASAP"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold text-base
                hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {status === "sending" ? (
                "Submitting..."
              ) : (
                <>
                  Submit Request
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-center text-red-400 text-sm rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                {errorMsg}
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-wisdom-muted mt-6">
          Prefer email?{" "}
          <Link href="/contact" className="text-wisdom-cyan hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">Loading...</div>
      }
    >
      <RequestForm />
    </Suspense>
  );
}
