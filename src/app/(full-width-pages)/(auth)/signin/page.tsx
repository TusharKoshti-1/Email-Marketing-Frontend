// src/app/(full-width-pages)/(auth)/signin/page.tsx
import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import TokenRefresher from "@/components/auth/TokenRefresher"; // ✅ safe: render inside JSX, not top-level

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default async function SignInPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let isValid = false;

  if (token) {
    const secret = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";
    try {
      jwt.verify(token, secret);
      console.log("✅ Valid token detected, redirecting to /");
      redirect("/");
    } catch (err) {
      console.warn("⚠ Invalid token, trying refresh flow");
    }
  } else {
    console.log("No token found, staying on SignIn page.");
  }

  return (
    <>
      {/* Server always renders SignInForm */}
      <SignInForm />

      {/* Client handles refresh logic if token is invalid */}
      <TokenRefresher isValid={isValid} />
    </>
  );
}
