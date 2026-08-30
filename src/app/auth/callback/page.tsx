"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackInner() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    const run = async () => {
      await supabase.auth.getSession();
      router.replace("/learning");
    };

    run().catch(() => {
      setMsg("Something went wrong. Redirecting…");
      router.replace("/login");
    });
  }, [router]);

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
