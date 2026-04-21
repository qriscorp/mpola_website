import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopNav } from "@/components/admin-top-nav";

export const metadata: Metadata = {
  title: "Admin Dashboard – LendFlow",
  description:
    "LendFlow administrative dashboard for managing users, loans, and applications.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <AdminTopNav />
      <div className="flex flex-1 min-h-0">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
