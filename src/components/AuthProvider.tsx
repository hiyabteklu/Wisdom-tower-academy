"use client";

import { useEffect } from "react";
import { supabase, recoverSession } from "@/lib/supabase";
import { clearOwnershipCache } from "@/lib/ownership";

/**
 * Keeps auth session alive across tab close / return:
 * - refreshes token on focus
 * - clears ownership cache on sign-in / sign-out
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Warm session from localStorage on first paint
    void recoverSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        clearOwnershipCache();
      }
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void recoverSession();
      }
    };
    const onFocus = () => {
      void recoverSession();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return <>{children}</>;
}
