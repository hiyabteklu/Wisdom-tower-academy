export type UserPreferences = {
  notifApplications: boolean;
  notifMessages: boolean;
  notifMarketing: boolean;
  notifPathUpdates: boolean;
  reducedMotion: boolean;
  compactUI: boolean;
  emailDigest: "off" | "daily" | "weekly";
  language: "en" | "am";
};

export const DEFAULT_PREFS: UserPreferences = {
  notifApplications: true,
  notifMessages: true,
  notifMarketing: false,
  notifPathUpdates: true,
  reducedMotion: false,
  compactUI: false,
  emailDigest: "weekly",
  language: "en",
};

const KEY = "wt-preferences";

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
  if (prefs.reducedMotion) {
    document.documentElement.classList.add("force-reduced-motion");
  } else {
    document.documentElement.classList.remove("force-reduced-motion");
  }
}
