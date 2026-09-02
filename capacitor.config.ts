import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Wisdom Tower Academy — Android shell
 * Loads the live website inside a secure native WebView.
 * Screenshot protection is enabled in android/ native code (see docs/MOBILE-APP.md).
 */
const config: CapacitorConfig = {
  appId: "com.wisdomtower.academy",
  appName: "Wisdom Tower Academy",
  webDir: "out",
  server: {
    // Production site — app always shows the same content as the website
    url: "https://wisdom-tower-academy.live",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0b1220",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0b1220",
      showSpinner: false,
    },
  },
};

export default config;
