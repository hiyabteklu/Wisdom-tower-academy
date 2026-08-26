"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-wisdom-card border border-white/5 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-wisdom-cyan/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-wisdom-cyan" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-wisdom-muted mb-6">
              We sent a password reset link to <strong className="text-white">{email}</strong>.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-wisdom-cyan hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark text-wisdom-dark font-bold text-xl mb-4">
            WT
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset password</h1>
          <p className="text-wisdom-muted">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <div className="bg-wisdom-card border border-white/5 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
                  placeholder="you@example.com"
                />
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-wisdom-muted">
            <Link href="/login" className="inline-flex items-center gap-1 text-wisdom-cyan hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
