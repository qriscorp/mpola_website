import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Dashboard – Welend Borrower Portal",
  description:
    "Manage your loans, track repayments, and review offers on Welend.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
