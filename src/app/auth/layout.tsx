import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In – LendFlow Borrower Portal",
  description:
    "Sign in to your LendFlow borrower account to manage loans, track repayments, and review offers.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
