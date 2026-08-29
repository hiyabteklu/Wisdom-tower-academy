"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureProfile, postAuthPath } from "@/lib/profile";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    const run = async () => {
      try {
        sessionStorage.removeItem("wt_signup_platform");
      } catch {
        /* ignore */
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setMsg("No session. Redirecting to login…");
        router.replace("/login");
        return;
      }

      await ensureProfile(session.user);
      const dest = postAuthPath(session.user, next);
      router.replace(dest);
    };

    run().catch(() => {
      setMsg("Something went wrong. Redirecting…");
      router.replace("/login");
    });
  }, [router, next]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">{msg}</div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">Loading…</div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
