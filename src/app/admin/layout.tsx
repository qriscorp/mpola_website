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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
