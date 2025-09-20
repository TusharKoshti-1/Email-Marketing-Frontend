// app/(admin)/layout.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

import ClientAdminLayout from "./ClientAdminLayout"; // client wrapper

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/signin"); // No token → redirect
  }

  try {
    // Verify JWT using the same secret as your backend
    jwt.verify(token!, process.env.JWT_SECRET || "your_jwt_secret");
  } catch (err) {
    console.log("[AdminLayout] Invalid/expired token:", err);
    redirect("/signin"); // Invalid/expired token → redirect
  }

  // Token valid → render client layout
  return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
