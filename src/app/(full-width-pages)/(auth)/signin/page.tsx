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

export default async function SignInPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isValid = false;
  console.log("SignInPage - token:", token);

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      jwt.verify(token, secret);
      console.log("✅ Valid token detected, redirecting to /");
      redirect("/");
    } catch {
      console.warn("⚠ Invalid token, trying refresh flow");
    }
  } else {
    console.log("No token found, staying on SignIn page.");
  }

  return (
    <>
      <SignInForm />
      <TokenRefresher isValid={isValid} />
    </>
  );
}
