import Link from "next/link";

export function Logo({
  variant = "dark",
  asLink = true,
}: {
  variant?: "dark" | "light";
  asLink?: boolean;
}) {
  const textColor = variant === "light" ? "text-white" : "text-[#1B2B3A]";
  const content = (
    <>
      <div className="w-8 h-8 rounded-lg bg-[#2BB5A0] flex items-center justify-center">
        <span className="text-white font-bold text-sm">L</span>
      </div>
      <span className={`font-semibold text-lg ${textColor}`}>LendFlow</span>
    </>
  );

  if (!asLink) {
    return <div className="flex items-center gap-2">{content}</div>;
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      {content}
    </Link>
  );
}
