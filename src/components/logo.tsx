import Image from "next/image";
import Link from "next/link";

export function Logo({
  variant = "full",
  asLink = true,
}: {
  variant?: "full" | "icon" | "wordmark" | "light" | "dark";
  asLink?: boolean;
}) {
  const src =
    variant === "icon"
      ? "/mpola_logo-3.png"
      : variant === "wordmark"
        ? "/mpola_logo-4.png"
        : "/mpola_logo-2.png";

  const width = variant === "icon" ? 40 : variant === "wordmark" ? 100 : 120;
  const height = variant === "icon" ? 40 : 40;

  // "light" = logo sits on a background that's ALWAYS dark regardless of
  // site theme (e.g. the landing page's fixed navy hero) → force white.
  // Everything else sits on theme-responsive white/dark cards, so it needs
  // to invert only when the site itself is in dark mode, not unconditionally.
  const imgClass =
    variant === "light"
      ? "brightness-0 invert"
      : "dark:brightness-0 dark:invert";

  const content = (
    <Image
      src={src}
      alt="Mpola"
      width={width}
      height={height}
      priority
      className={imgClass}
    />
  );

  if (!asLink) {
    return <div className="flex items-center">{content}</div>;
  }

  return (
    <Link href="/" className="flex items-center">
      {content}
    </Link>
  );
}
