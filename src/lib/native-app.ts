/**
 * Android WebView Detection & Native App Bridge for Wisdom Tower Academy
 *
 * Distinguishes the native Android Jetpack Compose WebView app from
 * regular web browsers (including Chrome on Android, mobile Safari, desktop).
 *
 * In regular browsers:
 *   Normal loading indicators (BrandLoader, circular spinner) remain visible.
 *
 * In native Android app:
 *   The native Jetpack Compose app provides its own Wisdom Tower GIF animation.
 *   The website's generic circular spinner is hidden/disabled so only the native GIF plays.
 */

declare global {
  interface Window {
    Android?: unknown;
    AndroidBridge?: unknown;
    WisdomTower?: unknown;
    wtaNative?: unknown;
    __wtaNativeApp?: boolean;
    __wtaStructuralBack?: () => boolean;
    __wtaHardRefresh?: () => void;
  }
}

/**
 * Checks if the current environment is running inside the native Android WebView.
 * Guaranteed to NEVER treat standard Chrome on Android or desktop browsers as native app.
 */
export function isAndroidWebView(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    // 1. Check DOM class (set synchronously in <head>)
    if (
      document.documentElement.classList.contains("wta-native-app") ||
      document.body?.classList.contains("wta-native-app")
    ) {
      return true;
    }

    // 2. Check cached session/local storage
    try {
      if (
        sessionStorage.getItem("wta-native-app") === "1" ||
        localStorage.getItem("wta-native-app") === "1"
      ) {
        markDocumentNative();
        return true;
      }
    } catch {
      /* ignore storage access restrictions */
    }

    // 3. Check JavaScript Bridge interfaces injected by Android WebView
    if (
      Boolean(
        window.Android ||
        window.AndroidBridge ||
        window.WisdomTower ||
        window.wtaNative ||
        window.__wtaNativeApp
      )
    ) {
      persistAndMarkNative();
      return true;
    }

    // 4. Check query parameters or hash passed by native app (e.g. ?app=1, ?native=1, ?wta=1)
    const search = window.location.search || "";
    const hash = window.location.hash || "";
    if (
      /(?:[?&])(?:app|native|wta|platform)=(?:1|true|android|wta)/i.test(search) ||
      /(?:[#&])(?:app|native|wta)=(?:1|true|android|wta)/i.test(hash)
    ) {
      persistAndMarkNative();
      return true;
    }

    // 5. Inspect User Agent for Chromium Android WebView tokens
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);

    if (isAndroid) {
      // Custom app identifier
      if (/WisdomTowerApp|WisdomTower|wta-native/i.test(ua)) {
        persistAndMarkNative();
        return true;
      }

      // Chromium standard Android WebView token: "; wv)" or " wv" in build string
      // Regular Chrome for Android NEVER includes the 'wv' token.
      const hasWvToken = /\bwv\b/i.test(ua);
      const hasVersion4 = /Version\/4\.0/i.test(ua);

      if (hasWvToken || (hasVersion4 && !/Chrome\/[0-9.]+\s+Mobile\s+Safari/i.test(ua.replace(/Version\/4\.0/, "")))) {
        persistAndMarkNative();
        return true;
      }
    }
  } catch {
    /* fallback to safe default */
  }

  return false;
}

function markDocumentNative() {
  if (typeof document !== "undefined") {
    if (!document.documentElement.classList.contains("wta-native-app")) {
      document.documentElement.classList.add("wta-native-app");
    }
    if (document.body && !document.body.classList.contains("wta-native-app")) {
      document.body.classList.add("wta-native-app");
    }
  }
}

function persistAndMarkNative() {
  markDocumentNative();
  try {
    sessionStorage.setItem("wta-native-app", "1");
    localStorage.setItem("wta-native-app", "1");
  } catch {
    /* ignore */
  }
}
