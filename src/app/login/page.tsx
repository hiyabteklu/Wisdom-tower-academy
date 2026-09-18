"use client";

import BrandLogo from "@/components/BrandLogo";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setError("");
    setLoading(true);

    const id = identifier.trim();
    let email = id;

    if (!id.includes("@")) {
      const phone = id.replace(/\s+/g, "");
      const { data, error: lookupError } = await supabase.rpc("get_email_by_phone", {
        phone_input: phone,
      });
      if (lookupError || !data) {
        setError("No account found with that phone number.");
        setLoading(false);
        return;
      }
      email = data as string;
    }

    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signError) {
      setError(signError.message || "Sign in failed.");
      return;
    }
    router.replace(next.startsWith("/") ? next : "/account");
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-wisdom-muted focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40";
  const labelClass = "block text-sm font-medium text-white/90 mb-2";

  return (
    <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-wisdom-muted">Sign in to continue learning</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 backdrop-blur p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
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
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/90">Password</label>
                <Link href="/forgot-password" className="text-sm text-cyan-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
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

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/30 bg-wisdom-dark accent-cyan-400"
              />
              <span className="text-xs text-wisdom-muted leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-cyan-300 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-300 hover:underline">
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
                "Signing in…"
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-wisdom-muted">
            No account yet?{" "}
            <Link href="/signup" className="text-cyan-300 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/25 border-t-cyan-400 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
