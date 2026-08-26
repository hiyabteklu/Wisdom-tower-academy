"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    const run = async () => {
      const platformParam = searchParams.get("platform");
      let platform = platformParam;
      try {
        if (!platform) platform = sessionStorage.getItem("wt_signup_platform");
        sessionStorage.removeItem("wt_signup_platform");
      } catch {
        /* ignore */
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && (platform === "academy" || platform === "digital")) {
        const current = session.user.user_metadata?.platform;
        if (current !== platform) {
          await supabase.auth.updateUser({
            data: { platform },
          });
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const p = user?.user_metadata?.platform;

      if (p === "academy") router.replace("/academy");
      else if (p === "digital") router.replace("/digital");
      else router.replace("/");
    };

    run().catch(() => {
      setMsg("Something went wrong. Redirecting…");
      router.replace("/login");
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">{msg}</div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-wisdom-muted">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
