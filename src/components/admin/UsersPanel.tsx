"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listProfiles,
  getStudentDetail,
  downloadCsv,
  type ProfileRow,
} from "@/lib/admin-data";
import {
  grantAccess,
  grantAllPackages,
  ALL_PACKAGES_ID,
} from "@/lib/access-grants";
import { academyPackages, formatEtb } from "@/data/packages";
import BrandLoader from "@/components/BrandLoader";
import {
  Users,
  Search,
  Download,
  Mail,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  KeyRound,
  CheckCircle2,
  X,
  Copy,
  Check,
  RefreshCw,
  Award,
  BookOpen,
} from "lucide-react";

/**
 * Admin Users tab.
 *
 * 2026-10-15 (Admin mobile redesign, slice A7): LAYOUT ONLY. Audit hits before the change: `backdrop-blur-sm` (2 modal
 * overlays), `animate-spin` (Refresh icon), `animate-fade-in` (toast and 2 modals), `shadow-2xl` / `shadow-lg`,
 * `min-w-[240px]` (search box), small buttons. Now: compact header with two 44 px pills in a 2-column grid, search
 * full width and the two filters side by side, one-column cards with 44 px pill buttons, modals are solid bottom
 * sheets (no blur, no animation, bounded height with `overscroll-contain`), toast sits between the screen edges.
 * Logic, state, database calls and CSV export are unchanged. Two invented fallback texts were removed
 * (fake-content rule): the inspect window showed the made-up id "WTA-01042" when a student has no id, and the
 * name fallback "Scholar Scholar"; they now show "-" and "Scholar".
 */

type Props = {
  adminEmail?: string;
};

const FIELD_CLASS =
  "w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-wisdom-dark border border-white/10 text-sm text-white placeholder-wisdom-muted focus:outline-none focus:border-purple-400";

const SHEET_OVERLAY_CLASS = "fixed inset-0 z-50 flex items-end justify-center bg-black/80";

