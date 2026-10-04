"use client";

import BrandLogo from "@/components/BrandLogo";
import BrandLoader from "@/components/BrandLoader";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authEmailFromIdentifier } from "@/lib/authIdentity";
import {
  ACADEMIC_LEVEL_OPTIONS,
  getDefaultPackagesForAcademicLevel,
  STORAGE_ENROLLED_COURSES,
} from "@/lib/academic-levels";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  ChevronDown,
  Check,
} from "lucide-react";

const EDUCATION_LEVEL_OPTIONS = ACADEMIC_LEVEL_OPTIONS;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next =
    rawNext &&
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.startsWith("/login") &&
    !rawNext.startsWith("/signup")
      ? rawNext
      : "/account";

  const requestedMode = searchParams.get("mode");
  const [mode, setMode] = useState<"signin" | "signup">(
    requestedMode === "signup" ? "signup" : "signin"
  );
  const [identifier, setIdentifier] = useState(searchParams.get("identifier") || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [educationLevel, setEducationLevel] = useState("Freshman");
  const [customEducationLevel, setCustomEducationLevel] = useState("");
  const [levelPickerOpen, setLevelPickerOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    // Check if redirected from registration because account already exists
    const notice = searchParams.get("notice");
    const idParam = searchParams.get("identifier");
    if (idParam && !identifier) {
      setIdentifier(idParam);
    }
    if (notice === "exists") {
      setMode("signin");
      setSuccessMsg(
        "An account with this email/phone already exists. Please enter your password to sign in."
      );
    }
  }, [searchParams, identifier]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled && session?.user) {
        router.replace(next.startsWith("/") ? next : "/account");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setIsRateLimited(false);
    setLoading(true);

    const id = identifier.trim();
    if (!id) {
      setError("Please enter your email or phone number.");
      setLoading(false);
      return;
    }

    let authEmail = id;
    let phoneNumber: string | null = null;

    try {
      const identity = authEmailFromIdentifier(id);
      authEmail = identity.email;
      phoneNumber = identity.phone;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or phone format.");
      setLoading(false);
      return;
    }

    // SIGN IN FLOW
    if (mode === "signin") {
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      setLoading(false);
      if (signError) {
        const msg = signError.message || "Sign in failed.";
        if (msg.toLowerCase().includes("rate limit") || (signError as unknown as { status: number }).status === 429) {
          setIsRateLimited(true);
          setError("Sign in is temporarily busy. Please wait a moment and try again.");
        } else if (
          msg.toLowerCase().includes("invalid login credentials") ||
          msg.toLowerCase().includes("user not found")
        ) {
          setError("Incorrect password or account not found. If you don't have an account, create one below.");
        } else {
          setError(msg);
        }
        return;
      }

      router.replace(next.startsWith("/") ? next : "/account");
      router.refresh();
      return;
    }

    // CREATE ACCOUNT FLOW
    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your full legal name.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const finalEducationLevel =
        educationLevel === "Other"
          ? customEducationLevel.trim() || "Other"
          : educationLevel;

      const defaultPackages = getDefaultPackagesForAcademicLevel(finalEducationLevel);
      const saveLearningDefaults = () => {
        try {
          localStorage.setItem(
            STORAGE_ENROLLED_COURSES,
            JSON.stringify(defaultPackages)
          );
          localStorage.setItem("wt_academic_level", finalEducationLevel);
        } catch {
          /* ignore */
        }
      };

      try {
        // First try server-side pre-confirmed registration to avoid Supabase email rate limits
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authEmail,
            password,
            fullName: fullName.trim(),
            educationLevel: finalEducationLevel,
            phone: phoneNumber,
          }),
        });

        const regData = await regRes.json();

        if (regRes.ok) {
          saveLearningDefaults();
          // Immediately sign the student in with the newly confirmed credentials
          const { error: autoSignInErr } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password,
          });

          setLoading(false);
          if (!autoSignInErr) {
            setSuccessMsg("Account created and verified! Welcome to Wisdom Tower Academy.");
            setTimeout(() => {
              router.replace(next.startsWith("/") ? next : "/account");
              router.refresh();
            }, 600);
            return;
          }
          setSuccessMsg("Account created! Please enter your password to sign in.");
          setMode("signin");
          return;
        }

        if (
          regData.code === "user_already_exists" ||
          regData.error?.toLowerCase().includes("already registered") ||
          regData.error?.toLowerCase().includes("already exists")
        ) {
          setLoading(false);
          // Automatically take them to login mode with clear notice
          setMode("signin");
          setError("");
          setSuccessMsg("An account with this email/phone already exists. Please enter your password to sign in.");
          return;
        }

        // Fallback to client signUp
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              education_level: finalEducationLevel,
              phone: phoneNumber,
            },
          },
        });

        setLoading(false);

        if (signUpError) {
          const msg = signUpError.message || "Account creation failed.";
          if (
            msg.toLowerCase().includes("already registered") ||
            msg.toLowerCase().includes("already exists")
          ) {
            // Automatically take them to login mode with clear notice
            setMode("signin");
            setError("");
            setSuccessMsg("An account with this email/phone already exists. Please enter your password to sign in.");
            return;
          }

          if (
            msg.toLowerCase().includes("rate limit") ||
            msg.toLowerCase().includes("over_email_send_rate_limit") ||
            (signUpError as unknown as { status: number }).status === 429
          ) {
            setIsRateLimited(true);
            setError("Account registration is temporarily busy. Please wait a minute or try signing in.");
          } else {
            setError(msg);
          }
          return;
        }

        saveLearningDefaults();

        if (signUpData.session) {
          setSuccessMsg("Account created successfully! Redirecting...");
          setTimeout(() => {
            router.replace(next.startsWith("/") ? next : "/account");
            router.refresh();
          }, 800);
        } else {
          setSuccessMsg("Account registered! You can now sign in with your credentials.");
          setMode("signin");
        }
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Account registration failed. Please try again.");
      }
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/25 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm font-medium transition-all shadow-inner";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5";

  return (
    <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size={60} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Wisdom Tower Academy
          </h1>
        </div>

        {/* Navigation Switch Notice Banner */}
        {mode === "signin" ? (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-between gap-3 text-xs shadow-sm">
            <span className="text-slate-200">
              Don&apos;t have an account? <span className="font-semibold text-white">Create a free account.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccessMsg("");
              }}
              className="shrink-0 px-3.5 py-1.5 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all shadow-sm cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-between gap-3 text-xs shadow-sm">
            <span className="text-slate-200">
              Already have an account? <span className="font-semibold text-white">Log in here.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccessMsg("");
              }}
              className="shrink-0 px-3.5 py-1.5 rounded-xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-sm cursor-pointer"
            >
              Log In
            </button>
          </div>
        )}

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/25 bg-gradient-to-b from-[#131f38] via-[#0e172a] to-[#0a101d] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Top radiant highlight */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-amber-300 to-sky-400" />

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/90 border border-white/20 mb-6 gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-3 px-4 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "signin"
                  ? "bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,224,255,0.45)] ring-1 ring-white/50"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-3 px-4 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "signup"
                  ? "bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.45)] ring-1 ring-white/50"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Signup */}
            {mode === "signup" && (
              <div>
                <label className={labelClass}>Full Legal Name</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Abebe Bikila"
                    autoFocus={mode === "signup"}
                  />
                </div>
              </div>
            )}

            {/* Email or Phone */}
            <div>
              <label className={labelClass}>Email or Phone Number</label>
              <div className="relative">
                {identifier.includes("@") ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                ) : (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                )}
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder="name@email.com or 09xxxxxxxx"
                  autoFocus={mode === "signin"}
                />
              </div>
            </div>

            {/* Academic Level for Signup */}
            {mode === "signup" && (
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Academic Level</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLevelPickerOpen((prev) => !prev)}
                      className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-950/90 border border-white/25 text-white text-left text-sm font-medium transition-all shadow-inner hover:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{educationLevel || "Select Academic Level"}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          levelPickerOpen ? "rotate-180 text-cyan-300" : ""
                        }`}
                      />
                    </button>
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300 pointer-events-none" />

                    {levelPickerOpen && (
                      <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-white/20 bg-[#0c1527] shadow-[0_15px_35px_rgba(0,0,0,0.85)] py-1.5 max-h-60 overflow-y-auto backdrop-blur-xl">
                        {EDUCATION_LEVEL_OPTIONS.map((opt) => {
                          const isSelected = educationLevel === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setEducationLevel(opt);
                                setLevelPickerOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "text-slate-200 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-4 h-4 text-cyan-300 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* If 'Other' is selected, ask them to write it */}
                {educationLevel === "Other" && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className={labelClass}>Please specify your academic level</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={customEducationLevel}
                        onChange={(e) => setCustomEducationLevel(e.target.value)}
                        className={inputClass}
                        placeholder="e.g. Master's, College Diploma, Self-learner..."
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Password
                </label>
                {mode === "signin" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-cyan-300 hover:text-cyan-200 hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Signup */}
            {mode === "signup" && (
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Terms Agreement Checkbox - only shown on signup */}
            {mode === "signup" && (
              <label
                className={`flex items-start gap-3 cursor-pointer select-none rounded-2xl border px-3.5 py-3 transition-colors ${
                  agreedToTerms
                    ? "border-amber-400/40 bg-amber-500/10"
                    : "border-white/15 bg-white/[0.02]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/40 bg-slate-900 accent-amber-400"
                />
                <span className="text-xs text-slate-200 leading-relaxed font-medium">
                  I agree to the{" "}
                  <Link href="/terms" className="text-amber-300 font-bold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-amber-300 font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}

            {/* Error Display with intelligent guidance */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold leading-relaxed flex flex-col gap-2.5 shadow-md">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {mode === "signin" &&
                  (error.toLowerCase().includes("incorrect password") ||
                    error.toLowerCase().includes("not found") ||
                    error.toLowerCase().includes("invalid login")) && (
                    <div className="pt-2 border-t border-rose-500/25 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-white/80 font-normal">Need an account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="px-3 py-1.5 rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Create Free Account →
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* Success Display */}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading || (mode === "signup" && !agreedToTerms)}
              className={`w-full py-4 px-6 rounded-2xl text-base font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xl ${
                mode === "signin"
                  ? "bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(34,224,255,0.45)] ring-2 ring-cyan-400/60"
                  : "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.45)] ring-2 ring-amber-400/60"
              } active:scale-[0.98] disabled:opacity-50`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </span>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to Academy" : "Create Account"}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto"
          data-wta-spinner="true"
        >
          <BrandLoader size="md" label="Loading security portal..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
