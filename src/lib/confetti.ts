"use client";

import confetti from "canvas-confetti";

/**
 * Confetti burst effect that triggers immediately when a user selects the correct answer.
 * The confetti shoots upward from the tapped option, fills the screen momentarily with vibrant colors,
 * and gently floats down before fading out.
 */
export function triggerCorrectConfetti(sourceElement?: HTMLElement | null) {
  if (typeof window === "undefined") return;

  let originX = 0.5;
  let originY = 0.6;

  if (sourceElement && typeof sourceElement.getBoundingClientRect === "function") {
    try {
      const rect = sourceElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        originX = Math.max(0.1, Math.min(0.9, (rect.left + rect.width / 2) / window.innerWidth));
        originY = Math.max(0.1, Math.min(0.9, (rect.top + rect.height / 2) / window.innerHeight));
      }
    } catch {
      // Fallback to screen center-lower
    }
  }

  // Vibrant academic and victory palette
  const colors = [
    "#22e0ff", // Bright cyan
    "#38bdf8", // Sky blue
    "#34d399", // Emerald
    "#10b981", // Deep green
    "#fbbf24", // Amber gold
    "#f59e0b", // Warm gold
    "#a855f7", // Violet
    "#f43f5e", // Rose
  ];

  // Upward burst from the tapped option
  confetti({
    particleCount: 55,
    angle: 90,
    spread: 70,
    startVelocity: 42,
    decay: 0.92,
    gravity: 0.8,
    ticks: 230,
    origin: { x: originX, y: originY },
    colors,
    disableForReducedMotion: true,
  });

  // Secondary burst to momentarily fill the screen with gentle float down
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 90,
      spread: 110,
      startVelocity: 36,
      decay: 0.94,
      gravity: 0.65,
      ticks: 260,
      origin: { x: originX, y: Math.max(0.05, originY - 0.04) },
      colors,
      disableForReducedMotion: true,
    });
  }, 80);
}
