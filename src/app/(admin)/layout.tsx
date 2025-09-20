import { ReactNode } from "react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import ClientAdminLayout from "./ClientAdminLayout";
import TokenRefresher from "@/components/auth/TokenRefresher";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  console.log("[AdminLayout] token:", token);

  let isValid = false;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      jwt.verify(token, secret);
      isValid = true;
      console.log("[AdminLayout] Valid token detected");
    } catch (err) {
      console.log("[AdminLayout] Invalid/expired token:", err);
    }
  }

  if (!token) {
    return redirect("/signin");
  }

  return (
    <ClientAdminLayout>
      <TokenRefresher isValid={isValid} />
      {children}
    </ClientAdminLayout>
  );
}
