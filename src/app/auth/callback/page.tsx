"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/profile";

function CallbackInner() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    const finish = async (user: { id: string; email?: string } | null | undefined) => {
      if (user) {
        try {
          await ensureProfile(user as Parameters<typeof ensureProfile>[0]);
        } catch (e) {
          console.warn("[auth/callback] ensureProfile", e);
        }
      }
      if (!cancelled) {
        router.replace("/learning");
        router.refresh();
      }
    };

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const err = url.searchParams.get("error");
        const errDesc = url.searchParams.get("error_description");

        if (err) {
          console.error("[auth/callback]", err, errDesc);
          // Still check for existing session (user may already be logged in)
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            await finish(session.user);
            return;
          }
          if (!cancelled) {
            setMsg("Sign-in failed. Redirecting…");
            router.replace(`/login?error=${encodeURIComponent(errDesc || err)}`);
          }
          return;
        }

        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("[auth/callback] exchange", exchangeError.message);
            // Code may already be used; session might still exist
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              await finish(session.user);
              return;
            }
            if (!cancelled) {
              setMsg("Sign-in failed. Redirecting…");
              router.replace("/login?error=oauth");
            }
            return;
          }
          if (data.session?.user) {
            await finish(data.session.user);
            return;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await finish(session.user);
          return;
        }

        if (!cancelled) {
          setMsg("No session. Redirecting…");
          router.replace("/login");
        }
      } catch (e) {
        console.error("[auth/callback]", e);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await finish(session.user);
          return;
        }
        if (!cancelled) {
          setMsg("Something went wrong. Redirecting…");
          router.replace("/login");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
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
