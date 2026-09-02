# Wisdom Tower Academy — Android app (Capacitor)

This turns your **existing website** into a real Android app:

- Same content as https://wisdom-tower-academy.live
- Light & fast (native shell + your live site)
- **Screenshot / screen-record protection** (FLAG_SECURE)
- Ready later for offline downloads

You do **not** rebuild the whole product. The app is a secure window around the site.

---

## What you need on your computer (once)

1. **Node.js** (LTS) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
3. During Android Studio setup, install:
   - Android SDK
   - Android SDK Platform 34+
   - Android Emulator (optional)
4. A GitHub copy of this project on your PC

Phone for testing: enable **Developer options** → **USB debugging**.

---

## Phase 1 — Create the Android project (do this once)

Open a terminal in the project folder:

```bash
cd Wisdom-tower-academy

npm install

npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen @capacitor/status-bar @capacitor/app

npx cap add android

npx cap sync android
```

If `webDir "out"` warns that the folder is missing, create an empty one:

```bash
mkdir out
echo "<!DOCTYPE html><html><body></body></html>" > out/index.html
npx cap sync android
```

(The live site URL in `capacitor.config.ts` is what actually loads; `out` is only a placeholder Capacitor requires.)

---

## Phase 2 — Screenshot protection (security)

1. Open Android Studio:

```bash
npx cap open android
```

2. In the left file tree open:

`android/app/src/main/java/com/wisdomtower/academy/MainActivity.java`

(or `.kt` if Kotlin)

3. Make it look like this (Java example):

```java
package com.wisdomtower.academy;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Block screenshots and screen recording inside the app
    getWindow().setFlags(
      WindowManager.LayoutParams.FLAG_SECURE,
      WindowManager.LayoutParams.FLAG_SECURE
    );
    super.onCreate(savedInstanceState);
  }
}
```

4. Save.

This is the standard bank-level screen protection on Android.

---

## Phase 3 — Run on your phone

1. Plug in the phone (USB debugging on)
2. In Android Studio click the green **Run** button
3. Choose your device

The app opens your live Academy site inside a native shell with screenshot protection.

---

## Phase 4 — App icon & name

- **Name:** already `Wisdom Tower Academy` in `capacitor.config.ts`
- **Icon:** replace files under
  `android/app/src/main/res/mipmap-*/`
  (or use Android Studio → Image Asset)

Use your WISDOM TOWER logo (square 1024×1024 PNG is ideal as source).

---

## Phase 5 — Offline downloads (next build)

After the shell works, we add:

1. **Download for offline** on PDFs / notes (only if the user owns the package)
2. Files stored in **private app storage** (not public Downloads)
3. Open inside the app (so screenshot block still applies)
4. Optional encryption + wipe on logout

That is Phase 2 of the product — we do it after you can install the basic app.

---

## Daily workflow (after first setup)

When the **website** changes, the app already shows new content (it loads the live URL).

When you change **native** settings (icon, screenshot flag, plugins):

```bash
npx cap sync android
npx cap open android
```

Then Run again from Android Studio.

---

## Play Store (later)

1. Create a Google Play Console developer account
2. Build a signed **release** AAB in Android Studio
3. Upload to Internal testing track first
4. Privacy policy: https://wisdom-tower-academy.live/privacy

---

## Security summary (what this app already aims for)

| Feature | Status |
|--------|--------|
| Same content as website | Yes (live URL) |
| HTTPS only | Yes |
| Screenshot / record block | Yes (FLAG_SECURE) |
| Supabase keys only public anon key | Same as website |
| Offline downloads | Next phase |
| Play Integrity / root checks | Optional later |

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Blank screen | Phone needs internet; check site opens in Chrome |
| `cap` not found | Use `npx cap` |
| SDK errors | Open Android Studio → SDK Manager → install Platform 34 |
| Login / Google issues | Same as website; fix on web first |
| Screenshot still works | Confirm FLAG_SECURE is in MainActivity and you rebuilt the app |

---

## Who does what

- **You:** install Node + Android Studio, run the commands, click Run
- **Helper (me):** native code snippets, offline design, Play Store checklist, fixes when something fails

Start with **Phase 1** on your PC, then tell me what you see after `npx cap add android`.
