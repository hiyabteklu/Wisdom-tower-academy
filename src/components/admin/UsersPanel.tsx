"use client";

import { useCallback, useEffect, useState } from "react";
import { listProfiles, type ProfileRow } from "@/lib/admin-data";
import { Users, RefreshCw, Mail } from "lucide-react";

export default function UsersPanel() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setUsers(await listProfiles());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Registered users
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            {users.length} profile{users.length === 1 ? "" : "s"} in Supabase
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && users.length === 0 ? (
        <p className="py-12 text-center text-wisdom-muted">Loading users…</p>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-wisdom-muted">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white/80 mb-1">No profiles yet</p>
          <p className="text-sm">
            Profiles are created when someone signs in (ensureProfile). Confirm the{" "}
            <code className="text-cyan-300">profiles</code> table exists in Supabase.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="rounded-2xl border border-white/10 bg-wisdom-card px-4 py-3 flex flex-wrap items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-sm font-bold text-wisdom-cyan shrink-0">
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (u.full_name || u.email || "?").slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">
                  {u.full_name || "No name"}
                </p>
                <p className="text-sm text-wisdom-muted inline-flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {u.email || "—"}
                </p>
              </div>
              <p className="text-xs text-wisdom-muted shrink-0">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
