"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAccessGrants,
  grantAccess,
  grantAllPackages,
  revokeAccess,
  revokeAllForEmail,
  ALL_PACKAGES_ID,
  type AccessGrant,
} from "@/lib/access-grants";
import { academyPackages } from "@/data/packages";
import {
  KeyRound,
  Plus,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Search,
} from "lucide-react";

type Props = { adminEmail: string };

// Phone layout classes (A14): 44 px targets, no hover-only states, no animation.
const FIELD =
  "mt-1 w-full min-h-[44px] rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white";
const PILL =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold disabled:opacity-50";

export default function AccessGrantsPanel({ adminEmail }: Props) {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState<string>(ALL_PACKAGES_ID);
  const [note, setNote] = useState("Beta access");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAccessGrants();
    if (res.error) {
      setError(
        res.error.includes("relation") || res.error.includes("does not exist")
          ? "Table missing: run docs/access-grants-setup.sql in Supabase SQL Editor."
          : res.error
      );
      setGrants([]);
    } else {
      setGrants(res.grants);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return grants;
    return grants.filter(
      (g) =>
        g.email.includes(q) ||
        g.packageId.toLowerCase().includes(q) ||
        (g.packageName || "").toLowerCase().includes(q) ||
        (g.note || "").toLowerCase().includes(q)
    );
  }, [grants, filter]);

  async function onGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setToast("Email is required");
      return;
    }
    setBusy(true);

    if (packageId === ALL_PACKAGES_ID) {
      const res = await grantAllPackages({
        email,
        grantedBy: adminEmail,
        note: note || "Beta / full access",
      });
      setBusy(false);
      if (!res.ok) {
        setToast(res.error || "Grant failed");
        return;
      }
      setToast(`Granted full access to ${email.trim().toLowerCase()} (${res.count} rows)`);
    } else {
      const res = await grantAccess({
        email,
        packageId,
        grantedBy: adminEmail,
        note: note || null,
        source: "beta",
      });
      setBusy(false);
      if (!res.ok) {
        setToast(res.error || "Grant failed");
        return;
      }
      setToast(`Granted ${packageId} → ${email.trim().toLowerCase()}`);
    }

    setEmail("");
    void load();
  }

  async function onRevoke(id: string, label: string) {
    if (!confirm(`Revoke access for ${label}?`)) return;
    setBusy(true);
    const res = await revokeAccess(id);
    setBusy(false);
    if (!res.ok) {
      setToast(res.error || "Revoke failed");
      return;
    }
    setToast("Revoked");
    void load();
  }

  async function onRevokeEmail(em: string) {
    if (!confirm(`Revoke ALL grants for ${em}?`)) return;
    setBusy(true);
    const res = await revokeAllForEmail(em);
    setBusy(false);
    if (!res.ok) {
      setToast(res.error || "Revoke failed");
      return;
    }
    setToast(`Removed ${res.removed ?? 0} grant(s) for ${em}`);
    void load();
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 break-words">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 break-words">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 shrink-0 text-amber-400" />
            Access grants
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5 break-words">
            Whitelist emails for beta users: unlock specific packages or the whole
            catalog without payment. Works even before they sign up (matched by email).
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className={`${PILL} w-full border border-white/12 text-white/80`}
        >
          <RefreshCw className="w-4 h-4" />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <form
        onSubmit={onGrant}
        className="rounded-2xl border border-amber-400/25 bg-wisdom-card p-4 space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Grant access
        </p>
        <div className="grid grid-cols-1 gap-3">
          <label className="block text-xs text-wisdom-muted min-w-0">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beta.user@example.com"
              className={FIELD}
              autoComplete="off"
            />
          </label>
          <label className="block text-xs text-wisdom-muted min-w-0">
            Package
            <select
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className={FIELD}
            >
              <option value={ALL_PACKAGES_ID}>★ All packages (full access)</option>
              {academyPackages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-wisdom-muted min-w-0">
            Note (optional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Beta tester · March cohort"
              className={FIELD}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className={`${PILL} w-full bg-amber-500 font-bold text-wisdom-dark`}
        >
          <Plus className="w-4 h-4" />
          {busy ? "Saving…" : "Grant access"}
        </button>
        <p className="text-xs text-wisdom-muted break-words">
          User does not need an account yet. When they sign in with this email,
          packages unlock automatically: no cart or payment.
        </p>
      </form>

      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-wisdom-muted" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by email or package…"
            className="w-full min-h-[44px] rounded-xl border border-white/12 bg-wisdom-card pl-9 pr-3 py-2 text-sm text-white"
          />
        </div>
        <p className="text-xs text-wisdom-muted">{filtered.length} grant(s)</p>
      </div>

      {loading && grants.length === 0 ? (
        <p className="py-10 text-center text-wisdom-muted text-sm">Loading grants…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-wisdom-muted text-sm">
          No access grants yet. Add a beta email above.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((g) => (
            <li
              key={g.id}
              className="rounded-2xl border border-white/12 bg-wisdom-card p-3 space-y-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white break-all">{g.email}</p>
                <p className="text-xs text-wisdom-muted mt-0.5 break-words">
                  <span
                    className={
                      g.packageId === ALL_PACKAGES_ID
                        ? "text-amber-300 font-semibold"
                        : "text-cyan-300"
                    }
                  >
                    {g.packageName || g.packageId}
                  </span>
                  {g.note ? ` · ${g.note}` : ""}
                  {g.grantedBy ? ` · by ${g.grantedBy}` : ""}
                  {g.userId ? " · linked account" : " · email only (pre-signup)"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRevoke(g.id, `${g.email} / ${g.packageId}`)}
                  className={`${PILL} border border-rose-400/30 text-rose-300`}
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRevokeEmail(g.email)}
                  className={`${PILL} border border-white/12 text-wisdom-muted`}
                >
                  Revoke all
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
