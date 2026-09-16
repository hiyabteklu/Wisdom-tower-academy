"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Phone } from "lucide-react";

function looksLikeEmail(value: string) {
  return value.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) d = "251" + d.slice(1);
  if (d.startsWith("9") && d.length === 9) d = "251" + d;
  return d;
}

/** Resolve login identifier to the same auth email used at signup. */
function authEmailFromIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (looksLikeEmail(trimmed)) return trimmed.toLowerCase();
  const phone = normalizePhone(trimmed);
  if (phone.length < 9) {
    throw new Error("Enter a valid email or phone number.");
  }
  return `p${phone}@phone.wisdomtower.app`;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const urlError = searchParams.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        const dest =
          next && next.startsWith("/") && !next.startsWith("//") ? next : "/learning";
        router.replace(dest);
        return;
      }

      setChecking(false);

      if (urlError) {
        setError(
          urlError === "oauth"
            ? "Sign-in failed. Use your email or phone and password."
            : decodeURIComponent(urlError)
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, next, urlError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let email: string;
    try {
      email = authEmailFromIdentifier(identifier);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or phone.");
      setLoading(false);
      return;
    }

    const { data, error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signErr) {
      const msg = signErr.message || "";
      if (msg === "Invalid login credentials") {
        setError(
          "Wrong email/phone or password. If you signed up with Google before, use Forgot password (wait if rate-limited) to set a password, or create a new email account."
        );
      } else {
        setError(msg);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      try {
        await ensureProfile(data.user);
      } catch {
        /* non-blocking */
      }
    }

    const dest =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/learning";
    router.push(dest);
    router.refresh();
  };

  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400/25 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder:text-white/35";
  const labelClass = "block text-sm font-medium mb-2 text-white/90";

  return (
    <div className="min-h-[80vh] flex items-start sm:items-center justify-center px-4 py-10 sm:py-16 pb-32 sm:pb-16 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-wisdom-dark mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Student sign in</h1>
          <p className="text-wisdom-muted">Email or phone + password</p>
        </div>

        <div className="bg-wisdom-card border border-white/5 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
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

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-cyan-400 text-wisdom-dark font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-60"
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
            Don't have an account?{" "}
            <Link href="/signup" className="text-cyan-300 hover:underline font-medium">
              Create account
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
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/25 border-t-cyan-400 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
