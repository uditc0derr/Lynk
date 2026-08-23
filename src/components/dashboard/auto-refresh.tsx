"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let pending = false;
    const refresh = () => {
      if (document.visibilityState !== "visible" || pending) return;
      pending = true;
      router.refresh();
      setTimeout(() => {
        pending = false;
      }, 2000);
    };
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    const id = setInterval(refresh, intervalMs);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}
