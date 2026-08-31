"use client";

import { useEffect } from "react";
import { supabase, recoverSession } from "@/lib/supabase";
import { clearOwnershipCache } from "@/lib/ownership";

/**
 * Keeps auth session alive across tab close / return.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
      if (document.visibilityState === "visible") void recoverSession();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", () => void recoverSession());

    // Periodic refresh while tab is open (helps long sessions)
    const interval = window.setInterval(() => {
      void recoverSession();
    }, 4 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}
