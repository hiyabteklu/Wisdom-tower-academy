"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Send, ArrowLeft, CheckCircle2 } from "lucide-react";

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
      ].filter(Boolean).join("\n");

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
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-wisdom-card border border-white/5 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-wisdom-muted mb-6">
            Thank you. We&apos;ve received your request for <strong className="text-white">{serviceName || "this service"}</strong>. We&apos;ll contact you within 24 hours with a custom quote.
          </p>
          <Link
            href="/digital"
            className="inline-flex items-center gap-2 text-wisdom-cyan hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/digital"
          className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request a Service</h1>
          {serviceName && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-wisdom-cyan/10 border border-wisdom-cyan/20 text-wisdom-cyan text-sm mb-3">
              {serviceName}
            </div>
          )}
          {categoryName && (
            <p className="text-sm text-wisdom-muted">Category: {categoryName}</p>
          )}
          <p className="text-wisdom-muted mt-3">
            Pricing is custom based on your project scope. Fill the form and we&apos;ll send you a personalized quote.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone (optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="+251..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Details *</label>
            <textarea
              required
              rows={4}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors resize-none"
              placeholder="Describe what you need, any requirements, quantity, etc."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Budget (optional)</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                placeholder="e.g. 2000-5000 ETB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timeline (optional)</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                placeholder="e.g. 1 week, ASAP"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark transition-colors disabled:opacity-60"
          >
            {status === "sending" ? "Submitting..." : (
              <>
                Submit Request
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {status === "error" && (
            <p className="text-center text-red-400 text-sm">{errorMsg}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">Loading...</div>}>
      <RequestForm />
    </Suspense>
  );
}
