"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  EnemyUnit,
  TowerState,
  PowerUpInventory,
  FlyingArrow,
  ArcadeParticle,
} from "@/lib/games/tower-defense/types";
import MathText from "@/components/MathText";
import ArmoredSoldierSprite from "./ArmoredSoldierSprite";
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
  ArrowLeft,
  Shield,
  Zap,
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
  onExit?: () => void;
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

interface ShellCasing {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  alpha: number;
}

const CHOICE_LETTERS = ["A", "B", "C", "D"];

const BUTTON_THEMES = [
  {
    bg: "from-cyan-600 via-cyan-500 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-slate-950 shadow-cyan-500/40 border-cyan-300",
    arrowGrad: "from-cyan-300 via-sky-400 to-blue-600",
    glow: "#38bdf8",
  },
  {
    bg: "from-emerald-600 via-emerald-500 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-slate-950 shadow-emerald-500/40 border-emerald-300",
    arrowGrad: "from-emerald-300 via-teal-400 to-emerald-600",
    glow: "#34d399",
  },
  {
    bg: "from-amber-500 via-amber-400 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/40 border-amber-300",
    arrowGrad: "from-amber-300 via-yellow-400 to-orange-600",
    glow: "#fbbf24",
  },
  {
    bg: "from-fuchsia-600 via-fuchsia-500 to-pink-700 hover:from-fuchsia-500 hover:to-pink-600 text-slate-950 shadow-fuchsia-500/40 border-fuchsia-300",
    arrowGrad: "from-fuchsia-300 via-pink-400 to-purple-600",
    glow: "#f472b6",
  },
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
  onExit,
}: Props) {
  // Animation states
  const [activeArrows, setActiveArrows] = useState<FlyingArrow[]>([]);
  const [particles, setParticles] = useState<ArcadeParticle[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveRing[]>([]);
  const [shellCasings, setShellCasings] = useState<ShellCasing[]>([]);
  const [turretRecoil, setTurretRecoil] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [targetHitFlash, setTargetHitFlash] = useState(false);
  const [deflectShieldActive, setDeflectShieldActive] = useState(false);
  const [walkingTick, setWalkingTick] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: string; text: string; x: number; y: number; color: string }[]
  >([]);

  // Gun Turret Position (Center bottom)
  const gunX = 50; // 50%
  const gunY = 88; // 88%

  // Tactical lane offset (-12%, 0%, +12%)
  const targetLaneOffset = useMemo(() => {
    if (!currentEnemy) return 0;
    const sum = currentEnemy.id
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const mod = (sum % 3) - 1; // -1, 0, or 1
    return mod * 12;
  }, [currentEnemy]);

  // Target soldier position (moves from y: 34% down to 74% as timer advances)
  const targetX = 50 + targetLaneOffset;
  const targetY = 34 + (marchProgressPct / 100) * 40;

  // Real-time distance in meters (counts down from 35m down to 4m)
  const distanceMeters = Math.max(
    4,
    Math.round(35 - (marchProgressPct / 100) * 31)
  );

  // Target scale grows as soldier approaches the player's perimeter
  const targetScale = 1.15 + (marchProgressPct / 100) * 0.35;

  // Calculate turret aim angle directly pointing to target enemy's center
  const aimAngleDeg = useMemo(() => {
    const dx = targetX - gunX;
    const dy = targetY - gunY;
    const rad = Math.atan2(dy, dx);
    return rad * (180 / Math.PI) + 90; // 0deg is straight up
  }, [targetX, targetY]);

  // Spawn explosion particles on hit
  const spawnExplosion = useCallback((x: number, y: number, color = "#38bdf8") => {
    const newParticles: ArcadeParticle[] = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 8;
      newParticles.push({
        id: `p-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 3 === 0 ? color : i % 3 === 1 ? "#fbbf24" : "#ffffff",
        size: 3 + Math.random() * 5,
        alpha: 1,
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // Expanding shockwave ring
    setShockwaves((prev) => [
      ...prev,
      {
        id: `sw-${Date.now()}`,
        x,
        y,
        radius: 8,
        maxRadius: 42,
        color,
        opacity: 0.95,
      },
    ]);
  }, []);

  // Spawn metallic ricochet sparks on bounce
  const spawnRicochetSparks = useCallback((x: number, y: number) => {
    const sparks: ArcadeParticle[] = [];
    for (let i = 0; i < 22; i++) {
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 2; // spray downward/back
      const speed = 4 + Math.random() * 7;
      sparks.push({
        id: `sp-${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? "#f43f5e" : "#fbbf24",
        size: 3.5,
        alpha: 1,
        life: 1,
      });
    }
    setParticles((prev) => [...prev, ...sparks]);
  }, []);

  // Eject spent machine gun brass casing
  const ejectShellCasing = useCallback(() => {
    const newCasing: ShellCasing = {
      id: `casing-${Date.now()}`,
      x: gunX + 2,
      y: gunY - 2,
      vx: 3 + Math.random() * 3, // eject rightwards
      vy: -2.5 - Math.random() * 2, // pop up slightly
      rotation: Math.random() * 360,
      alpha: 1,
    };
    setShellCasings((prev) => [...prev, newCasing]);
  }, [gunX, gunY]);

  // Shoot arrow handler when player taps A, B, C, or D
  const handleShootOption = useCallback(
    (choiceIndex: number) => {
      if (!currentEnemy || isPaused || activeArrows.length > 0) return;

      const isCorrect = choiceIndex === currentEnemy.shuffledCorrectIndex;
      const letter = CHOICE_LETTERS[choiceIndex] || "A";

      // Trigger heavy gun recoil & shell ejection
      setTurretRecoil(true);
      setTimeout(() => setTurretRecoil(false), 220);
      ejectShellCasing();

      if (!soundMuted) {
        playShotSound();
      }

      // Create new flying ballistic arrow
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

      // Inform parent of selected choice
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
      ejectShellCasing,
      onSelectChoice,
    ]
  );

  // Main high-frame rate flight, soldier walking, & particle animation loop
  useEffect(() => {
    let animFrame: number;

    const update = () => {
      // Marching tick
      setWalkingTick((t) => t + 0.1);

      // 1. Update Flying Arrows
      setActiveArrows((prevArrows) => {
        return prevArrows
          .map((arrow) => {
            if (arrow.state === "flying") {
              const nextProgress = arrow.progress + 0.075; // Fast ballistic flight
              if (nextProgress >= 1) {
                // Reached target soldier!
                if (arrow.isCorrect) {
                  // CORRECT! Direct hit on armored soldier
                  spawnExplosion(arrow.targetX, arrow.targetY);
                  setTargetHitFlash(true);
                  setTimeout(() => setTargetHitFlash(false), 300);

                  const hitPts = 100 * (combo >= 2 ? combo : 1);
                  setFloatingTexts((ft) => [
                    ...ft,
                    {
                      id: `ft-${Date.now()}`,
                      text: `🎯 TARGET NEUTRALIZED! +${hitPts}`,
                      x: arrow.targetX,
                      y: arrow.targetY - 8,
                      color: "#38bdf8",
                    },
                  ]);

                  // Inform parent to credit points and advance
                  onArrowImpactResolved(true);
                  return null as unknown as FlyingArrow;
                } else {
                  // WRONG! Metallic deflection off armor plate
                  if (!soundMuted) {
                    playRicochetSound();
                  }
                  spawnRicochetSparks(arrow.targetX, arrow.targetY);
                  setDeflectShieldActive(true);
                  setTimeout(() => setDeflectShieldActive(false), 400);

                  setScreenShake(true);
                  setTimeout(() => setScreenShake(false), 350);

                  setFloatingTexts((ft) => [
                    ...ft,
                    {
                      id: `ft-${Date.now()}`,
                      text: "🛡️ ARMOR DEFLECTION! (-1 HP)",
                      x: arrow.targetX,
                      y: arrow.targetY - 8,
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
                    vy: 2.2, // initial downward bounce
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
              // Falling downward with gravity acceleration
              const nextY = arrow.currentY + arrow.vy;
              const nextX = arrow.currentX + arrow.vx;
              const nextVy = arrow.vy + 0.45; // gravity
              const nextRot = arrow.rotation + 18; // tumbling rotation

              if (nextY > 105) {
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

      // 2. Update Shell Casings
      setShellCasings((prev) =>
        prev
          .map((sc) => ({
            ...sc,
            x: sc.x + sc.vx * 0.25,
            y: sc.y + sc.vy * 0.25,
            vy: sc.vy + 0.4, // gravity
            rotation: sc.rotation + 12,
            alpha: sc.alpha - 0.03,
          }))
          .filter((sc) => sc.alpha > 0 && sc.y < 105)
      );

      // 3. Update Particles
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

      // 4. Update Shockwaves
      setShockwaves((prev) =>
        prev
          .map((sw) => ({
            ...sw,
            radius: sw.radius + 2.2,
            opacity: sw.opacity - 0.05,
          }))
          .filter((sw) => sw.opacity > 0 && sw.radius < sw.maxRadius)
      );

      // 5. Update Floating Combat Texts
      setFloatingTexts((prev) =>
        prev
          .map((t) => ({ ...t, y: t.y - 0.35 }))
          .filter((t) => t.y > 2)
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
    /* ========================================================================= */
    /* FULLSCREEN SEAMLESS MOBILE VIEWPORT (ZERO SCROLLBARS FOR WEBVIEW APP)     */
    /* ========================================================================= */
    <div
      className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#030712] text-slate-100 flex flex-col justify-between select-none touch-none overscroll-none ${
        screenShake ? "animate-wiggle" : ""
      }`}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Dynamic Laser Border at Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 z-50" />

      {/* ===================================================================== */}
      {/* 1. TOP MILITARY GLASS HUD: EXIT + STATS + COMPACT QUESTION CARD       */}
      {/* ===================================================================== */}
      <div className="relative z-40 w-full max-w-lg mx-auto pt-2.5 sm:pt-4 px-3 sm:px-4 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-transparent backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-xs mb-2 gap-2">
          {/* Exit / Back Button */}
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
              title="Exit Battle"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold">Exit</span>
            </button>
          )}

          {/* Armor Plates (Health) */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/5">
            {Array.from({ length: tower.maxHp }).map((_, i) => (
              <Shield
                key={i}
                className={`w-3.5 h-3.5 transition-transform ${
                  i < tower.hp
                    ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.7)] scale-100"
                    : "text-slate-800 opacity-30 scale-90"
                }`}
              />
            ))}
            <span className="text-[10px] font-mono font-bold text-slate-300 ml-1">
              {tower.hp}/{tower.maxHp}
            </span>
          </div>

          {/* Wave & Combo */}
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono text-cyan-300 font-bold border border-cyan-400/20 shadow-sm">
              WAVE {waveNumber}
            </span>
            {combo >= 2 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono text-amber-300 font-bold border border-amber-400/40 animate-pulse">
                {combo}x STREAK
              </span>
            )}
          </div>

          {/* Score & Audio/Pause */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-black text-white px-2 py-0.5 rounded-lg bg-slate-900/80 border border-white/5">
              {score.toLocaleString()}
            </span>

            <button
              onClick={onToggleMute}
              title={soundMuted ? "Unmute" : "Mute"}
              className="p-1 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onTogglePause}
              title={isPaused ? "Resume" : "Pause"}
              className="p-1 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Smooth Countdown Timer Bar */}
        <div className="h-1 w-full rounded-full bg-slate-950 overflow-hidden mb-2 border border-white/5">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              isTimeLow
                ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                : isFrozen
                ? "bg-cyan-300 animate-pulse shadow-[0_0_8px_#38bdf8]"
                : "bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400"
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>

        {/* Compact Question Prompt & Choices Header (Small font - does NOT block view) */}
        {currentEnemy && (
          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/90 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md">
            {/* Question Text in small, legible academic font */}
            <div className="text-[11px] sm:text-xs text-white font-medium leading-snug line-clamp-3 mb-1.5">
              <MathText text={currentEnemy.question.prompt} />
            </div>

            {/* 2x2 Compact Choices Grid with small font */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {choices.map((choice, idx) => {
                const letter = CHOICE_LETTERS[idx] || String(idx + 1);
                const isEliminated = currentEnemy.eliminatedChoiceIndices.includes(idx);

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-1 p-1 rounded-lg border leading-tight ${
                      isEliminated
                        ? "border-slate-800 bg-slate-950/40 text-slate-600 line-through opacity-40"
                        : "border-slate-800/80 bg-slate-900/60 text-slate-200"
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
      {/* 2. REALISTIC BATTLEFIELD: MULTI-DISTANCE MARCHING ARMORED SOLDIERS   */}
      {/* ===================================================================== */}
      <div className="relative flex-1 w-full max-w-lg mx-auto overflow-hidden">
        {/* Receding Perspective Warzone Ground Surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080d1a] via-[#050914] to-[#02050d] pointer-events-none" />

        {/* Tactical Battlefield Perspective Grid Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
          <defs>
            <linearGradient id="gridFade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Converging perspective runway lines toward horizon */}
          <line x1="50%" y1="10%" x2="10%" y2="100%" stroke="url(#gridFade)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="50%" y1="10%" x2="30%" y2="100%" stroke="url(#gridFade)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50%" y1="10%" x2="70%" y2="100%" stroke="url(#gridFade)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50%" y1="10%" x2="90%" y2="100%" stroke="url(#gridFade)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Tactical Distance Markers across ground */}
          <line x1="38%" y1="18%" x2="62%" y2="18%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="30%" y1="36%" x2="70%" y2="36%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="20%" y1="56%" x2="80%" y2="56%" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="12%" y1="76%" x2="88%" y2="76%" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" />
        </svg>

        {/* Tactical Distance Labels on Terrain */}
        <div className="absolute top-[18%] left-3 text-[8px] font-mono text-slate-600 pointer-events-none uppercase tracking-wider">
          RANGE 80m
        </div>
        <div className="absolute top-[36%] left-3 text-[8px] font-mono text-slate-500 pointer-events-none uppercase tracking-wider">
          RANGE 50m
        </div>
        <div className="absolute top-[56%] left-3 text-[8px] font-mono text-cyan-500/70 pointer-events-none uppercase tracking-wider">
          RANGE 25m
        </div>
        <div className="absolute top-[76%] left-3 text-[8px] font-mono text-rose-500/80 pointer-events-none uppercase tracking-wider font-bold">
          PERIMETER 5m
        </div>

        {/* Stasis Chronos Freeze Overlay */}
        {isFrozen && (
          <div className="absolute inset-0 z-20 bg-cyan-400/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-pulse">
            <span className="px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold shadow-lg">
              ❄️ CHRONOS STASIS ACTIVE ({Math.ceil(freezeRemainingSec)}s)
            </span>
          </div>
        )}

        {/* Tactical Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
              WISDOM TOWER DEFENSE
            </span>
            <p className="text-xl font-display font-bold text-white mb-4">
              Tactical Engagement Paused
            </p>
            <button
              onClick={onTogglePause}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Combat</span>
            </button>
          </div>
        )}

        {/* Weapon Laser Sight Aim Line from Turret to Target Soldier */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1={`${gunX}%`}
            y1={`${gunY}%`}
            x2={`${targetX}%`}
            y2={`${targetY}%`}
            stroke="rgba(244, 63, 94, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Laser dot on soldier's chest */}
          <circle cx={`${targetX}%`} cy={`${targetY}%`} r="3" fill="#f43f5e" className="animate-ping" />
        </svg>

        {/* ── DISTANCE PLANE 1: FAR HORIZON SQUAD (80m - 100m away) ── */}
        <div className="absolute top-[14%] left-0 right-0 flex justify-around pointer-events-none z-10">
          <div style={{ transform: "translateX(-20px)" }}>
            <ArmoredSoldierSprite
              type="basic"
              hp={1}
              maxHp={1}
              scale={0.42}
              opacity={0.5}
              distanceMeters={85}
              walkingOffset={walkingTick}
            />
          </div>
          <div style={{ transform: "translateX(20px)" }}>
            <ArmoredSoldierSprite
              type="basic"
              hp={1}
              maxHp={1}
              scale={0.42}
              opacity={0.5}
              distanceMeters={85}
              walkingOffset={walkingTick + 1.5}
            />
          </div>
        </div>

        {/* ── DISTANCE PLANE 2: MID-RANGE VANGUARD SQUAD (45m - 60m away) ── */}
        <div className="absolute top-[28%] left-0 right-0 flex justify-between px-10 pointer-events-none z-15">
          <div>
            <ArmoredSoldierSprite
              type={upcomingEnemies[0]?.type || "fast"}
              hp={1}
              maxHp={1}
              scale={0.7}
              opacity={0.75}
              distanceMeters={55}
              walkingOffset={walkingTick + 2.5}
            />
          </div>
          <div>
            <ArmoredSoldierSprite
              type={upcomingEnemies[1]?.type || "basic"}
              hp={1}
              maxHp={1}
              scale={0.7}
              opacity={0.75}
              distanceMeters={55}
              walkingOffset={walkingTick + 0.8}
            />
          </div>
        </div>

        {/* ── DISTANCE PLANE 3: THE CLOSEST TARGET ARMORED SOLDIER ── */}
        {currentEnemy && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300"
            style={{
              left: `${targetX}%`,
              top: `${targetY}%`,
            }}
          >
            {/* Hexagonal Shield Flash on Wrong Answer Deflection */}
            {deflectShieldActive && (
              <div className="absolute -inset-6 rounded-3xl border-2 border-rose-500 bg-rose-500/25 backdrop-blur-[1px] animate-ping pointer-events-none z-40" />
            )}

            {/* Armored Soldier Sprite */}
            <ArmoredSoldierSprite
              type={currentEnemy.type}
              hp={currentEnemy.hp}
              maxHp={currentEnemy.maxHp}
              isTarget={true}
              isFrozen={isFrozen}
              isHit={targetHitFlash}
              scale={targetScale}
              distanceMeters={distanceMeters}
              walkingOffset={walkingTick}
            />
          </div>
        )}

        {/* FLYING BALLISTIC ARROW PROJECTILES */}
        {activeArrows.map((arrow) => {
          const letterIdx = CHOICE_LETTERS.indexOf(arrow.letter);
          const theme = BUTTON_THEMES[letterIdx] || BUTTON_THEMES[0];

          return (
            <div
              key={arrow.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
              style={{
                left: `${arrow.currentX}%`,
                top: `${arrow.currentY}%`,
                transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg)`,
              }}
            >
              {/* Ballistic Arrow Body */}
              <div
                className={`relative flex flex-col items-center justify-center px-2 py-3.5 rounded-full font-mono font-black text-xs shadow-2xl transition-transform ${
                  arrow.state === "bouncing"
                    ? "bg-rose-500 text-white shadow-rose-500/80 scale-95"
                    : `bg-gradient-to-t ${theme.arrowGrad} text-slate-950 shadow-[0_0_15px_${theme.glow}] scale-110`
                }`}
              >
                {/* Razor Sharp Arrowhead Barb */}
                <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[9px] border-b-white -mt-1.5" />

                {/* Stamped Option Letter */}
                <span className="font-black text-[13px] drop-shadow-md">
                  {arrow.letter}
                </span>

                {/* Fiery Rocket Tracer Exhaust Flame */}
                <div className="w-2 h-5 bg-gradient-to-b from-amber-300 via-orange-500 to-transparent rounded-full -mb-2.5 animate-pulse" />
              </div>
            </div>
          );
        })}

        {/* BALLISTIC IMPACT SHOCKWAVES */}
        {shockwaves.map((sw) => (
          <div
            key={sw.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 pointer-events-none z-35"
            style={{
              left: `${sw.x}%`,
              top: `${sw.y}%`,
              width: `${sw.radius * 2}px`,
              height: `${sw.radius * 2}px`,
              borderColor: sw.color,
              opacity: sw.opacity,
              boxShadow: `0 0 12px ${sw.color}`,
            }}
          />
        ))}

        {/* EXPLOSION & DEFLECTION SPARK PARTICLES */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-35"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.alpha,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}

        {/* EJECTED BRASS SHELL CASINGS */}
        {shellCasings.map((sc) => (
          <div
            key={sc.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-35"
            style={{
              left: `${sc.x}%`,
              top: `${sc.y}%`,
              transform: `translate(-50%, -50%) rotate(${sc.rotation}deg)`,
              opacity: sc.alpha,
            }}
          >
            <div className="w-1.5 h-3 rounded-sm bg-gradient-to-r from-amber-400 to-yellow-600 border border-amber-300 shadow-sm" />
          </div>
        ))}

        {/* FLOATING TACTICAL COMBAT TEXTS */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute -translate-x-1/2 z-50 pointer-events-none font-mono font-black text-xs px-3 py-1 rounded-full bg-slate-950/95 border border-white/20 shadow-2xl animate-bounce"
            style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color }}
          >
            {ft.text}
          </div>
        ))}

        {/* ── 3. HEAVY MACHINE GUN TURRET EMPLACEMENT AT BOTTOM ── */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-1 z-35 flex flex-col items-center pointer-events-none"
          style={{
            transform: `translate(-50%, 0) rotate(${aimAngleDeg * 0.45}deg) ${
              turretRecoil ? "translateY(7px)" : ""
            }`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Dual Muzzle Flash Flares when firing */}
          {turretRecoil && (
            <div className="flex gap-2.5 -mb-3 z-40">
              <div className="h-6 w-3 bg-amber-300 rounded-full animate-ping shadow-[0_0_18px_#f59e0b]" />
              <div className="h-6 w-3 bg-amber-300 rounded-full animate-ping shadow-[0_0_18px_#f59e0b]" />
            </div>
          )}

          {/* Dual Heavy Rifled Barrels */}
          <div className="flex gap-2.5 mb-1">
            <div className="h-8 w-2.5 bg-gradient-to-t from-slate-800 via-slate-700 to-cyan-400 rounded-t-sm border-x border-slate-600 shadow-md" />
            <div className="h-8 w-2.5 bg-gradient-to-t from-slate-800 via-slate-700 to-cyan-400 rounded-t-sm border-x border-slate-600 shadow-md" />
          </div>

          {/* Heavy Gun Chassis Body with Ammo Belt Feed */}
          <div className="h-10 w-14 rounded-xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-cyan-400/50 shadow-2xl flex items-center justify-center relative">
            <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse" />
            {/* Ammo feed chute */}
            <div className="absolute -left-3 top-2 w-3.5 h-6 bg-amber-500/80 border border-amber-300 rounded-l-sm" />
          </div>

          {/* Heavy Armored Turret Base Mount */}
          <div className="h-4 w-20 bg-slate-900 border-t border-white/30 rounded-t-xl shadow-lg" />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. BOTTOM CONTROLS: 4 LARGE FIRING BUTTONS (A, B, C, D) + POWERUPS   */}
      {/* ===================================================================== */}
      <div className="relative z-40 w-full max-w-lg mx-auto p-2.5 sm:p-3 pt-2 bg-slate-950/95 border-t border-white/10 backdrop-blur-md">
        {/* Tactical Power-Ups Bar */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <button
            onClick={onActivateFreeze}
            disabled={inventory.freeze <= 0 || isFrozen || isPaused}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              inventory.freeze > 0 && !isFrozen
                ? "border-cyan-400/50 bg-cyan-950/40 text-cyan-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span>STASIS ({inventory.freeze})</span>
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
                ? "border-emerald-400/50 bg-emerald-950/40 text-emerald-200 active:scale-95"
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
                ? "border-rose-400/50 bg-rose-950/40 text-rose-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <Shield className="w-3 h-3 text-rose-400" />
            <span>REPAIR ({inventory.extraHeart})</span>
          </button>

          <button
            onClick={onActivateSkip}
            disabled={inventory.skip <= 0 || isPaused}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              inventory.skip > 0
                ? "border-amber-400/50 bg-amber-950/40 text-amber-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <FastForward className="w-3 h-3 text-amber-400" />
            <span>SKIP ({inventory.skip})</span>
          </button>
        </div>

        {/* 4 Chunky Mobile Thumb Firing Buttons: [ A ], [ B ], [ C ], [ D ] */}
        <div className="grid grid-cols-4 gap-2">
          {CHOICE_LETTERS.map((letter, idx) => {
            const isEliminated = currentEnemy?.eliminatedChoiceIndices.includes(idx);
            const theme = BUTTON_THEMES[idx] || BUTTON_THEMES[0];

            return (
              <button
                key={letter}
                disabled={isEliminated || isPaused || activeArrows.length > 0}
                onClick={() => handleShootOption(idx)}
                className={`group relative flex flex-col items-center justify-center py-3 sm:py-3.5 rounded-2xl font-mono font-black text-lg transition-all cursor-pointer shadow-lg active:scale-90 border ${
                  isEliminated
                    ? "border-slate-800 bg-slate-900 text-slate-700 opacity-30 cursor-not-allowed"
                    : isPaused || activeArrows.length > 0
                    ? "border-slate-800 bg-slate-800 text-slate-400 opacity-60 cursor-default"
                    : `bg-gradient-to-b ${theme.bg} active:brightness-125`
                }`}
              >
                <span className="leading-none drop-shadow-md text-xl sm:text-2xl font-black">
                  {letter}
                </span>
                <span className="text-[9px] font-sans font-bold tracking-widest uppercase opacity-85 mt-0.5">
                  FIRE
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Keyboard / Controller Hint */}
        <p className="text-center text-[10px] font-mono text-slate-500 mt-1.5">
          Tap [A, B, C, D] or press keys 1–4 to fire at locked-on soldier
        </p>
      </div>
    </div>
  );
}
