import Image from "next/image";
import Link from "next/link";

export function Logo({
  variant = "full",
  asLink = true,
}: {
  variant?: "full" | "icon" | "wordmark" | "light" | "dark";
  asLink?: boolean;
}) {
  // "light" = the real Mpola logo (mpola_logo-2.png), forced white, sized
  // for a compact header row. The file's true aspect ratio is 322:230 —
  // rendering it at a fixed height with width left to scale (not forcing
  // both dimensions to an unrelated ratio, which is what caused the
  // overflow/distortion before) is what actually keeps it proportional
  // and small in a ~64px-tall nav bar.
  if (variant === "light") {
    const content = (
      <Image
        src="/mpola_logo-2.png"
        alt="Mpola"
        width={322}
        height={230}
        priority
        className="h-10 w-auto brightness-0 invert"
      />
    );
    return asLink ? (
      <Link href="/" className="flex items-center">
        {content}
      </Link>
    ) : (
      content
    );
  }

  const src =
    variant === "icon"
      ? "/mpola_logo-3.png"
      : variant === "wordmark"
        ? "/mpola_logo-4.png"
        : "/mpola_logo-2.png";

  const width = variant === "icon" ? 40 : variant === "wordmark" ? 100 : 120;
  const height = variant === "icon" ? 40 : 40;

  const imgClass = "dark:brightness-0 dark:invert";

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
