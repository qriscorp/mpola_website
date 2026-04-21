import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In – Welend Borrower Portal",
  description:
    "Sign in to your Welend borrower account to manage loans, track repayments, and review offers.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
