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
  "Remedial",
  "Freshman",
  "Exit Exam",
  "GAT",
] as const;

type EducationLevel = (typeof EDUCATION_LEVELS)[number];

function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [educationLevel, setEducationLevel] = useState<EducationLevel | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successContact, setSuccessContact] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setError("First name and last name are required.");
      setLoading(false);
      return;
    }
    if (!educationLevel) {
      setError("Please select your educational level.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    let authEmail: string;
    let phone: string | null;
    let displayContact: string;
    try {
      ({ email: authEmail, phone, displayContact } = authEmailFromIdentifier(identifier));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or phone.");
      setLoading(false);
      return;
    }

    const fullName = `${fn} ${ln}`.trim();
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const { data, error: signErr } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: fn,
          last_name: ln,
          phone: phone,
          education_level: educationLevel,
          contact_display: displayContact,
        },
        emailRedirectTo: phone || !origin ? undefined : `${origin}/auth/callback`,
      },
    });

    if (signErr) {
      setError(signErr.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: phone ? null : authEmail,
            phone: phone,
            full_name: fullName,
            first_name: fn,
            last_name: ln,
            education_level: educationLevel,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch {
        /* non-blocking */
      }
    }

    setSuccessContact(displayContact);
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    const isPhone = !looksLikeEmail(successContact);
    return (
      <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 sm:py-16 pb-44 overflow-y-auto">
        <div className="w-full max-w-md text-center">
          <div className="bg-wisdom-card border border-white/5 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isPhone ? "Account created" : "Check your email"}
            </h2>
            <p className="text-wisdom-muted mb-6">
              {isPhone ? (
                <>
                  Your Academy account for <strong className="text-white">{successContact}</strong> is
                  ready. Sign in with your phone number and password.
                </>
              ) : (
                <>
                  We sent a confirmation link to{" "}
                  <strong className="text-white">{successContact}</strong>. Confirm, then sign in.
                </>
              )}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-wisdom-dark font-semibold hover:bg-cyan-300 transition-colors"
            >
              Go to Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder:text-white/35";
  const labelClass = "block text-sm font-medium mb-2 text-white/90";

  return (
    <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 sm:py-16 pb-44 sm:pb-16 overflow-y-auto">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-wisdom-dark mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Academy account</h1>
          <p className="text-wisdom-muted text-sm sm:text-base">
            Register with email or phone — no Google required
          </p>
        </div>

        <div className="bg-wisdom-card border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300/90 mb-5">
            Account information
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                  <input
                    type="text"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Email or phone number</label>
              <div className="relative">
                {identifier.includes("@") ? (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                )}
                <input
                  type="text"
                  required
                  autoComplete="username"
                  inputMode="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder="you@email.com or 09xxxxxxxx"
                />
              </div>
              <p className="mt-1.5 text-xs text-wisdom-muted">
                Use the same email or phone when you sign in later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                    placeholder="Min. 8 characters"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wisdom-muted hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                    placeholder="Repeat password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wisdom-muted hover:text-white"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Educational level</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLevelOpen((o) => !o)}
                  className={`${inputClass} flex items-center gap-2 text-left cursor-pointer`}
                  aria-haspopup="listbox"
                  aria-expanded={levelOpen}
                >
                  <GraduationCap className="w-5 h-5 text-wisdom-muted shrink-0" />
                  <span className={educationLevel ? "text-white" : "text-white/35"}>
                    {educationLevel || "Select level…"}
                  </span>
                  <ChevronDown
                    className={`ml-auto w-4 h-4 text-wisdom-muted transition ${
                      levelOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {levelOpen && (
                  <ul
                    role="listbox"
                    className="absolute z-30 mt-2 w-full max-h-56 overflow-y-auto rounded-xl border border-white/12 bg-[#121c2e] shadow-2xl py-1"
                  >
                    {EDUCATION_LEVELS.map((level) => (
                      <li key={level}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={educationLevel === level}
                          onClick={() => {
                            setEducationLevel(level);
                            setLevelOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition ${
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

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
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
