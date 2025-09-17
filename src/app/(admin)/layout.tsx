// app/(admin)/layout.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

import ClientAdminLayout from "./ClientAdminLayout";
import TokenRefresher from "@/components/auth/TokenRefresher";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let isValid = false;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      isValid = true;
    } catch (err) {
      console.log("[AdminLayout] Invalid/expired token:", err);
    }
  }

  // If no token at all → straight to signin
  if (!token) {
    return redirect("/signin");
  }

  // Render layout either way, but pass validity flag
  return (
    <ClientAdminLayout>
      <TokenRefresher isValid={isValid} />
      {children}
    </ClientAdminLayout>
  );
}
