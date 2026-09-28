"use client";

import {
  GraduationCap,
  Cpu,
  Sparkles,
  HeartPulse,
  Code2,
  Compass,
  Scale,
  Zap,
  User,
} from "lucide-react";
import { AVATAR_PRESETS } from "@/lib/profile";

interface StudentAvatarProps {
  avatarPreset?: string | null;
  avatarUrl?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  xs: { box: "w-7 h-7 text-[10px]", icon: "w-3.5 h-3.5" },
  sm: { box: "w-9 h-9 text-xs", icon: "w-4 h-4" },
  md: { box: "w-11 h-11 text-sm", icon: "w-5 h-5" },
  lg: { box: "w-14 h-14 text-base", icon: "w-6 h-6" },
  xl: { box: "w-20 h-20 text-xl", icon: "w-9 h-9" },
  "2xl": { box: "w-24 h-24 text-2xl", icon: "w-11 h-11" },
};

function renderPresetIcon(iconName: string, iconClass: string) {
  switch (iconName) {
    case "GraduationCap":
      return <GraduationCap className={iconClass} />;
    case "Cpu":
      return <Cpu className={iconClass} />;
    case "Sparkles":
      return <Sparkles className={iconClass} />;
    case "HeartPulse":
      return <HeartPulse className={iconClass} />;
    case "Code2":
      return <Code2 className={iconClass} />;
    case "Compass":
      return <Compass className={iconClass} />;
    case "Scale":
      return <Scale className={iconClass} />;
    case "Zap":
      return <Zap className={iconClass} />;
    default:
      return <User className={iconClass} />;
  }
}

export default function StudentAvatar({
  avatarPreset,
  avatarUrl,
  name,
  size = "md",
  className = "",
  showGlow = true,
}: StudentAvatarProps) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const preset = AVATAR_PRESETS.find((p) => p.id === avatarPreset);

  // If a custom image URL is provided (e.g. from Google or uploaded photo)
  if (avatarUrl && !avatarPreset) {
    return (
      <div
        className={`relative shrink-0 rounded-2xl overflow-hidden border border-white/20 bg-wisdom-card ${s.box} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={name || "Student"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // If an academic avatar preset is chosen
  if (preset) {
    return (
      <div
        className={`relative shrink-0 rounded-2xl flex items-center justify-center font-bold text-white bg-gradient-to-br ${preset.gradient} border ${preset.border} ${
          showGlow ? preset.glow + " shadow-md" : ""
        } ${s.box} ${className}`}
      >
        {renderPresetIcon(preset.iconName, s.icon)}
      </div>
    );
  }

  // Fallback to name initials
  const initials = (name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative shrink-0 rounded-2xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-cyan-600 via-sky-700 to-indigo-800 border border-cyan-400/40 shadow-sm ${s.box} ${className}`}
    >
      {initials || <User className={s.icon} />}
    </div>
  );
}