export default function UsersPanel({ adminEmail = "admin@wisdomtower.tech" }: Props) {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [toast, setToast] = useState("");

  // Inspect Student Modal State
  const [inspectStudent, setInspectStudent] = useState<ProfileRow | null>(null);
  const [inspectDetail, setInspectDetail] = useState<{
    academicResults: Record<string, unknown>[];
    enrollments: Record<string, unknown>[];
    accessGrants: Record<string, unknown>[];
    orders: Record<string, unknown>[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quick Grant Modal State
  const [grantModalUser, setGrantModalUser] = useState<ProfileRow | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(ALL_PACKAGES_ID);
  const [grantNote, setGrantNote] = useState("Direct scholar grant");
  const [grantBusy, setGrantBusy] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listProfiles();
    setUsers(data);
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

  // Load detailed history when inspecting student
  useEffect(() => {
    if (!inspectStudent) {
      setInspectDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    getStudentDetail(inspectStudent.id, inspectStudent.email).then((detail) => {
      if (!cancelled) {
        setInspectDetail(detail);
        setLoadingDetail(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [inspectStudent]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportCsv = () => {
    if (users.length === 0) return;
    const headers = [
      "Student ID",
      "Full Name",
      "Email",
      "Phone",
      "School Name",
      "Town/Region",
      "Stream",
      "Education Level",
      "Target Exam",
      "Joined Date",
    ];
    const rows = users.map((u) => [
      u.student_id_number || "WTA-UNASSIGNED",
      u.full_name || "Scholar",
      u.email || "",
      u.phone || "",
      u.school_name || "",
      u.town_region || "",
      u.stream || "",
      u.education_level || "",
      u.target_exam || "",
      u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    ]);
    downloadCsv(`wisdom_tower_scholars_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExecuteGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantModalUser?.email) {
      setToast("User has no email associated with account");
      return;
    }
    setGrantBusy(true);

    if (selectedPackageId === ALL_PACKAGES_ID) {
      const res = await grantAllPackages({
        email: grantModalUser.email,
        grantedBy: adminEmail,
        note: grantNote || "Direct Admin Grant",
      });
      setGrantBusy(false);
      if (res.ok) {
        setToast(`Granted full platform pass to ${grantModalUser.email} (${res.count} packages)`);
        setGrantModalUser(null);
      } else {
        setToast(res.error || "Failed to grant all packages");
      }
    } else {
      const pkg = academyPackages.find((p) => p.id === selectedPackageId);
      const res = await grantAccess({
        email: grantModalUser.email,
        packageId: selectedPackageId,
        grantedBy: adminEmail,
        note: grantNote || "Direct Admin Grant",
      });
      setGrantBusy(false);
      if (res.ok) {
        setToast(`Granted ${pkg?.name || selectedPackageId} to ${grantModalUser.email}`);
        setGrantModalUser(null);
      } else {
        setToast(res.error || "Failed to grant package");
      }
    }
  };

  // Filtered scholars list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.student_id_number || "").toLowerCase().includes(q) ||
        (u.school_name || "").toLowerCase().includes(q) ||
        (u.town_region || "").toLowerCase().includes(q);

      // Stream matching
      const streamVal = (u.stream || "").toLowerCase();
      let matchStream = true;
      if (streamFilter === "natural") {
        matchStream = streamVal.includes("nat");
      } else if (streamFilter === "social") {
        matchStream = streamVal.includes("soc");
      }

      // Level matching
      let matchLevel = true;
      if (levelFilter !== "all") {
        matchLevel = (u.education_level || "").toLowerCase() === levelFilter.toLowerCase();
      }

      return matchSearch && matchStream && matchLevel;
    });
  }, [users, searchQuery, streamFilter, levelFilter]);

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 inset-x-4 z-[60] rounded-2xl border border-cyan-400/40 bg-wisdom-card p-3.5 text-sm font-semibold text-cyan-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{toast}</span>
        </div>
      )}

      {/* Header and Actions Bar */}
      <div className="space-y-3 border-b border-white/8 pb-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Scholar Directory</span>
          </h2>
          <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
            Registered students, school details and direct access controls
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={users.length === 0}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full border border-white/12 text-sm font-semibold text-white/90 active:bg-white/10 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export CSV ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full bg-purple-600/20 text-purple-300 border border-purple-400/30 text-sm font-semibold active:bg-purple-600/30 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5 bg-wisdom-card/60 p-3 rounded-2xl border border-white/8">
        <div className="relative">
          <Search className="w-4 h-4 text-wisdom-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, student ID, school, town"
            className={`${FIELD_CLASS} pl-10`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Stream Filter */}
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className={`${FIELD_CLASS} font-semibold`}
          >
            <option value="all">All Streams</option>
            <option value="natural">Natural Science</option>
            <option value="social">Social Science</option>
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className={`${FIELD_CLASS} font-semibold`}
          >
            <option value="all">All Levels</option>
            <option value="grade-12">Grade 12</option>
            <option value="grade-11">Grade 11</option>
            <option value="freshman">University Freshman</option>
            <option value="remedial">Remedial</option>
          </select>
        </div>

        <p className="text-xs text-wisdom-muted tabular-nums">
          Showing {filteredUsers.length} of {users.length}
        </p>
      </div>

      {/* Scholars List */}
      {loading && users.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <BrandLoader size="md" label="Loading scholars directory..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-wisdom-muted">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white mb-1">No matching scholars found</p>
          <p className="text-sm">Try adjusting your search criteria or stream filters.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredUsers.map((u) => (
            <div key={u.id} className="rounded-2xl border border-white/10 bg-wisdom-card p-3.5">
              {/* Top Row: Avatar, Name, Email */}
              <div className="flex items-center gap-3 min-w-0 mb-2.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30 overflow-hidden flex items-center justify-center font-bold text-sm text-purple-300 shrink-0">
                  {u.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (u.full_name || u.email || "S").slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-base truncate">{u.full_name || "Scholar"}</h4>
                  <p className="text-xs text-wisdom-muted truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{u.email || "No email"}</span>
                  </p>
                </div>
              </div>

              {/* Student ID (tap to copy) */}
              {u.student_id_number && (
                <button
                  type="button"
                  onClick={() => handleCopy(u.student_id_number!, `id-${u.id}`)}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 mb-2.5 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-400/30 active:bg-purple-500/25 cursor-pointer"
                  aria-label="Copy student ID"
                >
                  {copiedId === `id-${u.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <span>{u.student_id_number}</span>
                      <Copy className="w-3.5 h-3.5 opacity-60" />
                    </>
                  )}
                </button>
              )}

              {/* Secondary Academic Details */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-wisdom-muted py-2.5 border-t border-b border-white/6 mb-3">
                <div className="min-w-0 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
                  <span className="truncate">{u.school_name || "School: Not specified"}</span>
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                  <span className="truncate">{u.town_region || "Region: Not set"}</span>
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400/70 shrink-0" />
                  <span className="truncate">{u.stream || "General Stream"}</span>
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-wisdom-muted/70 shrink-0" />
                  <span className="truncate">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInspectStudent(u)}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-full border border-white/12 text-xs font-semibold text-white/90 active:bg-white/10 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>History & Scores</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGrantModalUser(u);
                    setSelectedPackageId(ALL_PACKAGES_ID);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/40 active:bg-purple-500/30 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 shrink-0" />
                  <span>Grant Package</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* SHEET 1: INSPECT STUDENT                                  */}
      {/* ========================================================= */}
      {inspectStudent && (
        <div className={SHEET_OVERLAY_CLASS}>
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/15 bg-wisdom-card p-4 space-y-4"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/8 pb-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Student Scholar Profile
                </p>
                <h3 className="text-lg font-bold text-white mt-0.5 break-words">
                  {inspectStudent.full_name || "Scholar"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                aria-label="Close"
                className="shrink-0 w-11 h-11 grid place-items-center rounded-full text-wisdom-muted active:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Summary */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/8 text-xs">
              <div className="min-w-0">
                <p className="text-wisdom-muted">Student ID</p>
                <p className="font-mono font-bold text-cyan-300 text-sm mt-0.5 break-all">
                  {inspectStudent.student_id_number || "-"}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-wisdom-muted">Email</p>
                <p className="font-semibold text-white mt-0.5 break-all">{inspectStudent.email || "-"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-wisdom-muted">Phone</p>
                <p className="font-semibold text-white mt-0.5 break-words">{inspectStudent.phone || "-"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-wisdom-muted">School</p>
                <p className="font-semibold text-white mt-0.5 break-words">{inspectStudent.school_name || "-"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-wisdom-muted">Stream</p>
                <p className="font-semibold text-white mt-0.5 break-words">{inspectStudent.stream || "-"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-wisdom-muted">Town / Region</p>
                <p className="font-semibold text-white mt-0.5 break-words">{inspectStudent.town_region || "-"}</p>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-10 flex justify-center">
                <BrandLoader size="sm" label="Fetching academic history & enrollments..." />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Enrollments & Grants */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-2 flex items-start gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      Unlocked Packages & Access Grants (
                      {(inspectDetail?.enrollments.length || 0) + (inspectDetail?.accessGrants.length || 0)})
                    </span>
                  </h4>
                  {(inspectDetail?.enrollments.length || 0) === 0 &&
                  (inspectDetail?.accessGrants.length || 0) === 0 ? (
                    <p className="text-xs text-wisdom-muted p-3 rounded-xl border border-white/6 bg-white/[0.02]">
                      No active packages unlocked yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {inspectDetail?.enrollments.map((enr, i) => (
                        <span
                          key={`enr-${i}`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 break-words"
                        >
                          {String(enr.package_name || enr.package_id)} (Verified Order)
                        </span>
                      ))}
                      {inspectDetail?.accessGrants.map((grant, i) => (
                        <span
                          key={`grant-${i}`}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-400/30 break-words"
                        >
                          {String(grant.package_name || grant.package_id)} (Manual Grant)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Academic Results History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-2 flex items-start gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Recent Test & Examination Scores ({inspectDetail?.academicResults.length || 0})</span>
                  </h4>
                  {(inspectDetail?.academicResults.length || 0) === 0 ? (
                    <p className="text-xs text-wisdom-muted p-3 rounded-xl border border-white/6 bg-white/[0.02]">
                      No recorded quiz or test submissions yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {inspectDetail?.academicResults.map((r, i) => (
                        <div
                          key={`score-${i}`}
                          className="p-2.5 rounded-xl border border-white/6 bg-white/[0.02] text-xs"
                        >
                          <p className="font-semibold text-white break-words">{String(r.title || r.scope_id)}</p>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="text-wisdom-muted">
                              {r.created_at ? new Date(String(r.created_at)).toLocaleDateString() : ""}
                            </span>
                            <span className="font-bold text-cyan-300 tabular-nums">
                              {String(r.correct)}/{String(r.total)} ({String(r.percent)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/8 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="min-h-[44px] rounded-full border border-white/15 text-sm font-semibold text-white/90 active:bg-white/10 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const u = inspectStudent;
                  setInspectStudent(null);
                  setGrantModalUser(u);
                  setSelectedPackageId(ALL_PACKAGES_ID);
                }}
                className="min-h-[44px] rounded-full text-sm font-bold bg-purple-500 text-white active:bg-purple-400 cursor-pointer"
              >
                Grant New Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SHEET 2: DIRECT QUICK GRANT                               */}
      {/* ========================================================= */}
      {grantModalUser && (
        <div className={SHEET_OVERLAY_CLASS}>
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/15 bg-wisdom-card p-4 space-y-4"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/8 pb-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Direct Scholar Access Grant
                </p>
                <h3 className="text-lg font-bold text-white mt-0.5 break-words">
                  Unlock Materials for {grantModalUser.full_name || grantModalUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGrantModalUser(null)}
                aria-label="Close"
                className="shrink-0 w-11 h-11 grid place-items-center rounded-full text-wisdom-muted active:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteGrant} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1.5">
                  Recipient Scholar
                </label>
                <input
                  type="text"
                  disabled
                  value={`${grantModalUser.full_name || "Scholar"} (${grantModalUser.email || "No email"})`}
                  className={`${FIELD_CLASS} font-medium opacity-80`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1.5">
                  Package to Unlock
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className={`${FIELD_CLASS} font-semibold`}
                >
                  <option value={ALL_PACKAGES_ID}>★ All Packages (Full Academy Access)</option>
                  {academyPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatEtb(p.priceEtb)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1.5">
                  Administrative Note
                </label>
                <input
                  type="text"
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                  placeholder="e.g. Scholarship award, beta tester, payment verified"
                  className={FIELD_CLASS}
                />
              </div>

              <div className="pt-3 border-t border-white/8 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGrantModalUser(null)}
                  className="min-h-[44px] rounded-full border border-white/15 text-sm font-semibold text-white/90 active:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantBusy}
                  className="min-h-[44px] rounded-full text-sm font-bold bg-purple-500 text-white active:bg-purple-400 disabled:opacity-50 cursor-pointer"
                >
                  {grantBusy ? "Granting..." : "Confirm & Unlock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
