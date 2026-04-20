import type { Metadata } from "next";
import { LenderSidebar } from "@/components/lender-sidebar";
import { LenderTopNav } from "@/components/lender-top-nav";

export const metadata: Metadata = {
  title: "Lender Portal – LendFlow",
  description:
    "Manage your lending portfolio, browse borrowers, and track returns on LendFlow.",
};

export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <LenderTopNav />
      <div className="flex flex-1 min-h-0">
        <LenderSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
