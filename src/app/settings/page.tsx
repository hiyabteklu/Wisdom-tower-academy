"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import {
  loadPreferences,
  savePreferences,
  DEFAULT_PREFS,
  type UserPreferences,
} from "@/lib/preferences";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Globe,
  Laptop,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Save,
  Settings2,
  Shield,
  Sun,
  User as UserIcon,
  Zap,
} from "lucide-react";

type Section = "appearance" | "notifications" | "profile" | "accessibility" | "account";

const SECTIONS: { id: Section; label: string; icon: typeof Palette; desc: string }[] = [
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme & visual style" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts & digests" },
  { id: "profile", label: "Profile", icon: UserIcon, desc: "Name & identity" },
  { id: "accessibility", label: "Accessibility", icon: Zap, desc: "Motion & density" },
  { id: "account", label: "Account", icon: Lock, desc: "Security & session" },
];

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${
        on ? "bg-wisdom-cyan" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, resolved, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("appearance");
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/settings");
        return;
      }
      await ensureProfile(session.user);
      setUser(session.user);
      setDisplayName(
        session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          ""
      );
      setPrefs(loadPreferences());
      setLoading(false);
    });
  }, [router]);

  const updatePref = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePreferences(next);
      setSavedFlash(true);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 1600);
    return () => clearTimeout(t);
  }, [savedFlash]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });
      if (error) throw error;
      setProfileMsg("Profile updated");
      setSavedFlash(true);
    } catch {
      setProfileMsg("Could not save — try again");
    }
    setSavingProfile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const themes: { id: ThemeMode; label: string; icon: typeof Moon; hint: string }[] = [
    { id: "dark", label: "Dark", icon: Moon, hint: "Deep navy · default" },
    { id: "light", label: "Azure Day", icon: Sun, hint: "Soft blue workspace" },
    { id: "system", label: "System", icon: Monitor, hint: "Match device" },
  ];

  const resolvedLabel = resolved === "light" ? "Azure Day" : "Dark";

  return (
    <div className="py-8 md:py-12 min-h-[70vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-wisdom-muted hover:text-wisdom-cyan mb-3 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Account
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-wisdom-cyan/15 border border-wisdom-cyan/30 text-wisdom-cyan">
                <Settings2 className="w-6 h-6" />
              </span>
              Settings
            </h1>
            <p className="text-wisdom-muted mt-2 text-sm md:text-base">
              Control how Wisdom Tower looks, notifies you, and feels.
            </p>
          </div>
          {savedFlash && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              Saved
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all shrink-0 lg:shrink lg:w-full ${
                    active
                      ? "bg-wisdom-cyan/15 border border-wisdom-cyan/35 text-white shadow-lg shadow-cyan-500/5"
                      : "border border-transparent text-wisdom-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${active ? "text-wisdom-cyan" : ""}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className="hidden lg:block text-[11px] opacity-70">{s.desc}</span>
                  </span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto text-wisdom-cyan hidden lg:block" />}
                </button>
              );
            })}
          </nav>

          <div className="rounded-3xl border border-white/12 bg-wisdom-card/90 backdrop-blur-sm overflow-hidden card-elevated">
            {section === "appearance" && (
              <div className="p-5 sm:p-8">
                <h2 className="font-display text-xl font-bold mb-1">Appearance</h2>
                <p className="text-sm text-wisdom-muted mb-6">
                  Active theme: <span className="font-medium text-foreground">{resolvedLabel}</span>
                  {theme === "system" ? " (following system)" : ""}
                </p>

                <div className="grid sm:grid-cols-3 gap-3 mb-8">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                          setSavedFlash(true);
                        }}
                        className={`relative rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? "border-wisdom-cyan/50 bg-wisdom-cyan/10 ring-2 ring-wisdom-cyan/20"
                            : "border-white/12 bg-black/20 hover:border-white/25"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                            active ? "bg-wisdom-cyan text-wisdom-dark" : "bg-white/10 text-white/80"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-sm">{t.label}</p>
                        <p className="text-[11px] text-wisdom-muted mt-0.5">{t.hint}</p>
                        {active && (
                          <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-wisdom-cyan text-wisdom-dark flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 bg-black/25">
                    <Laptop className="w-4 h-4 text-wisdom-muted" />
                    <span className="text-xs font-semibold text-wisdom-muted">Live preview</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-wisdom-card p-4">
                      <div className="h-2 w-16 rounded bg-wisdom-cyan/40 mb-2" />
                      <div className="h-2 w-full rounded bg-white/10 mb-1.5" />
                      <div className="h-2 w-3/4 rounded bg-white/10" />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-wisdom-cyan">∞</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section === "notifications" && (
              <div className="p-5 sm:p-8">
                <h2 className="font-display text-xl font-bold mb-1">Notifications</h2>
                <p className="text-sm text-wisdom-muted mb-6">Choose what reaches you in-app and by email.</p>
                <div className="space-y-1">
                  {(
                    [
                      {
                        key: "notifApplications" as const,
                        title: "Application updates",
                        body: "Status changes on your talent path and service requests",
                      },
                      {
                        key: "notifMessages" as const,
                        title: "Messages",
                        body: "Replies from the team on your threads",
                      },
                      {
                        key: "notifPathUpdates" as const,
                        title: "Path milestones",
                        body: "When you advance a stage on the contributor path",
                      },
                      {
                        key: "notifMarketing" as const,
                        title: "News & opportunities",
                        body: "Occasional product updates and open roles",
                      },
                    ] as const
                  ).map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/8 px-4 py-3.5 hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{row.title}</p>
                        <p className="text-xs text-wisdom-muted mt-0.5">{row.body}</p>
                      </div>
                      <Toggle label={row.title} on={prefs[row.key]} onChange={(v) => updatePref(row.key, v)} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-wisdom-cyan" />
                    Email digest
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["off", "daily", "weekly"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updatePref("emailDigest", opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition ${
                          prefs.emailDigest === opt
                            ? "border-wisdom-cyan/40 bg-wisdom-cyan/15 text-wisdom-cyan"
                            : "border-white/12 text-wisdom-muted hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === "profile" && (
              <div className="p-5 sm:p-8">
                <h2 className="font-display text-xl font-bold mb-1">Profile</h2>
                <p className="text-sm text-wisdom-muted mb-6">How you appear across Wisdom Tower.</p>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-wisdom-cyan to-cyan-800 flex items-center justify-center text-2xl font-bold text-wisdom-dark border border-white/15">
                    {user.user_metadata?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (displayName || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{displayName || "User"}</p>
                    <p className="text-xs text-wisdom-muted">{user.email}</p>
                  </div>
                </div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-2">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="field-input mb-4"
                  placeholder="Your name"
                  maxLength={80}
                />
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-2">
                  Language
                </label>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(
                    [
                      { id: "en" as const, label: "English" },
                      { id: "am" as const, label: "አማርኛ" },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => updatePref("language", lang.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                        prefs.language === lang.id
                          ? "border-wisdom-cyan/40 bg-wisdom-cyan/15 text-wisdom-cyan"
                          : "border-white/12 text-wisdom-muted hover:border-white/25"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={savingProfile || !displayName.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold hover:bg-wisdom-cyan-dark disabled:opacity-50 transition"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? "Saving…" : "Save profile"}
                </button>
                {profileMsg && <p className="mt-3 text-sm text-wisdom-muted">{profileMsg}</p>}
              </div>
            )}

            {section === "accessibility" && (
              <div className="p-5 sm:p-8">
                <h2 className="font-display text-xl font-bold mb-1">Accessibility</h2>
                <p className="text-sm text-wisdom-muted mb-6">Comfort and clarity controls.</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold">Reduce motion</p>
                      <p className="text-xs text-wisdom-muted mt-0.5">Minimize animations and floating effects</p>
                    </div>
                    <Toggle
                      label="Reduce motion"
                      on={prefs.reducedMotion}
                      onChange={(v) => updatePref("reducedMotion", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/8 px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold">Compact UI</p>
                      <p className="text-xs text-wisdom-muted mt-0.5">Tighter spacing on dashboards (coming soon)</p>
                    </div>
                    <Toggle label="Compact UI" on={prefs.compactUI} onChange={(v) => updatePref("compactUI", v)} />
                  </div>
                </div>
              </div>
            )}

            {section === "account" && (
              <div className="p-5 sm:p-8">
                <h2 className="font-display text-xl font-bold mb-1">Account</h2>
                <p className="text-sm text-wisdom-muted mb-6">Security and session.</p>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1">Signed in as</p>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-wisdom-muted mt-1">
                    Member since{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3.5 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition"
                  >
                    <UserIcon className="w-4 h-4 text-wisdom-cyan" />
                    Open account hub
                    <ChevronRight className="w-4 h-4 ml-auto text-wisdom-muted" />
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3.5 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition"
                  >
                    <Shield className="w-4 h-4 text-wisdom-cyan" />
                    Reset password
                    <ChevronRight className="w-4 h-4 ml-auto text-wisdom-muted" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl border border-red-500/25 px-4 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
