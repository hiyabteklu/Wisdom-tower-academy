"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  Send,
  ArrowLeft,
  CheckCircle2,
  User,
  Briefcase,
  FileText,
  Link2,
  Clock,
  Shield,
} from "lucide-react";

function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push("/digital#work-with-us");
      }}
      className="inline-flex items-center gap-2 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Work with us
    </button>
  );
}

const REQUIREMENT_KEYS = [
  { id: "skill", label: "I can show proven skill / portfolio in this area" },
  { id: "detail", label: "I work with attention to detail" },
  { id: "digital", label: "I am digitally literate with the tools of this craft" },
  { id: "discipline", label: "I can meet deadlines reliably" },
  { id: "comms", label: "I communicate clearly and escalate blockers early" },
  { id: "ownership", label: "I take ownership of deliverables" },
] as const;

function ApplyForm() {
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("service") || "";
  const categoryName = searchParams.get("category") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    letter: "",
    portfolio: "",
    experience: "",
    availability: "",
    hoursPerWeek: "",
    heardAbout: "",
  });
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // soft hint if someone lands without service
  }, []);

  const allChecked = REQUIREMENT_KEYS.every((r) => checks[r.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    if (!serviceName || !categoryName) {
      setErrorMsg("Please pick a category and service from the Work with us section first.");
      setStatus("error");
      return;
    }
    if (!allChecked) {
      setErrorMsg("Please confirm all requirements before submitting.");
      setStatus("error");
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        setErrorMsg("Configuration error. Please try again later.");
        setStatus("error");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from("talent_applications").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
        category: categoryName,
        service: serviceName,
        letter_of_interest: formData.letter.trim(),
        portfolio_url: formData.portfolio.trim() || null,
        experience: formData.experience.trim() || null,
        availability: formData.availability.trim() || null,
        hours_per_week: formData.hoursPerWeek.trim() || null,
        heard_about: formData.heardAbout.trim() || null,
        requirements_confirmed: true,
        status: "new",
      });

      if (error) {
        console.error(error);
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
        <div className="max-w-md w-full text-center rounded-3xl border border-white/15 bg-wisdom-card p-8 shadow-card-3d">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Application received</h2>
          <p className="text-wisdom-muted mb-2 leading-relaxed">
            Thanks — we received your application for{" "}
            <strong className="text-white">{serviceName}</strong>
            {categoryName ? (
              <>
                {" "}
                under <strong className="text-white">{categoryName}</strong>
              </>
            ) : null}
            .
          </p>
          <p className="text-sm text-wisdom-muted mb-8">
            If your profile matches, we&apos;ll follow up about next steps (assessment / interview).
          </p>
          <Link
            href="/digital#work-with-us"
            className="inline-flex items-center gap-2 text-sm text-wisdom-cyan hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Digital
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12 md:py-16 min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-wisdom-cyan/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        <BackButton />

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-white/10 bg-gradient-to-br from-wisdom-cyan/12 via-transparent to-transparent">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-wisdom-cyan/90 mb-2">
              Talent application
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
              Apply to contribute
            </h1>
            {(serviceName || categoryName) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categoryName && (
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/12 text-wisdom-muted">
                    {categoryName}
                  </span>
                )}
                {serviceName && (
                  <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-wisdom-cyan/15 border border-wisdom-cyan/35 text-wisdom-cyan">
                    {serviceName}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-wisdom-muted leading-relaxed">
              This is for people who want to <strong className="text-white/90">work with us</strong> —
              not a client service request. Incomplete applications are not reviewed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-8">
            {/* About you */}
            <fieldset className="space-y-4">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1">
                <User className="w-4 h-4 text-wisdom-cyan" />
                About you
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-white/90">Full name *</label>
                  <input
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-white/90">City / location</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="field-input"
                    placeholder="e.g. Addis Ababa"
                  />
                </div>
              </div>
            </fieldset>

            {/* Letter */}
            <fieldset className="space-y-4 pt-2 border-t border-white/10">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1 pt-5">
                <FileText className="w-4 h-4 text-wisdom-cyan" />
                Letter of interest *
              </legend>
              <textarea
                required
                rows={5}
                value={formData.letter}
                onChange={(e) => setFormData({ ...formData, letter: e.target.value })}
                className="field-input resize-none"
                placeholder="Who you are, why this service line, and how you work under pressure…"
              />
            </fieldset>

            {/* Portfolio & experience */}
            <fieldset className="space-y-4 pt-2 border-t border-white/10">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1 pt-5">
                <Link2 className="w-4 h-4 text-wisdom-cyan" />
                Previous work
              </legend>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  Portfolio / samples URL *
                </label>
                <input
                  required
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="field-input"
                  placeholder="https://… (Drive, Behance, GitHub, site…)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  Relevant experience
                </label>
                <textarea
                  rows={3}
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="field-input resize-none"
                  placeholder="Roles, projects, tools, years — brief and concrete"
                />
              </div>
            </fieldset>

            {/* Availability */}
            <fieldset className="space-y-4 pt-2 border-t border-white/10">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1 pt-5">
                <Clock className="w-4 h-4 text-wisdom-cyan" />
                Availability
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">When can you start?</label>
                  <input
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="field-input"
                    placeholder="e.g. immediately, after exams"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/90">Hours / week</label>
                  <input
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                    className="field-input"
                    placeholder="e.g. 10–15"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">How did you hear about us?</label>
                <input
                  value={formData.heardAbout}
                  onChange={(e) => setFormData({ ...formData, heardAbout: e.target.value })}
                  className="field-input"
                  placeholder="Optional"
                />
              </div>
            </fieldset>

            {/* Requirements checklist */}
            <fieldset className="space-y-3 pt-2 border-t border-white/10">
              <legend className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-1 pt-5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Confirm requirements *
              </legend>
              <p className="text-xs text-wisdom-muted mb-2">
                Check each box only if it is true for you.
              </p>
              <ul className="space-y-2">
                {REQUIREMENT_KEYS.map((r) => (
                  <li key={r.id}>
                    <label
                      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 cursor-pointer transition-colors ${
                        checks[r.id]
                          ? "border-emerald-400/40 bg-emerald-500/10"
                          : "border-white/10 bg-wisdom-dark/40 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checks[r.id]}
                        onChange={() => setChecks((c) => ({ ...c, [r.id]: !c[r.id] }))}
                        className="mt-1 rounded border-white/30 text-wisdom-cyan focus:ring-wisdom-cyan"
                      />
                      <span className="text-sm text-white/90 leading-snug">{r.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <button
              type="submit"
              disabled={status === "sending" || !allChecked}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold text-base
                hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {status === "sending" ? (
                "Submitting…"
              ) : (
                <>
                  Submit application
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-center text-red-400 text-sm rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                {errorMsg}
              </p>
            )}

            {!serviceName && (
              <p className="text-center text-amber-300/90 text-sm">
                No service selected.{" "}
                <Link href="/digital#work-with-us" className="underline text-wisdom-cyan">
                  Choose one under Work with us
                </Link>
                .
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-wisdom-muted mt-6 flex items-center justify-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          Looking for a client quote instead?{" "}
          <Link href="/digital" className="text-wisdom-cyan hover:underline">
            Browse services
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">Loading…</div>
      }
    >
      <ApplyForm />
    </Suspense>
  );
}
