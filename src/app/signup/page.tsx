"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  looksLikeEmail,
  authEmailFromIdentifier,
} from "@/lib/authIdentity";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Phone,
  ChevronDown,
} from "lucide-react";

const EDUCATION_LEVELS = [
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "Freshman",
  "University",
  "COC",
  "UAT",
  "Other",
];

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [levelOpen, setLevelOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!educationLevel) {
      setError("Please select your education level.");
      return;
    }
    setLoading(true);

    try {
      const identity = authEmailFromIdentifier(identifier);
      const { email, phone } = identity;

      const { error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            education_level: educationLevel,
            phone: phone || null,
          },
        },
      });

      setLoading(false);
      if (signError) {
        setError(signError.message || "Could not create account.");
        return;
      }
      setDone(true);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Could not create account.");
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wisdom-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40";
  const labelClass = "block text-sm font-medium text-white/90 mb-2";

  if (done) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-wisdom-card/80 p-8 text-center">
          <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-sm text-wisdom-muted mb-6">
            We sent a confirmation link if required. You can also try signing in.
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-wisdom-dark"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-sm text-wisdom-muted">Join Wisdom Tower Academy</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 backdrop-blur p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email or phone</label>
              <div className="relative">
                {looksLikeEmail(identifier) ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                )}
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder="you@email.com or 09xxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wisdom-muted"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wisdom-muted"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Education level</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted z-10" />
                <button
                  type="button"
                  onClick={() => setLevelOpen((o) => !o)}
                  className={`${inputClass} pr-10 text-left`}
                >
                  {educationLevel || "Select level"}
                </button>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                {levelOpen && (
                  <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-white/12 bg-[#121c2e] shadow-2xl py-1">
                    {EDUCATION_LEVELS.map((level) => (
                      <li key={level}>
                        <button
                          type="button"
                          onClick={() => {
                            setEducationLevel(level);
                            setLevelOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm ${
                            educationLevel === level
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "text-white/90 hover:bg-white/5"
                          }`}
                        >
                          {level}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <label
              className={`flex items-start gap-3 cursor-pointer select-none rounded-xl border px-3 py-3 transition ${
                agreedToTerms
                  ? "border-cyan-400/40 bg-cyan-500/10"
                  : "border-white/15 bg-white/5"
              }`}
            >
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-white/40 bg-wisdom-dark accent-cyan-400"
              />
              <span className="text-sm text-white/85 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-cyan-300 hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-300 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-cyan-400 text-wisdom-dark font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                "Creating account…"
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-wisdom-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-300 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/25 border-t-cyan-400 animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
