// src/app/(full-width-pages)/(auth)/signin/page.tsx
import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

export default async function SignInPage() {
  // Read cookies on server
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  console.log("Token on server-side SignInPage:", token);

  if (token) {
    const secret = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";
    jwt.verify(token, secret); // ❌ Do not wrap in try/catch for redirect
    console.log("✅ Valid token detected, redirecting to /");
    redirect("/"); // Server-side redirect, stops rendering
  } else {
    console.log("No token found, staying on SignIn page.");
  }

  return <SignInForm />;
}
