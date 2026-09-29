"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  EnemyUnit,
  TowerState,
  PowerUpInventory,
  FlyingArrow,
  ArcadeParticle,
} from "@/lib/games/tower-defense/types";
import MathText from "@/components/MathText";
import {
  Heart,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Crosshair,
  Snowflake,
  SplitSquareVertical,
  FastForward,
  Skull,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { playShotSound, playRicochetSound } from "@/lib/sound-haptics";

interface Props {
  currentEnemy: EnemyUnit | null;
  upcomingEnemies: EnemyUnit[];
  tower: TowerState;
  score: number;
  combo: number;
  waveNumber: number;
  timeRemainingSec: number;
  totalTimeSec: number;
  isFrozen: boolean;
  freezeRemainingSec: number;
  inventory: PowerUpInventory;
  soundMuted: boolean;
  isPaused: boolean;
  onSelectChoice: (choiceIndex: number) => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onActivateFreeze: () => void;
  onActivateFiftyFifty: () => void;
  onActivateExtraHeart: () => void;
  onActivateSkip: () => void;
  marchProgressPct: number; // 0 to 100%
  onArrowImpactResolved: (isCorrect: boolean) => void;
}

interface ShockwaveRing {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
}

const CHOICE_LETTERS = ["A", "B", "C", "D"];
const BUTTON_COLORS = [
  "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-cyan-950 shadow-cyan-500/40 ring-1 ring-cyan-400/50",
  "from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-emerald-950 shadow-emerald-500/40 ring-1 ring-emerald-400/50",
  "from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 shadow-amber-500/40 ring-1 ring-amber-400/50",
  "from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-fuchsia-950 shadow-fuchsia-500/40 ring-1 ring-fuchsia-400/50",
];

const ARROW_COLORS = [
  "from-cyan-300 to-blue-500",
  "from-emerald-300 to-teal-500",
  "from-amber-300 to-orange-500",
  "from-fuchsia-300 to-pink-500",
];

export default function ArcadeMobileBattlefield({
  currentEnemy,
  upcomingEnemies,
  tower,
  score,
  combo,
  waveNumber,
  timeRemainingSec,
  totalTimeSec,
  isFrozen,
  freezeRemainingSec,
  inventory,
  soundMuted,
  isPaused,
  onSelectChoice,
  onToggleMute,
  onTogglePause,
  onActivateFreeze,
  onActivateFiftyFifty,
  onActivateExtraHeart,
  onActivateSkip,
  marchProgressPct,
  onArrowImpactResolved,
}: Props) {
  // Arrow flight & Animation states
  const [activeArrows, setActiveArrows] = useState<FlyingArrow[]>([]);
  const [particles, setParticles] = useState<ArcadeParticle[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveRing[]>([]);
  const [turretRecoil, setTurretRecoil] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [enemyFlashing, setEnemyFlashing] = useState(false);
  const [shieldDeflectActive, setShieldDeflectActive] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: string; text: string; x: number; y: number; color: string }[]
  >([]);

  // Gun Turret Position (Center bottom)
  const gunX = 50; // 50%
  const gunY = 88; // 88%

  // Multi-lane tracking: target enemy has dynamic lane offset (-14%, 0%, +14%)
  const targetLaneOffset = useMemo(() => {
    if (!currentEnemy) return 0;
    const charCodeSum = currentEnemy.id
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const laneMod = (charCodeSum % 3) - 1; // -1, 0, or 1
    return laneMod * 14;
  }, [currentEnemy]);

  // Closest Target Enemy Position on battlefield (moves from y: 22% down to y: 78%)
  const targetX = 50 + targetLaneOffset;
  const targetY = 22 + (marchProgressPct / 100) * 56;

  // Calculate turret aim angle directly pointing to target enemy
  const aimAngleDeg = useMemo(() => {
    const dx = targetX - gunX;
    const dy = targetY - gunY;
    const rad = Math.atan2(dy, dx);
    return rad * (180 / Math.PI) + 90; // Upright 0deg
  }, [targetX, targetY]);

  // Spawn explosion particles on hit
  const spawnExplosion = useCallback((x: number, y: number, color = "#38bdf8") => {
    const newParticles: ArcadeParticle[] = [];
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 2.5 + Math.random() * 7;
      newParticles.push({
        id: `p-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 3 === 0 ? color : i % 3 === 1 ? "#fbbf24" : "#ffffff",
        size: 3 + Math.random() * 4.5,
        alpha: 1,
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // Add expanding shockwave ring
    setShockwaves((prev) => [
      ...prev,
      {
        id: `sw-${Date.now()}`,
        x,
        y,
        radius: 6,
        maxRadius: 38,
        color: color,
        opacity: 0.9,
      },
    ]);
  }, []);

  // Spawn metallic ricochet sparks on bounce
  const spawnRicochetSparks = useCallback((x: number, y: number) => {
    const sparks: ArcadeParticle[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.8; // spray downward/back
      const speed = 3.5 + Math.random() * 6;
      sparks.push({
        id: `sp-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? "#f43f5e" : "#fbbf24",
        size: 3,
        alpha: 1,
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...sparks]);
  }, []);

  // Shoot arrow handler when player presses A, B, C, or D
  const handleShootOption = useCallback(
    (choiceIndex: number) => {
      if (!currentEnemy || isPaused || activeArrows.length > 0) return;

      const isCorrect = choiceIndex === currentEnemy.shuffledCorrectIndex;
      const letter = CHOICE_LETTERS[choiceIndex] || "A";

      // Trigger machine gun recoil & sound
      setTurretRecoil(true);
      setTimeout(() => setTurretRecoil(false), 220);

      if (!soundMuted) {
        playShotSound();
      }

      // Create new flying arrow
      const newArrow: FlyingArrow = {
        id: `arrow-${Date.now()}`,
        letter,
        startX: gunX,
        startY: gunY,
        currentX: gunX,
        currentY: gunY,
        targetX,
        targetY,
        vx: (targetX - gunX) * 0.08,
        vy: (targetY - gunY) * 0.08,
        progress: 0,
        isCorrect,
        state: "flying",
        rotation: aimAngleDeg,
        createdAt: Date.now(),
      };

      setActiveArrows([newArrow]);

      // Call parent selection to register pending choice
      onSelectChoice(choiceIndex);
    },
    [
      currentEnemy,
      isPaused,
      activeArrows.length,
      soundMuted,
      gunX,
      gunY,
      targetX,
      targetY,
      aimAngleDeg,
      onSelectChoice,
    ]
  );

  // Main high-frame rate flight & particle animation loop
  useEffect(() => {
    let animFrame: number;

    const update = () => {
      // 1. Update Flying Arrows
      setActiveArrows((prevArrows) => {
        return prevArrows
          .map((arrow) => {
            if (arrow.state === "flying") {
              const nextProgress = arrow.progress + 0.07; // High-velocity flight
              if (nextProgress >= 1) {
                // Reached target enemy!
                if (arrow.isCorrect) {
                  // CORRECT! Direct hit & kill
                  spawnExplosion(arrow.targetX, arrow.targetY);
                  setEnemyFlashing(true);
                  setTimeout(() => setEnemyFlashing(false), 300);

                  const hitPts = 100 * (combo >= 2 ? combo : 1);
                  setFloatingTexts((ft) => [
                    ...ft,
                    {
                      id: `ft-${Date.now()}`,
                      text: `🎯 CRITICAL HIT! +${hitPts}`,
                      x: arrow.targetX,
                      y: arrow.targetY - 5,
                      color: "#38bdf8",
                    },
                  ]);

                  // Inform parent to credit points and advance
                  onArrowImpactResolved(true);
                  return null as unknown as FlyingArrow;
                } else {
                  // WRONG! Metallic bounce off shield and fall downward
                  if (!soundMuted) {
                    playRicochetSound();
                  }
                  spawnRicochetSparks(arrow.targetX, arrow.targetY);
                  setShieldDeflectActive(true);
                  setTimeout(() => setShieldDeflectActive(false), 400);

                  setScreenShake(true);
                  setTimeout(() => setScreenShake(false), 350);

                  setFloatingTexts((ft) => [
                    ...ft,
                    {
                      id: `ft-${Date.now()}`,
                      text: "🛡️ DEFLECTED! (-1 HP)",
                      x: arrow.targetX,
                      y: arrow.targetY - 5,
                      color: "#f43f5e",
                    },
                  ]);

                  // Inform parent of damage
                  onArrowImpactResolved(false);

                  // Bounce back with gravity
                  return {
                    ...arrow,
                    state: "bouncing" as const,
                    currentX: arrow.targetX,
                    currentY: arrow.targetY,
                    vx: (Math.random() - 0.5) * 8, // horizontal scatter
                    vy: 2.5, // start falling downward
                    rotation: arrow.rotation + 160,
                  };
                }
              }

              // Normal linear interpolation along trajectory
              const curX = arrow.startX + (arrow.targetX - arrow.startX) * nextProgress;
              const curY = arrow.startY + (arrow.targetY - arrow.startY) * nextProgress;
              return {
                ...arrow,
                progress: nextProgress,
                currentX: curX,
                currentY: curY,
              };
            } else if (arrow.state === "bouncing") {
              // Falling downward with gravity
              const nextY = arrow.currentY + arrow.vy;
              const nextX = arrow.currentX + arrow.vx;
              const nextVy = arrow.vy + 0.45; // gravity acceleration
              const nextRot = arrow.rotation + 18; // tumbling rotation

              if (nextY > 105) {
                // Fallen completely off screen
                return null as unknown as FlyingArrow;
              }

              return {
                ...arrow,
                currentX: nextX,
                currentY: nextY,
                vy: nextVy,
                rotation: nextRot,
              };
            }

            return arrow;
          })
          .filter(Boolean);
      });

      // 2. Update Particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.28,
            y: p.y + p.vy * 0.28,
            alpha: p.alpha - 0.04,
            life: p.life - 0.04,
          }))
          .filter((p) => p.life > 0)
      );

      // 3. Update Shockwaves
      setShockwaves((prev) =>
        prev
          .map((sw) => ({
            ...sw,
            radius: sw.radius + 2,
            opacity: sw.opacity - 0.05,
          }))
          .filter((sw) => sw.opacity > 0 && sw.radius < sw.maxRadius)
      );

      // 4. Update Floating Combat Texts
      setFloatingTexts((prev) =>
        prev
          .map((t) => ({ ...t, y: t.y - 0.4 }))
          .filter((t) => t.y > 4)
      );

      animFrame = requestAnimationFrame(update);
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [
    spawnExplosion,
    spawnRicochetSparks,
    onArrowImpactResolved,
    combo,
    soundMuted,
  ]);

  // Keyboard shortcut listener (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      const key = e.key.toUpperCase();

      if (["1", "2", "3", "4"].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        if (idx < (currentEnemy?.shuffledChoices.length || 0)) {
          handleShootOption(idx);
        }
      } else if (["A", "B", "C", "D"].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (idx < (currentEnemy?.shuffledChoices.length || 0)) {
          handleShootOption(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused, currentEnemy, handleShootOption]);

  const choices = currentEnemy?.shuffledChoices || [];
  const timePct = Math.max(0, Math.min(100, (timeRemainingSec / totalTimeSec) * 100));
  const isTimeLow = timeRemainingSec <= 5;

  return (
    <div className="relative py-2 flex justify-center w-full">
      {/* ========================================================================= */}
      {/* MOBILE WINDOW SHELL / ARCADE FRAME                                       */}
      {/* ========================================================================= */}
      <div
        className={`w-full max-w-[430px] min-h-[720px] h-[780px] max-h-[92vh] rounded-[42px] border-[6px] border-slate-800 bg-[#070b14] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] overflow-hidden relative flex flex-col justify-between select-none ${
          screenShake ? "animate-wiggle" : ""
        }`}
      >
        {/* Mobile Camera Notch / Speaker Grill */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-white/10 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <div className="h-1 w-10 rounded-full bg-slate-700" />
        </div>

        {/* Ambient Top Laser Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 z-30" />

        {/* ===================================================================== */}
        {/* 1. TOP PINNED HUD: STATS + COMPACT QUESTION CARD (SMALL FONT)         */}
        {/* ===================================================================== */}
        <div className="relative z-30 pt-6 px-3.5 pb-2 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-transparent backdrop-blur-md">
          {/* Mini Stats Bar */}
          <div className="flex items-center justify-between text-xs mb-2">
            {/* Health Hearts */}
            <div className="flex items-center gap-1">
              {Array.from({ length: tower.maxHp }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-transform ${
                    i < tower.hp
                      ? "text-rose-400 fill-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)] scale-100"
                      : "text-slate-800 opacity-30 scale-90"
                  }`}
                />
              ))}
            </div>

            {/* Wave & Combo */}
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-300 font-bold border border-white/5">
                Wave {waveNumber}
              </span>
              {combo >= 2 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono text-amber-300 font-bold border border-amber-400/30 animate-pulse">
                  {combo}x
                </span>
              )}
            </div>

            {/* Score & Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                {score.toLocaleString()}
              </span>

              <button
                onClick={onToggleMute}
                title={soundMuted ? "Unmute" : "Mute"}
                className="p-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
              >
                {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onTogglePause}
                title={isPaused ? "Resume" : "Pause"}
                className="p-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Smooth Timer Bar */}
          <div className="h-1 w-full rounded-full bg-slate-950 overflow-hidden mb-2 border border-white/5">
            <div
              className={`h-full transition-all duration-100 ease-linear rounded-full ${
                isTimeLow
                  ? "bg-rose-500"
                  : isFrozen
                  ? "bg-cyan-300 animate-pulse"
                  : "bg-gradient-to-r from-cyan-400 to-amber-400"
              }`}
              style={{ width: `${timePct}%` }}
            />
          </div>

          {/* Compact Question Prompt & Choices Header (Small Font - doesn't block vision) */}
          {currentEnemy && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-2.5 shadow-lg shadow-black/50">
              {/* Question Text in small, readable font */}
              <div className="text-[11px] sm:text-xs text-white font-medium leading-snug line-clamp-3 mb-2">
                <MathText text={currentEnemy.question.prompt} />
              </div>

              {/* 2x2 Compact Options Grid with tiny font */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {choices.map((choice, idx) => {
                  const letter = CHOICE_LETTERS[idx] || String(idx + 1);
                  const isEliminated = currentEnemy.eliminatedChoiceIndices.includes(idx);

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-1 p-1 rounded-lg border leading-tight ${
                        isEliminated
                          ? "border-slate-800 bg-slate-950/40 text-slate-600 line-through"
                          : "border-slate-800/80 bg-slate-950/60 text-slate-300"
                      }`}
                    >
                      <span className="font-mono font-bold text-cyan-400 shrink-0">
                        {letter}:
                      </span>
                      <span className="truncate">
                        <MathText text={choice} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* 2. CENTER BATTLEFIELD: MARCHING ENEMIES + RETICLE + FLYING ARROWS     */}
        {/* ===================================================================== */}
        <div className="relative flex-1 overflow-hidden">
          {/* Cyber Grid Lines on Battlefield */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1a30_1px,transparent_1px),linear-gradient(to_bottom,#0e1a30_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

          {/* Stasis Ice Wave Overlay if frozen */}
          {isFrozen && (
            <div className="absolute inset-0 z-10 bg-cyan-400/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-pulse">
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold">
                ❄️ Chronos Stasis Active ({Math.ceil(freezeRemainingSec)}s)
              </span>
            </div>
          )}

          {/* Pause Overlay inside mobile frame */}
          {isPaused && (
            <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
              <span className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                Wisdom Defense
              </span>
              <p className="text-xl font-display font-bold text-white mb-4">
                Tactical Pause
              </p>
              <button
                onClick={onTogglePause}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/25"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Battle</span>
              </button>
            </div>
          )}

          {/* Dynamic Laser Sight Beam from Machine Gun to Target Enemy */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1={`${gunX}%`}
              y1={`${gunY}%`}
              x2={`${targetX}%`}
              y2={`${targetY}%`}
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Approaching Queue Enemies (Further behind in background) */}
          {upcomingEnemies.slice(0, 2).map((enemy, idx) => {
            const queueY = 10 + idx * 8;
            return (
              <div
                key={enemy.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-500 opacity-40 shadow-sm"
                style={{ left: `${36 + idx * 28}%`, top: `${queueY}%` }}
              >
                {enemy.type === "boss" ? (
                  <Skull className="w-4 h-4 text-rose-400" />
                ) : (
                  <Shield className="w-4 h-4 text-cyan-400" />
                )}
              </div>
            );
          })}

          {/* THE CLOSEST HIGHLIGHTED TARGET ENEMY */}
          {currentEnemy && (
            <div
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300 ${
                enemyFlashing ? "brightness-200 scale-125" : ""
              }`}
              style={{ left: `${targetX}%`, top: `${targetY}%` }}
            >
              {/* Outer Pulsing Targeting Reticle Ring */}
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-cyan-400/80 animate-spin" />

              {/* TARGET Label Pill */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan-500 text-[9px] font-mono font-bold text-slate-950 shadow-md flex items-center gap-1 uppercase tracking-wider shrink-0">
                <Crosshair className="w-2.5 h-2.5" />
                <span>Target</span>
              </div>

              {/* Hexagonal Forcefield on Wrong Deflection */}
              {shieldDeflectActive && (
                <div className="absolute -inset-4 rounded-2xl border-2 border-rose-500 bg-rose-500/20 backdrop-blur-[1px] animate-ping" />
              )}

              {/* Target Enemy Unit Vessel */}
              <div
                className={`relative flex items-center justify-center h-14 w-14 rounded-2xl border-2 shadow-2xl transition-transform ${
                  currentEnemy.type === "boss"
                    ? "border-rose-400 bg-rose-950/90 text-rose-200 shadow-rose-500/50 scale-110"
                    : currentEnemy.type === "fast"
                    ? "border-cyan-400 bg-cyan-950/90 text-cyan-200 shadow-cyan-500/50"
                    : "border-amber-400 bg-slate-900 text-amber-300 shadow-amber-500/40"
                }`}
              >
                {currentEnemy.type === "boss" ? (
                  <Skull className="w-7 h-7 text-rose-400 animate-pulse" />
                ) : currentEnemy.type === "fast" ? (
                  <Zap className="w-7 h-7 text-cyan-400" />
                ) : (
                  <Shield className="w-6 h-6 text-amber-400" />
                )}

                {/* Enemy Health Bar */}
                {currentEnemy.maxHp > 1 && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-slate-950 border border-white/20 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{
                        width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FLYING ARROWS / PROJECTILES */}
          {activeArrows.map((arrow) => {
            const letterIdx = CHOICE_LETTERS.indexOf(arrow.letter);
            const colorGrad = ARROW_COLORS[letterIdx] || ARROW_COLORS[0];

            return (
              <div
                key={arrow.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                style={{
                  left: `${arrow.currentX}%`,
                  top: `${arrow.currentY}%`,
                  transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg)`,
                }}
              >
                {/* Arrow Shaft & Energy Head */}
                <div
                  className={`relative flex flex-col items-center justify-center px-2 py-3 rounded-full font-mono font-black text-xs shadow-2xl transition-transform ${
                    arrow.state === "bouncing"
                      ? "bg-rose-500 text-white shadow-rose-500/60 scale-90"
                      : `bg-gradient-to-t ${colorGrad} text-slate-950 shadow-cyan-400/80 scale-110`
                  }`}
                >
                  {/* Arrow Point / Barb */}
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-cyan-200 -mt-1" />

                  {/* Letter stamped on arrow body */}
                  <span className="font-extrabold text-[12px] drop-shadow-sm">
                    {arrow.letter}
                  </span>

                  {/* Rocket Trail Exhaust */}
                  <div className="w-1.5 h-4 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent rounded-full -mb-2 animate-pulse" />
                </div>
              </div>
            );
          })}

          {/* SHOCKWAVE PULSES */}
          {shockwaves.map((sw) => (
            <div
              key={sw.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none"
              style={{
                left: `${sw.x}%`,
                top: `${sw.y}%`,
                width: `${sw.radius * 2}px`,
                height: `${sw.radius * 2}px`,
                borderColor: sw.color,
                opacity: sw.opacity,
              }}
            />
          ))}

          {/* EXPLOSION & DEFLECTION PARTICLES */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.alpha,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          ))}

          {/* FLOATING COMBAT TEXTS */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute -translate-x-1/2 z-30 pointer-events-none font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-white/10 shadow-lg animate-bounce"
              style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color }}
            >
              {ft.text}
            </div>
          ))}

          {/* MACHINE GUN TURRET STATIONED AT BOTTOM */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-2 z-20 flex flex-col items-center pointer-events-none"
            style={{
              transform: `translate(-50%, 0) rotate(${aimAngleDeg * 0.45}deg) ${
                turretRecoil ? "translateY(6px)" : ""
              }`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* Dual Muzzle Flash when firing */}
            {turretRecoil && (
              <div className="flex gap-2 -mb-2">
                <div className="h-4 w-2 bg-amber-300 rounded-full animate-ping shadow-[0_0_12px_#f59e0b]" />
                <div className="h-4 w-2 bg-amber-300 rounded-full animate-ping shadow-[0_0_12px_#f59e0b]" />
              </div>
            )}

            {/* Dual Rifled Barrels */}
            <div className="flex gap-2 mb-1">
              <div className="h-7 w-2 bg-gradient-to-t from-slate-700 to-cyan-400 rounded-t-sm shadow-md" />
              <div className="h-7 w-2 bg-gradient-to-t from-slate-700 to-cyan-400 rounded-t-sm shadow-md" />
            </div>

            {/* Heavy Gun Turret Body */}
            <div className="h-9 w-12 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 border border-cyan-400/40 shadow-xl flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
            </div>

            {/* Turret Base Mount */}
            <div className="h-3 w-16 bg-slate-900 border-t border-white/20 rounded-t-lg" />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. BOTTOM CONTROLS: 4 FIRING BUTTONS (A, B, C, D) + POWERUPS          */}
        {/* ===================================================================== */}
        <div className="relative z-30 p-3 pt-2 bg-slate-950/95 border-t border-white/10 backdrop-blur-md">
          {/* Power-up Row */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5">
            <button
              onClick={onActivateFreeze}
              disabled={inventory.freeze <= 0 || isFrozen || isPaused}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
                inventory.freeze > 0 && !isFrozen
                  ? "border-cyan-400/40 bg-cyan-950/40 text-cyan-200 active:scale-95"
                  : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <Snowflake className="w-3 h-3 text-cyan-400" />
              <span>Stasis ({inventory.freeze})</span>
            </button>

            <button
              onClick={onActivateFiftyFifty}
              disabled={
                inventory.fiftyFifty <= 0 ||
                (currentEnemy?.eliminatedChoiceIndices.length ?? 0) > 0 ||
                isPaused
              }
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
                inventory.fiftyFifty > 0 &&
                (currentEnemy?.eliminatedChoiceIndices.length ?? 0) === 0
                  ? "border-emerald-400/40 bg-emerald-950/40 text-emerald-200 active:scale-95"
                  : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <SplitSquareVertical className="w-3 h-3 text-emerald-400" />
              <span>50/50 ({inventory.fiftyFifty})</span>
            </button>

            <button
              onClick={onActivateExtraHeart}
              disabled={inventory.extraHeart <= 0 || tower.hp >= tower.maxHp || isPaused}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
                inventory.extraHeart > 0 && tower.hp < tower.maxHp
                  ? "border-rose-400/40 bg-rose-950/40 text-rose-200 active:scale-95"
                  : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <Heart className="w-3 h-3 text-rose-400" />
              <span>+1 HP ({inventory.extraHeart})</span>
            </button>

            <button
              onClick={onActivateSkip}
              disabled={inventory.skip <= 0 || isPaused}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
                inventory.skip > 0
                  ? "border-amber-400/40 bg-amber-950/40 text-amber-200 active:scale-95"
                  : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>Skip ({inventory.skip})</span>
            </button>
          </div>

          {/* THE 4 FIRING BUTTONS: [ A ], [ B ], [ C ], [ D ] */}
          <div className="grid grid-cols-4 gap-2">
            {CHOICE_LETTERS.map((letter, idx) => {
              const isEliminated = currentEnemy?.eliminatedChoiceIndices.includes(idx);
              const colorGradient = BUTTON_COLORS[idx] || BUTTON_COLORS[0];

              return (
                <button
                  key={letter}
                  disabled={isEliminated || isPaused || activeArrows.length > 0}
                  onClick={() => handleShootOption(idx)}
                  className={`group relative flex flex-col items-center justify-center py-3 rounded-2xl font-mono font-black text-lg transition-all cursor-pointer shadow-lg active:scale-90 ${
                    isEliminated
                      ? "border border-slate-800 bg-slate-900 text-slate-700 opacity-30 cursor-not-allowed"
                      : isPaused || activeArrows.length > 0
                      ? "bg-slate-800 text-slate-400 opacity-60 cursor-default"
                      : `bg-gradient-to-b ${colorGradient} active:brightness-125`
                  }`}
                >
                  <span className="leading-none drop-shadow-sm">{letter}</span>
                  <span className="text-[9px] font-sans font-bold tracking-wider uppercase opacity-75 mt-0.5">
                    Fire
                  </span>
                </button>
              );
            })}
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-[10px] font-mono text-slate-500 mt-2">
            Tap button or press keys [A, B, C, D] to shoot arrow
          </p>
        </div>
      </div>
    </div>
  );
}
