"use client";

import { useState } from "react";
import Image from "next/image";
import StudentAvatar from "@/components/StudentAvatar";
import { type StudentIdData } from "@/lib/student-id";
import { RotateCw, ShieldCheck } from "lucide-react";

interface StudentIdCardProps {
  idData: StudentIdData;
  studentName: string;
  avatarPreset?: string | null;
  avatarUrl?: string | null;
  educationLevel?: string | null;
  stream?: string | null;
  schoolName?: string | null;
  region?: string | null;
  className?: string;
}

export default function StudentIdCard({
  idData,
  studentName,
  avatarPreset,
  avatarUrl,
  educationLevel,
  stream,
  schoolName,
  region,
  className = "",
}: StudentIdCardProps) {
  const [flipped, setFlipped] = useState(false);

  const academicTrackDisplay = educationLevel || idData.academicTrack;
  const schoolDisplay = schoolName || idData.institutionName;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Clickable / Tappable 3D Card Container */}
      <div
        onClick={() => setFlipped((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-label="Tap card to flip between front and back sides"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((prev) => !prev);
          }
        }}
        className="relative mx-auto max-w-[430px] aspect-[1.586/1] [perspective:1200px] cursor-pointer group select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl sm:rounded-3xl transition-transform duration-200 active:scale-[0.98]"
        title="Tap anywhere to flip card"
      >
        <div
          className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ========================================================= */}
          {/* FRONT FACE OF STUDENT ID CARD                            */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 [backface-visibility:hidden] overflow-hidden border border-amber-400/35 bg-gradient-to-br from-[#0c1427] via-[#09101f] to-[#040711] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.12)] flex flex-col justify-between text-white group-hover:border-amber-400/55 transition-colors">
            {/* Holographic Security Guilloche Texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 16px), repeating-linear-gradient(-45deg, #06b6d4 0, #06b6d4 1px, transparent 0, transparent 16px)",
              }}
            />

            {/* Subtle Metallic Top Band */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-sm" />

            {/* Top Institutional Header */}
            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 p-1 flex items-center justify-center shrink-0 shadow-inner">
                  <Image
                    src="/images/brand/logo.png"
                    alt="Wisdom Tower Academy Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-amber-300/90 leading-tight">
                    Wisdom Tower Academy
                  </p>
                  <p className="text-[9px] font-semibold text-slate-300 tracking-wider uppercase">
                    Official Student Credential
                  </p>
                </div>
              </div>

              {/* Status & Country Seal */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {idData.status}
                </span>
                <p className="text-[8.5px] font-mono text-wisdom-muted mt-0.5">
                  ETHIOPIA
                </p>
              </div>
            </div>

            {/* Main Card Body */}
            <div className="relative z-10 grid grid-cols-[82px_1fr] sm:grid-cols-[96px_1fr] gap-3 sm:gap-4 items-center my-auto py-1">
              {/* Photo & ID Badge Box */}
              <div className="flex flex-col items-center">
                <div className="relative p-1 rounded-2xl border-2 border-amber-400/40 bg-gradient-to-b from-amber-400/20 to-transparent shadow-lg">
                  <StudentAvatar
                    avatarPreset={avatarPreset}
                    avatarUrl={avatarUrl}
                    name={studentName}
                    size="xl"
                    className="rounded-xl shadow-inner"
                    showGlow={false}
                  />
                  <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-black/85 text-amber-300 border border-amber-400/40 shadow-sm flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Metadata Information */}
              <div className="min-w-0 space-y-1">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-wisdom-muted">
                    Full Legal Name
                  </p>
                  <h3 className="font-display text-sm sm:text-base font-extrabold text-white truncate leading-tight tracking-tight">
                    {studentName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-wisdom-muted">
                      Student ID No.
                    </p>
                    <p className="font-mono text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                      {idData.idNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-wisdom-muted">
                      Registry Folio
                    </p>
                    <p className="font-mono text-[11px] sm:text-xs font-semibold text-slate-300 truncate">
                      {idData.folioNumber}
                    </p>
                  </div>
                </div>

                <div className="pt-0.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-wisdom-muted">
                    Academic Scope & Level
                  </p>
                  <p className="text-[11px] sm:text-xs font-semibold text-cyan-300 truncate">
                    {academicTrackDisplay}
                    {stream ? ` · ${stream}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Validity Bar with Barcode */}
            <div className="relative z-10 pt-2.5 border-t border-white/10 flex items-end justify-between gap-3 text-[9px]">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 text-slate-300 text-[8.5px] sm:text-[9.5px]">
                  <span>
                    <strong className="text-wisdom-muted uppercase tracking-wider">Issued:</strong>{" "}
                    {idData.issueDateFull}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-amber-400/90 uppercase tracking-wider">Valid Until:</strong>{" "}
                    {idData.expiryDateFull}
                  </span>
                </div>
                <p className="text-[8.5px] text-wisdom-muted truncate">
                  {schoolDisplay} {region ? `(${region})` : ""}
                </p>
              </div>

              {/* Realistic Barcode Graphic */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 h-5 px-1 bg-white/95 rounded">
                  <span className="w-0.5 h-4 bg-black" />
                  <span className="w-1 h-4 bg-black" />
                  <span className="w-0.5 h-4 bg-black" />
                  <span className="w-1.5 h-4 bg-black" />
                  <span className="w-0.5 h-4 bg-black" />
                  <span className="w-2 h-4 bg-black" />
                  <span className="w-0.5 h-4 bg-black" />
                  <span className="w-1 h-4 bg-black" />
                  <span className="w-1.5 h-4 bg-black" />
                  <span className="w-0.5 h-4 bg-black" />
                </div>
                <span className="font-mono text-[8px] text-wisdom-muted tracking-widest block mt-0.5">
                  {idData.numericId}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BACK FACE OF STUDENT ID CARD                             */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden border border-white/15 bg-gradient-to-br from-[#070c17] via-[#091122] to-[#04060c] shadow-2xl flex flex-col justify-between text-white group-hover:border-amber-400/40 transition-colors">
            {/* Magnetic Tape Simulation */}
            <div className="absolute top-4 inset-x-0 h-9 bg-neutral-900 border-y border-white/10" />

            <div className="pt-11 space-y-3 relative z-10 text-[10px] text-slate-300/90 leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wider text-[9px]">
                  Institutional Terms & Conditions
                </p>
                <p className="text-[9px] text-wisdom-muted leading-tight">
                  This digital credential certifies active enrollment in Wisdom Tower Academy. It
                  authorizes the named scholar to access designated curriculum repositories, examination
                  simulations, and academic resource hubs.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-wisdom-muted block uppercase text-[8px]">
                    Academic Registry
                  </span>
                  <span className="font-semibold text-white">Wisdom Tower Academy</span>
                </div>
                <div>
                  <span className="text-wisdom-muted block uppercase text-[8px]">
                    Validity Period
                  </span>
                  <span className="font-semibold text-amber-300">1 Academic Year</span>
                </div>
                <div>
                  <span className="text-wisdom-muted block uppercase text-[8px]">
                    Official Support
                  </span>
                  <span className="text-cyan-300 font-mono">support@wisdomtower.et</span>
                </div>
                <div>
                  <span className="text-wisdom-muted block uppercase text-[8px]">
                    Credential Verification
                  </span>
                  <span className="text-white font-mono">wisdomtower.et/verify</span>
                </div>
              </div>
            </div>

            {/* Registrar Signature & Seal */}
            <div className="relative z-10 border-t border-white/10 pt-2 flex items-center justify-between text-[9px]">
              <div>
                <p className="font-mono text-[8px] text-wisdom-muted">AUTHORIZATION SEAL</p>
                <p className="font-serif italic text-amber-300 font-semibold text-xs">
                  Academic Affairs Registrar
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] text-slate-300">
                  REF: {idData.idNumber}
                </span>
                <p className="text-[8px] text-emerald-400 font-semibold">
                  DIGITALLY SIGNED & VERIFIED
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tap to Flip Notice Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setFlipped((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-300 hover:text-amber-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/35 transition-all shadow-sm cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-400 transition-transform duration-500 group-hover:rotate-180" />
          <span>{flipped ? "Tap to view front side" : "Tap card to flip (Front / Back)"}</span>
        </button>
      </div>
    </div>
  );
}
