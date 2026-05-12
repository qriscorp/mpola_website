import Image from "next/image";
import Link from "next/link";

export function Logo({
  variant = "full",
  asLink = true,
}: {
  variant?: "full" | "icon" | "wordmark";
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

  const content = (
    <Image src={src} alt="Mpola" width={width} height={height} priority />
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
