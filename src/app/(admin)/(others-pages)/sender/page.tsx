import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import SenderPage from "@/components/sender/SenderPage";


export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

export default function Sender() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sender" />
      <SenderPage />      
    </div>
  );
}
