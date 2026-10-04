"use client";

import { useMemo, useState } from "react";
import {
  AVATAR_PRESETS,
  EDUCATION_LEVELS,
  ACADEMIC_STREAMS,
  ETHIOPIAN_REGIONS,
  updateFullProfile,
  type UserProfileRecord,
} from "@/lib/profile";
import StudentAvatar from "@/components/StudentAvatar";
import CustomSelect from "@/components/ui/CustomSelect";
import { triggerHaptic, playCelebrationSound } from "@/lib/sound-haptics";
import type { User } from "@supabase/supabase-js";
import {
  Award,
  Check,
  ChevronDown,
  Crown,
  GraduationCap,
  Save,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

interface ProfileCompletionPanelProps {
  user: User;
  initialProfile: UserProfileRecord | null;
  onProfileUpdated: (updated: UserProfileRecord) => void;
}

export default function ProfileCompletionPanel({
  user,
  initialProfile,
  onProfileUpdated,
}: ProfileCompletionPanelProps) {
  const [profile, setProfile] = useState<Partial<UserProfileRecord>>({
    full_name: initialProfile?.full_name || "",
    first_name:
      initialProfile?.first_name ||
      initialProfile?.full_name?.split(" ")[0] ||
      "",
    last_name:
      initialProfile?.last_name ||
      initialProfile?.full_name?.split(" ").slice(1).join(" ") ||
      "",
    phone: initialProfile?.phone || "",
    education_level: initialProfile?.education_level || "Freshman",
    school_name: initialProfile?.school_name || "",
    town_region: initialProfile?.town_region || "",
    stream: initialProfile?.stream || "",
    bio: initialProfile?.bio || "",
    target_exam: initialProfile?.target_exam || "",
    target_score: initialProfile?.target_score || "",
    daily_study_goal_minutes: initialProfile?.daily_study_goal_minutes || 45,
    preferred_study_time: initialProfile?.preferred_study_time || "evening",
    avatar_preset: initialProfile?.avatar_preset || "scholar-cyan",
    avatar_url: initialProfile?.avatar_url || null,
  });

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const [openSub, setOpenSub] = useState<Record<string, boolean>>({
    avatar: true,
    academic: true,
    contact: true,
  });

  const toggleSub = (key: string) => {
    setOpenSub((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (profile.first_name || profile.full_name) score += 20;
    if (profile.education_level) score += 20;
    if (profile.stream) score += 15;
    if (profile.school_name) score += 15;
    if (profile.town_region) score += 10;
    if (profile.target_exam) score += 10;
    if (profile.phone) score += 10;
    return Math.min(100, score);
  }, [profile]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaving(true);

    const composedName =
      [profile.first_name?.trim(), profile.last_name?.trim()]
        .filter(Boolean)
        .join(" ") ||
      profile.full_name ||
      "";

    const updatePayload: Partial<UserProfileRecord> = {
      ...profile,
      full_name: composedName,
    };

    const res = await updateFullProfile(user.id, updatePayload);
    if (res.success) {
      const merged = {
        ...(initialProfile || {}),
        ...updatePayload,
        id: user.id,
      } as UserProfileRecord;
      setProfile((prev) => ({ ...prev, full_name: composedName }));
      onProfileUpdated(merged);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);

      if (profileCompletion >= 100 && !hasCelebrated) {
        setHasCelebrated(true);
        playCelebrationSound(0.5);
        triggerHaptic("celebrate");
      }
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto transition-opacity duration-300">
      {/* Top Completion Gauge Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0c1427]/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Progress Gauge */}
          <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-white/[0.08]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`transition-all duration-1000 ease-out ${
                  profileCompletion >= 100
                    ? "stroke-amber-400"
                    : "stroke-cyan-400"
                }`}
                strokeWidth="8"
                strokeDasharray={251.327}
                strokeDashoffset={
                  251.327 - (251.327 * profileCompletion) / 100
                }
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              {profileCompletion >= 100 ? (
                <>
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-400 mb-0.5" />
                  <span className="text-base font-black text-amber-300 font-display leading-none">
                    100%
                  </span>
                  <span className="text-[7.5px] font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">
                    CROWNED
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg font-bold text-white font-display leading-none">
                    {profileCompletion}%
                  </span>
                  <span className="text-[8px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                    COMPLETE
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Gauge Details */}
          <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {profileCompletion >= 100 ? (
                  <>
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Golden Scholar Crown Unlocked</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Complete Your Scholar Profile</span>
                  </>
                )}
              </h3>

              {savedFlash && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  Saved
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {profileCompletion >= 100
                ? "Your academic profile is complete and verified! The Golden Crown appears live on your Digital Student ID Card."
                : "Fill in your curriculum, track, institution, and contact details to verify your account and unlock your Golden Scholar badge."}
            </p>

            {/* Checklist Pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {[
                {
                  label: "Legal Name",
                  done: Boolean(profile.first_name || profile.full_name),
                },
                {
                  label: "Academic Level",
                  done: Boolean(profile.education_level),
                },
                { label: "Stream", done: Boolean(profile.stream) },
                {
                  label: "Institution",
                  done: Boolean(profile.school_name),
                },
                { label: "Region", done: Boolean(profile.town_region) },
                { label: "Phone", done: Boolean(profile.phone) },
              ].map((m) => (
                <span
                  key={m.label}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-colors ${
                    m.done
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400"
                  }`}
                >
                  {m.done ? "✓" : "○"} {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* STEP 1: AVATAR & LEGAL IDENTITY */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1427]/70 backdrop-blur-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSub("avatar")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center border border-cyan-400/30">
                1
              </span>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Character Avatar & Legal Identity
                </p>
                <p className="text-[11px] text-slate-400">
                  Select your scholar avatar preset, first and last name
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.first_name || profile.full_name ? (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Filled
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Required
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSub.avatar ? "rotate-180 text-white" : ""
                }`}
              />
            </div>
          </button>

          {openSub.avatar && (
            <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-white/[0.02]">
              {/* Avatar Preset Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                  Academic Character Avatar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {AVATAR_PRESETS.map((p) => {
                    const selected = profile.avatar_preset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            avatar_preset: p.id,
                            avatar_url: null,
                          }))
                        }
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer active:scale-95 ${
                          selected
                            ? "border-cyan-400/50 bg-cyan-500/15 shadow-sm font-semibold"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
                        }`}
                      >
                        <StudentAvatar
                          avatarPreset={p.id}
                          size="sm"
                          showGlow={false}
                          hasCrown={profileCompletion >= 100}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legal Name */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.first_name || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Abebe"
                    className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.last_name || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Bikila"
                    className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: ACADEMIC CURRICULUM, TRACK & INSTITUTION */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1427]/70 backdrop-blur-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSub("academic")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center border border-cyan-400/30">
                2
              </span>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Academic Curriculum, Track & Institution
                </p>
                <p className="text-[11px] text-slate-400">
                  Academic level, stream, university/school, and region
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.education_level && profile.school_name ? (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Filled
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Incomplete
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSub.academic ? "rotate-180 text-white" : ""
                }`}
              />
            </div>
          </button>

          {openSub.academic && (
            <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-white/[0.02]">
              <div className="grid sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Education Level"
                  placeholder="Select your academic level"
                  value={profile.education_level || ""}
                  onChange={(val) =>
                    setProfile((prev) => ({ ...prev, education_level: val }))
                  }
                  options={EDUCATION_LEVELS}
                  searchable={false}
                />

                <CustomSelect
                  label="Stream / Academic Track"
                  placeholder="Select your stream"
                  value={profile.stream || ""}
                  onChange={(val) =>
                    setProfile((prev) => ({ ...prev, stream: val }))
                  }
                  options={ACADEMIC_STREAMS}
                  searchable={false}
                />
              </div>

              {profile.education_level === "Other" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Specify Your Academic Level
                  </label>
                  <input
                    type="text"
                    value={
                      profile.bio?.startsWith("Custom Level: ")
                        ? profile.bio.replace("Custom Level: ", "")
                        : ""
                    }
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        bio: e.target.value
                          ? `Custom Level: ${e.target.value}`
                          : "",
                      }))
                    }
                    placeholder="e.g. Master's Degree, College Diploma, Self-learner..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    School / University Name
                  </label>
                  <input
                    type="text"
                    value={profile.school_name || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        school_name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Addis Ababa University / Millenium High"
                    className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <CustomSelect
                  label="Town / Region in Ethiopia"
                  placeholder="Select your region"
                  value={profile.town_region || ""}
                  onChange={(val) =>
                    setProfile((prev) => ({ ...prev, town_region: val }))
                  }
                  options={ETHIOPIAN_REGIONS}
                  searchable={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: CONTACT & SCHOLAR BIO */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1427]/70 backdrop-blur-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSub("contact")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center border border-cyan-400/30">
                3
              </span>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Contact Phone & Target Exam
                </p>
                <p className="text-[11px] text-slate-400">
                  Phone number, target national exam, and score goal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.phone ? (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Filled
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Incomplete
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSub.contact ? "rotate-180 text-white" : ""
                }`}
              />
            </div>
          </button>

          {openSub.contact && (
            <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-white/[0.02]">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="e.g. 0911223344"
                    className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Exam / Goal
                  </label>
                  <input
                    type="text"
                    value={profile.target_exam || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        target_exam: e.target.value,
                      }))
                    }
                    placeholder="e.g. National Matric, Exit Exam, GPA 3.8+"
                    className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-95 shadow-lg shadow-cyan-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
