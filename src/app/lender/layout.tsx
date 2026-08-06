import type { Metadata } from "next";
import { LenderSidebar } from "@/components/lender-sidebar";
import { LenderTopNav } from "@/components/lender-top-nav";
import { RealtimeProvider } from "@/components/realtime-provider";

export const metadata: Metadata = {
  title: "Lender Portal – Mpola",
  description:
    "Manage your lending portfolio, review applications, and track returns on Mpola.",
};

export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-gray-950">
      <RealtimeProvider />
      {/* Desktop sidebar — full height, dark navy */}
      <LenderSidebar />
      {/* Right column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile-only top bar */}
        <LenderTopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
