import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import AddEmailPage from "@/components/add-email/AddEmailPage";
import { cookies } from "next/headers";


export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default async function Sender() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
  return (
    <div>
      <PageBreadcrumb pageTitle="Sender" />
      <AddEmailPage token={token} />      
    </div>
  );
}
