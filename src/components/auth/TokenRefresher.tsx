"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TokenRefresher({ isValid }: { isValid: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (isValid) return; // token already fine

    const keepMe = localStorage.getItem("keepMeLoggedIn");

    if (!keepMe) {
      // ❌ no keepMe → go to signin
      router.replace("/signin");
      return;
    }

    // ✅ keepMe exists → try refresh
    const refresh = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          console.log("✅ Token refreshed");
          router.refresh();
        } else {
          console.warn("⚠ Failed to refresh token");
          router.replace("/signin");
        }
      } catch (err) {
        console.error("❌ Refresh token error", err);
        router.replace("/signin");
      }
    };

    refresh();

    const interval = setInterval(refresh, 1000 * 60 * 14);
    return () => clearInterval(interval);
  }, [isValid, router]);

  return null;
}
