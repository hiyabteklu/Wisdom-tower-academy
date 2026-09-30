"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  EnemyUnit,
  TowerState,
  PowerUpInventory,
  PowerUpType,
  DefenseRunStats,
  TowerTrack,
  MissedQuestionReview,
  EnemyType,
} from "@/lib/games/tower-defense/types";
import {
  STARTING_TOWER_HEALTH,
  MAX_TOWER_HEALTH,
  INITIAL_POWER_UPS,
  CHRONOS_STASIS_DURATION_SEC,
  getComboMultiplier,
  BASE_POINTS,
  getWaveConfig,
  calculateDefenseRank,
} from "@/lib/games/tower-defense/config";
import { fairShuffleChoices } from "@/lib/games/tower-defense/fair-shuffle";
import { saveDefenseRun } from "@/lib/games/tower-defense/high-scores";
import ArcadeMobileBattlefield from "./ArcadeMobileBattlefield";
import BreachResolutionModal from "./BreachResolutionModal";
import WaveClearedModal from "./WaveClearedModal";
import ResultsModal from "./ResultsModal";
import TowerSelector from "./TowerSelector";
import {
  playCorrectSound,
  playWrongSound,
  playFiftyPercentSound,
  playCelebrationSound,
  triggerHaptic,
} from "@/lib/sound-haptics";
import { triggerCorrectConfetti } from "@/lib/confetti";
import {
  Shield,
  Heart,
  Snowflake,
  SplitSquareVertical,
  FastForward,
  Pause,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type GamePhase =
  | "select-tower"
  | "playing"
  | "breach-modal"
  | "wave-clear"
  | "game-over";

interface Props {
  initialTowerId?: string;
  onExit?: () => void;
}

export default function TowerDefenseGame({ initialTowerId, onExit }: Props) {
  const router = useRouter();

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    } else {
      router.push("/learning");
    }
  }, [onExit, router]);

  // Navigation & High-level State
  const [phase, setPhase] = useState<GamePhase>("select-tower");
  const [selectedTrack, setSelectedTrack] = useState<TowerTrack | null>(null);

  // Core Game Session State
  const [currentWave, setCurrentWave] = useState(1);
  const [tower, setTower] = useState<TowerState>({
    maxHp: MAX_TOWER_HEALTH,
    hp: STARTING_TOWER_HEALTH,
    isBreached: false,
  });
  const [inventory, setInventory] = useState<PowerUpInventory>(INITIAL_POWER_UPS);

  // Active Combat State
  const [enemiesQueue, setEnemiesQueue] = useState<EnemyUnit[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<EnemyUnit | null>(null);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(25);
  const [totalQuestionTimeSec, setTotalQuestionTimeSec] = useState<number>(25);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [freezeRemainingSec, setFreezeRemainingSec] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Scoring & Metrics
  const [score, setScore] = useState(0);
  const [waveStartScore, setWaveStartScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestionReview[]>([]);
  const [finalStats, setFinalStats] = useState<DefenseRunStats | null>(null);

  // Educational Breach Modal State
  const [breachInfo, setBreachInfo] = useState<{
    prompt: string;
    selectedText?: string;
    correctText: string;
    solution?: string;
    isTimeout: boolean;
  } | null>(null);

  // Staged choice selection ref for flying arrow
  const pendingChoiceRef = useRef<number | null>(null);

  // Question pool cycling index
  const questionPoolIndexRef = useRef(0);

  // Generate Enemy Unit from Exam Questions
  const createEnemyUnit = useCallback(
    (type: EnemyType, timeLimitSec: number): EnemyUnit => {
      if (!selectedTrack || selectedTrack.questions.length === 0) {
        throw new Error("No exam questions available in track");
      }

      // Pick next question from exam list (loops fairly with reshuffle)
      const qIndex = questionPoolIndexRef.current % selectedTrack.questions.length;
      questionPoolIndexRef.current += 1;
      const baseQuestion = selectedTrack.questions[qIndex];

      const { shuffledChoices, shuffledCorrectIndex } = fairShuffleChoices(
        baseQuestion.choices,
        baseQuestion.correctIndex
      );

      const isTankOrBoss = type === "tank" || type === "boss";
      const maxHp = isTankOrBoss ? 2 : 1;

      return {
        id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: baseQuestion,
        shuffledChoices,
        shuffledCorrectIndex,
        eliminatedChoiceIndices: [],
        type,
        maxHp,
        hp: maxHp,
        speedMultiplier: type === "fast" ? 1.3 : 1.0,
        timeLimitSec,
        title: baseQuestion.examTitle,
        loreLabel: type === "boss" ? "Grand Inquisitor" : "Academic Adversary",
      };
    },
    [selectedTrack]
  );

  // Initialize Wave Enemies
  const startWave = useCallback(
    (waveNum: number) => {
      if (!selectedTrack) return;
      const config = getWaveConfig(waveNum);
      const newEnemies: EnemyUnit[] = [];

      for (let i = 0; i < config.enemyCount; i++) {
        let type: EnemyType = "basic";
        if (config.hasBoss && i === config.enemyCount - 1) {
          type = "boss";
        } else if (waveNum >= 2 && i % 3 === 1) {
          type = "fast";
        } else if (waveNum >= 3 && i === config.enemyCount - 2) {
          type = "tank";
        }
        newEnemies.push(createEnemyUnit(type, config.timePerQuestionSec));
      }

      setWaveStartScore(score);
      setEnemiesQueue(newEnemies.slice(1));
      setCurrentEnemy(newEnemies[0]);
      setTimeRemainingSec(config.timePerQuestionSec);
      setTotalQuestionTimeSec(config.timePerQuestionSec);
      setIsFrozen(false);
      setFreezeRemainingSec(0);
      setPhase("playing");
    },
    [selectedTrack, createEnemyUnit, score]
  );

  // Start a new Run with chosen Citadel
  const handleSelectTrack = useCallback(
    (track: TowerTrack) => {
      setSelectedTrack(track);
      questionPoolIndexRef.current = 0;
      setCurrentWave(1);
      setTower({ maxHp: MAX_TOWER_HEALTH, hp: STARTING_TOWER_HEALTH, isBreached: false });
      setInventory(INITIAL_POWER_UPS);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setAttemptedCount(0);
      setCorrectCount(0);
      setMissedQuestions([]);
      setFinalStats(null);
      setIsPaused(false);

      // Start wave 1
      setTimeout(() => {
        const config = getWaveConfig(1);
        const enemies: EnemyUnit[] = [];
        for (let i = 0; i < config.enemyCount; i++) {
          let type: EnemyType = "basic";
          if (i === 1) type = "fast";
          // Pick question
          const qIndex = i % track.questions.length;
          const q = track.questions[qIndex];
          const { shuffledChoices, shuffledCorrectIndex } = fairShuffleChoices(
            q.choices,
            q.correctIndex
          );
          enemies.push({
            id: `enemy-${Date.now()}-${i}`,
            question: q,
            shuffledChoices,
            shuffledCorrectIndex,
            eliminatedChoiceIndices: [],
            type,
            maxHp: 1,
            hp: 1,
            speedMultiplier: type === "fast" ? 1.3 : 1.0,
            timeLimitSec: config.timePerQuestionSec,
            title: q.examTitle,
            loreLabel: "Academic Adversary",
          });
        }
        questionPoolIndexRef.current = config.enemyCount;
        setEnemiesQueue(enemies.slice(1));
        setCurrentEnemy(enemies[0]);
        setTimeRemainingSec(config.timePerQuestionSec);
        setTotalQuestionTimeSec(config.timePerQuestionSec);
        setPhase("playing");
      }, 50);
    },
    []
  );

  // End the game session and record local statistics
  const triggerGameOver = useCallback(
    (clearedWaves: number) => {
      if (!selectedTrack) return;
      const acc = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
      const defenseRank = calculateDefenseRank(clearedWaves, acc);
      const earnedXp = score + clearedWaves * 250;

      const stats: DefenseRunStats = {
        towerId: selectedTrack.id,
        towerTitle: selectedTrack.title,
        subject: selectedTrack.subject,
        score,
        waveReached: currentWave,
        wavesCleared: clearedWaves,
        totalQuestions: attemptedCount,
        correctAnswers: correctCount,
        accuracyPct: acc,
        maxCombo,
        defenseXp: earnedXp,
        defenseRank,
        dateIso: new Date().toISOString(),
        missedQuestions,
      };

      saveDefenseRun(stats);
      setFinalStats(stats);
      setPhase("game-over");
    },
    [
      selectedTrack,
      attemptedCount,
      correctCount,
      score,
      currentWave,
      maxCombo,
      missedQuestions,
    ]
  );

  // Advance to next enemy in wave or trigger wave completion
  const advanceToNextEnemy = useCallback(() => {
    if (enemiesQueue.length > 0) {
      const next = enemiesQueue[0];
      setEnemiesQueue((prev) => prev.slice(1));
      setCurrentEnemy(next);
      setTimeRemainingSec(next.timeLimitSec);
      setTotalQuestionTimeSec(next.timeLimitSec);
      setIsFrozen(false);
      setFreezeRemainingSec(0);
      setPhase("playing");
    } else {
      // Wave cleared!
      if (!soundMuted) playCelebrationSound();
      triggerHaptic("celebrate");
      triggerCorrectConfetti();
      setPhase("wave-clear");
    }
  }, [enemiesQueue, soundMuted]);

  // Handle Timeout (Enemy breaches citadel)
  const handleTimeout = useCallback(() => {
    if (!currentEnemy) return;

    setAttemptedCount((a) => a + 1);
    setCombo(0);

    const newHp = Math.max(0, tower.hp - 1);
    setTower((prev) => ({ ...prev, hp: newHp }));

    if (!soundMuted) playWrongSound();
    triggerHaptic("wrong");

    const correctChoiceText =
      currentEnemy.shuffledChoices[currentEnemy.shuffledCorrectIndex] || "Correct Choice";

    const missedItem: MissedQuestionReview = {
      question: currentEnemy.question,
      correctChoiceText,
      solution: currentEnemy.question.solution,
      timestamp: Date.now(),
    };
    setMissedQuestions((prev) => [...prev, missedItem]);

    setBreachInfo({
      prompt: currentEnemy.question.prompt,
      correctText: correctChoiceText,
      solution: currentEnemy.question.solution,
      isTimeout: true,
    });

    setPhase("breach-modal");
  }, [currentEnemy, tower.hp, soundMuted]);

  // Main countdown timer and march progress loop
  useEffect(() => {
    if (phase !== "playing" || isPaused || !currentEnemy) return;

    const interval = setInterval(() => {
      if (isFrozen) {
        setFreezeRemainingSec((sec) => {
          if (sec <= 1) {
            setIsFrozen(false);
            return 0;
          }
          return sec - 0.1;
        });
      } else {
        setTimeRemainingSec((prev) => {
          const next = prev - 0.1;
          if (next <= 0) {
            clearInterval(interval);
            handleTimeout();
            return 0;
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase, isPaused, isFrozen, currentEnemy, handleTimeout]);

  // Player clicks choice / fires machine gun arrow
  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      if (!currentEnemy || phase !== "playing" || isPaused) return;
      pendingChoiceRef.current = choiceIndex;
      setAttemptedCount((a) => a + 1);
    },
    [currentEnemy, phase, isPaused]
  );

  // Arrow impacts target enemy (or deflects and bounces back if wrong)
  const handleArrowImpactResolved = useCallback(
    (isCorrect: boolean) => {
      if (!currentEnemy) return;
      const choiceIndex = pendingChoiceRef.current ?? 0;

      if (isCorrect) {
        // Correct answer!
        if (currentEnemy.hp > 1) {
          // Multi-hit tank/boss enemy
          setCurrentEnemy((prev) => (prev ? { ...prev, hp: prev.hp - 1 } : null));
          if (!soundMuted) playFiftyPercentSound();
          triggerHaptic("light");
          setScore((s) => s + 50);
        } else {
          // Enemy destroyed!
          const nextCombo = combo + 1;
          setCombo(nextCombo);
          if (nextCombo > maxCombo) setMaxCombo(nextCombo);

          const multiplier = getComboMultiplier(nextCombo);
          const points = (BASE_POINTS[currentEnemy.type] || 100) * multiplier;
          setScore((s) => s + points);
          setCorrectCount((c) => c + 1);

          if (!soundMuted) playCorrectSound();
          triggerHaptic("correct");

          if (nextCombo >= 5) {
            triggerCorrectConfetti();
          }

          advanceToNextEnemy();
        }
      } else {
        // Wrong answer: Tower damage + Educational breakdown
        const newHp = Math.max(0, tower.hp - 1);
        setTower((prev) => ({ ...prev, hp: newHp }));
        setCombo(0);

        if (!soundMuted) playWrongSound();
        triggerHaptic("wrong");

        const selectedText = currentEnemy.shuffledChoices[choiceIndex];
        const correctChoiceText =
          currentEnemy.shuffledChoices[currentEnemy.shuffledCorrectIndex] || "Correct Choice";

        const missedItem: MissedQuestionReview = {
          question: currentEnemy.question,
          selectedChoiceIndex: choiceIndex,
          selectedChoiceText: selectedText,
          correctChoiceText,
          solution: currentEnemy.question.solution,
          timestamp: Date.now(),
        };
        setMissedQuestions((prev) => [...prev, missedItem]);

        // Small delay so student sees the arrow ricochet off the shield and tumble down
        setTimeout(() => {
          setBreachInfo({
            prompt: currentEnemy.question.prompt,
            selectedText,
            correctText: correctChoiceText,
            solution: currentEnemy.question.solution,
            isTimeout: false,
          });
          setPhase("breach-modal");
        }, 500);
      }
    },
    [
      currentEnemy,
      combo,
      maxCombo,
      tower.hp,
      soundMuted,
      advanceToNextEnemy,
    ]
  );

  // Resume after learning from breach modal
  const handleAcknowledgeBreach = useCallback(() => {
    setBreachInfo(null);
    if (tower.hp <= 0) {
      // Citadel health depleted
      triggerGameOver(currentWave - 1);
    } else {
      advanceToNextEnemy();
    }
  }, [tower.hp, currentWave, triggerGameOver, advanceToNextEnemy]);

  // Deploy next wave after choosing reward
  const handleDeployNextWave = useCallback(
    (chosenPowerUp: PowerUpType) => {
      // Add selected supply to inventory
      setInventory((prev) => ({
        ...prev,
        [chosenPowerUp]: prev[chosenPowerUp] + 1,
      }));

      // If heart chosen, immediately repair 1 HP if damaged
      if (chosenPowerUp === "extraHeart") {
        setTower((t) => ({ ...t, hp: Math.min(t.maxHp, t.hp + 1) }));
      }

      const nextWave = currentWave + 1;
      setCurrentWave(nextWave);
      startWave(nextWave);
    },
    [currentWave, startWave]
  );

  // Power-up triggers
  const activateFreeze = useCallback(() => {
    if (inventory.freeze <= 0 || isFrozen || phase !== "playing") return;
    setInventory((inv) => ({ ...inv, freeze: inv.freeze - 1 }));
    setIsFrozen(true);
    setFreezeRemainingSec(CHRONOS_STASIS_DURATION_SEC);
    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
  }, [inventory.freeze, isFrozen, phase, soundMuted]);

  const activateFiftyFifty = useCallback(() => {
    if (!currentEnemy || inventory.fiftyFifty <= 0 || phase !== "playing") return;
    if (currentEnemy.eliminatedChoiceIndices.length > 0) return; // Already used on this enemy

    const choicesCount = currentEnemy.shuffledChoices.length;
    if (choicesCount <= 2) return;

    // Pick 2 wrong choice indices to eliminate
    const wrongIndices = Array.from({ length: choicesCount })
      .map((_, i) => i)
      .filter((i) => i !== currentEnemy.shuffledCorrectIndex);

    const shuffledWrongs = [...wrongIndices].sort(() => Math.random() - 0.5);
    const toEliminate = shuffledWrongs.slice(0, 2);

    setCurrentEnemy((prev) =>
      prev ? { ...prev, eliminatedChoiceIndices: toEliminate } : null
    );
    setInventory((inv) => ({ ...inv, fiftyFifty: inv.fiftyFifty - 1 }));

    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
  }, [currentEnemy, inventory.fiftyFifty, phase, soundMuted]);

  const activateExtraHeart = useCallback(() => {
    if (inventory.extraHeart <= 0 || tower.hp >= tower.maxHp || phase !== "playing") return;
    setInventory((inv) => ({ ...inv, extraHeart: inv.extraHeart - 1 }));
    setTower((t) => ({ ...t, hp: Math.min(t.maxHp, t.hp + 1) }));
    if (!soundMuted) playCelebrationSound();
    triggerHaptic("celebrate");
  }, [inventory.extraHeart, tower.hp, tower.maxHp, phase, soundMuted]);

  const activateSkip = useCallback(() => {
    if (!currentEnemy || inventory.skip <= 0 || phase !== "playing") return;
    setInventory((inv) => ({ ...inv, skip: inv.skip - 1 }));
    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
    advanceToNextEnemy();
  }, [currentEnemy, inventory.skip, phase, soundMuted, advanceToNextEnemy]);

  const marchProgressPct = useMemo(() => {
    if (totalQuestionTimeSec <= 0) return 0;
    return Math.max(0, Math.min(100, ((totalQuestionTimeSec - timeRemainingSec) / totalQuestionTimeSec) * 100));
  }, [timeRemainingSec, totalQuestionTimeSec]);

  const comboMultiplier = getComboMultiplier(combo);

  // If in tower selection mode, render selector
  if (phase === "select-tower" || !selectedTrack) {
    return <TowerSelector onSelectTower={handleSelectTrack} />;
  }

  // If game over, render results debrief
  if (phase === "game-over" && finalStats) {
    return (
      <ResultsModal
        stats={finalStats}
        onRetry={() => handleSelectTrack(selectedTrack)}
        onSelectAnotherTower={() => setPhase("select-tower")}
      />
    );
  }

  return (
    <div className="relative min-h-[85vh] py-3 sm:py-6 flex flex-col items-center justify-center">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full blur-[140px] opacity-15 bg-sky-500" />
      </div>

      <ArcadeMobileBattlefield
        currentEnemy={currentEnemy}
        upcomingEnemies={enemiesQueue}
        tower={tower}
        score={score}
        combo={combo}
        waveNumber={currentWave}
        timeRemainingSec={timeRemainingSec}
        totalTimeSec={totalQuestionTimeSec}
        isFrozen={isFrozen}
        freezeRemainingSec={freezeRemainingSec}
        inventory={inventory}
        soundMuted={soundMuted}
        isPaused={isPaused}
        onSelectChoice={handleSelectChoice}
        onToggleMute={() => setSoundMuted(!soundMuted)}
        onTogglePause={() => setIsPaused(!isPaused)}
        onActivateFreeze={activateFreeze}
        onActivateFiftyFifty={activateFiftyFifty}
        onActivateExtraHeart={activateExtraHeart}
        onActivateSkip={activateSkip}
        marchProgressPct={marchProgressPct}
        onArrowImpactResolved={handleArrowImpactResolved}
        onExit={handleExit}
      />

      {/* Educational Breach Breakdown Modal */}
      {breachInfo && (
        <BreachResolutionModal
          isOpen={phase === "breach-modal"}
          questionPrompt={breachInfo.prompt}
          selectedChoiceText={breachInfo.selectedText}
          correctChoiceText={breachInfo.correctText}
          solution={breachInfo.solution}
          isTimeout={breachInfo.isTimeout}
          towerHpRemaining={tower.hp}
          onContinue={handleAcknowledgeBreach}
        />
      )}

      {/* Wave Cleared Reward Modal */}
      <WaveClearedModal
        isOpen={phase === "wave-clear"}
        waveNumber={currentWave}
        waveScore={score - waveStartScore}
        currentCombo={combo}
        accuracyPct={
          attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 100
        }
        onDeployNextWave={handleDeployNextWave}
      />
    </div>
  );
}
