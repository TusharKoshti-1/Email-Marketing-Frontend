"use client";
import { useEffect } from "react";

export default function TokenRefresher() {
  useEffect(() => {
    const keepMe = localStorage.getItem("keepMeLoggedIn");
    if (!keepMe) return;

    const refresh = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/refresh", {
          method: "POST",
          credentials: "include", // ✅ Send cookies
        });

        if (res.ok) {
        } else {
          console.warn("⚠ Failed to refresh token");
        }
      } catch (err) {
        console.error("❌ Refresh token error", err);
      }
    };

    // Refresh immediately on mount (optional)
    refresh();

    // Then refresh every 14 minutes (before 15m expiry)
    const interval = setInterval(refresh, 1000 * 60 * 14);

    return () => clearInterval(interval);
  }, []);

  return null; // no UI
}
