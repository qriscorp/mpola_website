import Link from "next/link";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-white" : "text-[#1B2B3A]";
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#2BB5A0] flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <span className={`font-semibold text-lg ${textColor}`}>LendFlow</span>
    </Link>
  );
}
