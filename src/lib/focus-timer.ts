/**
 * Persistent focus timer — survives route changes via localStorage.
 */

export const FOCUS_STORAGE_KEY = "wt_focus_timer_v1";
export const FOCUS_EVENT = "wt-focus-timer";

export type FocusState = {
  totalSec: number;
  /** Absolute end timestamp (ms). null when paused/stopped */
  endAt: number | null;
  /** Remaining seconds when paused */
  leftWhenPaused: number;
  running: boolean;
};

const DEFAULT: FocusState = {
  totalSec: 25 * 60,
  endAt: null,
  leftWhenPaused: 25 * 60,
  running: false,
};

export function readFocusState(): FocusState {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<FocusState>;
    return {
      totalSec: Number(p.totalSec) || DEFAULT.totalSec,
      endAt: typeof p.endAt === "number" ? p.endAt : null,
      leftWhenPaused: Number(p.leftWhenPaused) || DEFAULT.leftWhenPaused,
      running: Boolean(p.running && p.endAt),
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function writeFocusState(state: FocusState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(FOCUS_EVENT));
}

export function remainingSec(state: FocusState, now = Date.now()): number {
  if (state.running && state.endAt) {
    return Math.max(0, Math.ceil((state.endAt - now) / 1000));
  }
  return Math.max(0, state.leftWhenPaused);
}

export function startFocus(totalOrLeft?: number) {
  const cur = readFocusState();
  const left = totalOrLeft ?? remainingSec(cur);
  if (left <= 0) return;
  const next: FocusState = {
    totalSec: totalOrLeft && totalOrLeft === cur.totalSec ? cur.totalSec : cur.totalSec,
    endAt: Date.now() + left * 1000,
    leftWhenPaused: left,
    running: true,
  };
  if (totalOrLeft && !cur.running && left === totalOrLeft) {
    next.totalSec = totalOrLeft;
  }
  writeFocusState(next);
}

export function pauseFocus() {
  const cur = readFocusState();
  const left = remainingSec(cur);
  writeFocusState({
    ...cur,
    endAt: null,
    leftWhenPaused: left,
    running: false,
  });
}

export function resetFocus(sec?: number) {
  const total = sec ?? readFocusState().totalSec;
  writeFocusState({
    totalSec: total,
    endAt: null,
    leftWhenPaused: total,
    running: false,
  });
}

export function setPreset(sec: number) {
  writeFocusState({
    totalSec: sec,
    endAt: null,
    leftWhenPaused: sec,
    running: false,
  });
}

/** Short lines shown when starting a focus session */
export const FOCUS_START_LINES = [
  "One block of focus now beats a whole evening of half-work.",
  "Stay with this session. Future you will thank you.",
  "Quiet phone. Open notes. This hour is yours.",
  "You already started. That is the hard part.",
  "Small steady work beats last-minute panic.",
  "This is practice for the person you want to become.",
  "Keep going. Clarity comes after you sit with the work.",
  "Your classmates are studying too. Match their effort.",
];

/** Shown when user tries to stop or leave mid-session */
export const FOCUS_NUDGE_LINES = [
  {
    face: "😤",
    title: "Already quitting?",
    body: "You set a timer for a reason. Finish this block, then rest without guilt.",
  },
  {
    face: "😔",
    title: "Walking away early",
    body: "Every stop mid-session makes the next start harder. Stay a little longer.",
  },
  {
    face: "🫠",
    title: "Procrastination dressed as a break",
    body: "If you leave now, the work is still waiting. Better to close the timer properly later.",
  },
  {
    face: "👀",
    title: "Still time on the clock",
    body: "Scroll and chats will be there after this session. Your exam date will not move.",
  },
  {
    face: "😕",
    title: "Almost there",
    body: "Stopping now wastes the focus you already built. Hold on until the timer ends.",
  },
];

export function pickStartLine() {
  return FOCUS_START_LINES[Math.floor(Math.random() * FOCUS_START_LINES.length)]!;
}

export function pickNudge() {
  return FOCUS_NUDGE_LINES[Math.floor(Math.random() * FOCUS_NUDGE_LINES.length)]!;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatFocusClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}
