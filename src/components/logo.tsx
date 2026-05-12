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

  // "light" = logo sits on a dark background → render white via CSS filter
  const imgClass = variant === "light" ? "brightness-0 invert" : undefined;

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
