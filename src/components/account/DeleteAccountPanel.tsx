"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Trash2 } from "lucide-react";
import { supabase, recoverSession, STORAGE_KEY } from "@/lib/supabase";

type Phase = "checking" | "signed-out" | "ready" | "deleting" | "done";

/**
 * Self-service account deletion for the public /delete-account page.
 * Sends the signed-in student's access token to POST /api/account/delete.
 */
export default function DeleteAccountPanel() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await recoverSession();
      if (cancelled) return;
      if (session?.access_token) {
        setToken(session.access_token);
        setEmail(session.user?.email ?? "");
        setPhase("ready");
      } else {
        setPhase("signed-out");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async () => {
    if (confirmText !== "DELETE" || phase !== "ready") return;
    setError(null);
    setPhase("deleting");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(
          data.error ||
            "We could not delete the account right now. Please try again, or write to support@wisdomtower.tech."
        );
        setPhase("ready");
        return;
      }
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        /* the account is already gone; ignore */
      }
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setPhase("done");
    } catch {
      setError("No internet connection. Please check your connection and try again.");
      setPhase("ready");
    }
  };

  if (phase === "checking") {
    return <p className="text-sm text-slate-400">Checking your sign-in…</p>;
  }

  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
        <p className="flex items-center gap-2 font-bold text-emerald-300">
          <Check className="w-4 h-4" />
          Your account has been deleted.
        </p>
        <p className="mt-2 text-slate-200">
          Your profile, study records and sign-in have been removed. You can create a new account at any time.
        </p>
        <Link href="/" className="mt-3 inline-block text-cyan-300 hover:underline">
          Back to the home page →
        </Link>
      </div>
    );
  }

  if (phase === "signed-out") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
        <p className="font-semibold text-white">Sign in to delete your account</p>
        <p className="mt-1">
          For your safety, only the signed-in owner of an account can delete it here.
        </p>
        <Link
          href="/login?next=/delete-account"
          className="mt-3 inline-block rounded-full bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.07] p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-200">
          <p className="font-bold text-rose-200">This cannot be undone.</p>
          <p className="mt-1">
            {email ? (
              <>
                You are signed in as <strong className="text-white">{email}</strong>.{" "}
              </>
            ) : null}
            Deleting the account removes your profile, study progress and sign-in permanently.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs font-semibold text-rose-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="confirm-delete" className="block text-xs font-semibold text-slate-300 mb-1.5">
          Type DELETE to confirm
        </label>
        <input
          id="confirm-delete"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="DELETE"
          className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30"
        />
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={confirmText !== "DELETE" || phase === "deleting"}
        className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {phase === "deleting" ? "Deleting…" : "Delete my account permanently"}
      </button>
    </div>
  );
}
