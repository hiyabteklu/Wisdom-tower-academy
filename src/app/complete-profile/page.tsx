"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  MapPin,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ensureProfile,
  isProfileComplete,
  saveCompletedProfile,
  type AccountIntent,
  type HearAbout,
  type StudyStream,
} from "@/lib/profile";
import type { User as SbUser } from "@supabase/supabase-js";

const STREAMS: { id: StudyStream; label: string; hint: string }[] = [
  { id: "natural", label: "Natural", hint: "Science track" },
  { id: "social", label: "Social", hint: "Social science track" },
  { id: "other", label: "Other", hint: "Mixed / not listed" },
  { id: "not_applicable", label: "N/A", hint: "University or client" },
];

const HEAR: { id: HearAbout; label: string }[] = [
  { id: "telegram", label: "Telegram" },
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "friend", label: "Friend" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "other", label: "Other" },
];

const INTENTS: { id: AccountIntent; label: string; desc: string }[] = [
  {
    id: "student",
    label: "Student",
    desc: "Academy packages & study resources",
  },
  {
    id: "client",
    label: "Client",
    desc: "Digital services for my work or business",
  },
  {
    id: "both",
    label: "Both",
    desc: "I may use Academy and Digital",
  },
];

function chipClass(active: boolean) {
  return `rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
    active
      ? "border-wisdom-cyan/50 bg-wisdom-cyan/15 text-wisdom-cyan shadow-[0_0_0_1px_rgba(0,212,255,0.2)]"
      : "border-white/12 bg-wisdom-dark/40 text-white/70 hover:border-white/25 hover:text-white"
  }`;
}

function CompleteProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [user, setUser] = useState<SbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [townRegion, setTownRegion] = useState("");
  const [stream, setStream] = useState<StudyStream | "">("");
  const [hearAbout, setHearAbout] = useState<HearAbout | "">("");
  const [intent, setIntent] = useState<AccountIntent | "">("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session?.user) {
        router.replace(
          `/login?next=${encodeURIComponent(
            nextParam && nextParam.startsWith("/")
              ? `/complete-profile?next=${encodeURIComponent(nextParam)}`
              : "/complete-profile"
          )}`
        );
        return;
      }

      await ensureProfile(session.user);

      if (isProfileComplete(session.user)) {
        const dest =
          nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
            ? nextParam
            : "/";
        router.replace(dest);
        return;
      }

      const u = session.user;
      setUser(u);
      setFullName(
        (u.user_metadata?.full_name as string) ||
          (u.user_metadata?.name as string) ||
          ""
      );
      setPhone((u.user_metadata?.phone as string) || "");
      setSchoolName((u.user_metadata?.school_name as string) || "");
      setTownRegion((u.user_metadata?.town_region as string) || "");
      setStream((u.user_metadata?.stream as StudyStream) || "");
      setHearAbout((u.user_metadata?.hear_about as HearAbout) || "");
      setIntent((u.user_metadata?.account_intent as AccountIntent) || "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, nextParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!stream) {
      setError("Select your stream (or N/A).");
      return;
    }
    if (!hearAbout) {
      setError("Tell us how you heard about us.");
      return;
    }
    if (!intent) {
      setError("Select what you came for.");
      return;
    }

    setSaving(true);
    const result = await saveCompletedProfile(user, {
      fullName,
      phone,
      schoolName,
      townRegion,
      stream,
      hearAbout,
      intent,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Could not save. Try again.");
      return;
    }

    const dest =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : intent === "client"
          ? "/digital"
          : intent === "student"
            ? "/academy"
            : "/";

    router.replace(dest);
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-wisdom-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark text-wisdom-dark font-bold text-xl mb-4">
            WT
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-2">
            Complete your profile
          </h1>
          <p className="text-wisdom-muted text-sm leading-relaxed max-w-sm mx-auto">
            One short step so we can personalize Academy, verify payments, and
            support you properly.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/12 bg-wisdom-card shadow-card-3d overflow-hidden"
        >
          <div className="px-5 sm:px-7 pt-6 pb-2 space-y-5">
            {/* Intent first — sets tone for the rest */}
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                I'm here mainly as <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INTENTS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIntent(opt.id)}
                    className={`${chipClass(intent === opt.id)} text-left`}
                  >
                    <span className="block">{opt.label}</span>
                    <span className="block text-[11px] font-normal opacity-70 mt-0.5">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Full name <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                  placeholder="As on your ID or school records"
                  maxLength={80}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Phone <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                  placeholder="09… or +251…"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-wisdom-muted">
                Used for payment verification and support — not shared publicly.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                School / university <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                  placeholder="Enter your school or university name"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-wisdom-muted">
                Clients: your company name or "Independent" is fine.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Town / region <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  required
                  value={townRegion}
                  onChange={(e) => setTownRegion(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                  placeholder="e.g. Addis Ababa, Bahir Dar…"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Stream <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STREAMS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStream(s.id)}
                    className={chipClass(stream === s.id)}
                  >
                    {s.label}
                    <span className="block text-[10px] font-normal opacity-60">
                      {s.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                How did you hear about us?{" "}
                <span className="text-wisdom-cyan">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HEAR.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHearAbout(h.id)}
                    className={chipClass(hearAbout === h.id)}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                {error}
              </p>
            )}
          </div>

          <div className="px-5 sm:px-7 py-5 border-t border-white/10 bg-black/20">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark font-bold text-base hover:bg-wisdom-cyan-dark transition-colors disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Complete profile"
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-wisdom-muted leading-relaxed">
              Signed in as {user.email}. You can update details later in Settings.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-wisdom-cyan animate-spin" />
        </div>
      }
    >
      <CompleteProfileInner />
    </Suspense>
  );
}
