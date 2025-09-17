// src/app/(full-width-pages)/(auth)/signin/page.tsx
"use client";

import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import TokenRefresher from "@/components/auth/TokenRefresher";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

// ⬅️ Note: default export must remain async since we read cookies server-side
export default async function SignInPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const secret = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";

  let isValid = false;

  if (token) {
    try {
      jwt.verify(token, secret);
      console.log("✅ Valid token detected, redirecting to /");
      redirect("/"); // stops here if valid
    } catch {
      console.log("❌ Invalid token, will attempt refresh with TokenRefresher");
    }
  } else {
    console.log("No token found, staying on SignIn page.");
  }

  return (
    <>
      <SignInForm />
      {/* If token invalid or missing → try refresher */}
      <TokenRefresher isValid={isValid} />
    </>
  );
}
