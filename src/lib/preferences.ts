export type UserPreferences = {
  // Notifications
  notifDailyStudy: boolean;
  notifExams: boolean;
  notifScholarships: boolean;
  notifPayment: boolean;
  notifMarketing: boolean;
  emailDigest: "off" | "daily" | "weekly";

  // App & Webview Display
  amoledMode: boolean;
  compactUI: boolean;
  reducedMotion: boolean;
  dataSaver: boolean;
  soundEffects: boolean;
  fontSize: "compact" | "normal" | "large" | "xlarge";
  readingFont: "sans" | "serif" | "mono";

  // Study & Goals
  studyGoalMinutes: number;
  focusSessionDuration: number;
  preferredStudyTime: "morning" | "afternoon" | "evening" | "night";

  // Regional
  language: "en" | "am";
};

export const DEFAULT_PREFS: UserPreferences = {
  notifDailyStudy: true,
  notifExams: true,
  notifScholarships: true,
  notifPayment: true,
  notifMarketing: false,
  emailDigest: "weekly",

  amoledMode: false,
  compactUI: false,
  reducedMotion: false,
  dataSaver: false,
  soundEffects: true,
  fontSize: "normal",
  readingFont: "sans",

  studyGoalMinutes: 45,
  focusSessionDuration: 25,
  preferredStudyTime: "evening",

  language: "en",
};

const KEY = "wt-preferences";
export const PREFS_UPDATED_EVENT = "wt-preferences-updated";

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function applyPreferenceClasses(prefs: UserPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Reduced motion
  if (prefs.reducedMotion) {
    root.classList.add("force-reduced-motion");
  } else {
    root.classList.remove("force-reduced-motion");
  }

  // AMOLED mode
  if (prefs.amoledMode) {
    root.classList.add("amoled-mode");
  } else {
    root.classList.remove("amoled-mode");
  }

  // Font scale
  root.classList.remove(
    "font-scale-compact",
    "font-scale-normal",
    "font-scale-large",
    "font-scale-xlarge"
  );
  root.classList.add(`font-scale-${prefs.fontSize || "normal"}`);

  // Reading font
  root.classList.remove(
    "reading-font-sans",
    "reading-font-serif",
    "reading-font-mono"
  );
  root.classList.add(`reading-font-${prefs.readingFont || "sans"}`);
}

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore storage quota errors */
  }

  applyPreferenceClasses(prefs);

  window.dispatchEvent(
    new CustomEvent(PREFS_UPDATED_EVENT, { detail: prefs })
  );
}
