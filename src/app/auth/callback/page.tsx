"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login?error=auth");
        return;
      }
      router.push("/");
      router.refresh();
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-wisdom-muted">Completing sign in...</p>
      </div>
    </div>
  );
}
