import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import { Sidebar } from "@/components/sidebar";
import { RealtimeProvider } from "@/components/realtime-provider";
import { PageTransition } from "@/components/motion/page-transition";

export const metadata: Metadata = {
  title: "Dashboard – Mpola Borrower Portal",
  description:
    "Manage your loans, track repayments, and review offers on Mpola.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-gray-950">
      <RealtimeProvider />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
