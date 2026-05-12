import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In – Mpola Borrower Portal",
  description:
    "Sign in to your Mpola borrower account to manage loans, track repayments, and review offers.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
