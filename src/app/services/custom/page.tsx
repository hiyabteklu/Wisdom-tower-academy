"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Send,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  User,
  FileText,
} from "lucide-react";
import { categories } from "@/data/services";

export default function CustomOrderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    lookingFor: "",
    relatedCategory: "",
    goals: "",
    budget: "",
    timeline: "",
    preferredContact: "email",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/digital");
    }
  };

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
        "— Custom order request —",
        formData.organization ? `Organization: ${formData.organization}` : "",
        formData.role ? `Role: ${formData.role}` : "",
        formData.phone ? `Phone: ${formData.phone}` : "",
        formData.preferredContact ? `Preferred contact: ${formData.preferredContact}` : "",
        formData.relatedCategory ? `Closest category: ${formData.relatedCategory}` : "",
        formData.budget ? `Budget: ${formData.budget}` : "",
        formData.timeline ? `Timeline: ${formData.timeline}` : "",
        "",
        "What they need:",
        formData.lookingFor,
        formData.goals ? `\nGoals / success looks like:\n${formData.goals}` : "",
      ]
        .filter((line) => line !== undefined)
        .join("\n");

      const { error } = await supabase.from("inquiries").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        service: "Custom order",
        message,
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
          <h2 className="font-display text-2xl font-bold mb-2">Request received</h2>
          <p className="text-wisdom-muted mb-8 leading-relaxed">
            Thanks — we&apos;ll review what you shared and follow up within about 24 hours with next
            steps or a quote.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-wisdom-cyan hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] py-12 md:py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-wisdom-cyan/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up">
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-white/10 bg-gradient-to-br from-wisdom-cyan/12 via-transparent to-transparent">
            <div className="inline-flex p-2.5 rounded-xl bg-wisdom-cyan/15 border border-wisdom-cyan/30 text-wisdom-cyan mb-4">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
              Custom order
            </h1>
            <p className="text-sm text-wisdom-muted leading-relaxed max-w-lg">
              Not every project matches a catalogue line. Share a bit about you and what you need —
              we&apos;ll respond with a clear path and pricing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-8">
            <fieldset className="space-y-5">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1">
                <User className="w-4 h-4 text-wisdom-cyan" />
                About you
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-white/90">Full name *</label>
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
                  <label className="block text-sm font-medium mb-2 text-white/90">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="field-input"
                    placeholder="+251…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Organization / school
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="field-input"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Your role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="field-input"
                    placeholder="e.g. student, founder, manager"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-white/90">
                    Preferred contact
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "email", label: "Email" },
                      { value: "phone", label: "Phone" },
                      { value: "either", label: "Either" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                          formData.preferredContact === opt.value
                            ? "border-wisdom-cyan/50 bg-wisdom-cyan/10 text-wisdom-cyan"
                            : "border-white/12 text-wisdom-muted hover:border-white/25"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredContact"
                          value={opt.value}
                          checked={formData.preferredContact === opt.value}
                          onChange={() =>
                            setFormData({ ...formData, preferredContact: opt.value })
                          }
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-5 pt-2 border-t border-white/10">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1 pt-5">
                <FileText className="w-4 h-4 text-wisdom-cyan" />
                What you need
              </legend>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  Describe what you&apos;re looking for *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  className="field-input resize-none"
                  placeholder="Be as specific as you can — deliverables, audience, constraints, examples you like…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  Closest service category (optional)
                </label>
                <select
                  value={formData.relatedCategory}
                  onChange={(e) => setFormData({ ...formData, relatedCategory: e.target.value })}
                  className="field-input cursor-pointer"
                >
                  <option value="">Not sure / mixed</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  What does success look like?
                </label>
                <textarea
                  rows={3}
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="field-input resize-none"
                  placeholder="Optional — deadline outcome, quality bar, who will use this"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Budget range</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="field-input"
                    placeholder="e.g. 3,000–8,000 ETB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Timeline</label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="field-input"
                    placeholder="e.g. 2 weeks, by exam week"
                  />
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold text-base
                hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {status === "sending" ? (
                "Submitting…"
              ) : (
                <>
                  Submit custom request
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
          Prefer a listed service?{" "}
          <Link href="/digital" className="text-wisdom-cyan hover:underline">
            Browse categories
          </Link>
          {" · "}
          <Link href="/contact" className="text-wisdom-cyan hover:underline">
            Contact
          </Link>
        </p>
      </div>
    </div>
  );
}
