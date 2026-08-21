import Image from "next/image";
import Link from "next/link";

export function Logo({
  variant = "full",
  asLink = true,
}: {
  variant?: "full" | "icon" | "wordmark" | "light" | "dark";
  asLink?: boolean;
}) {
  // "light" = a compact horizontal lockup for a header/nav bar, always
  // white regardless of site theme (the fixed navy header every marketing
  // page uses). mpola_logo-2.png (the "full" asset) is a VERTICALLY
  // stacked lockup — icon above wordmark — sized for a hero/splash context;
  // forcing it into a ~40px-tall nav row at "full" width just scales the
  // whole tall image up, which is the overflow bug this replaces: icon and
  // wordmark composed side-by-side from their own standalone assets instead.
  if (variant === "light") {
    const content = (
      <div className="flex items-center gap-2">
        <Image
          src="/mpola_logo-3.png"
          alt=""
          width={32}
          height={32}
          priority
          className="h-8 w-8 brightness-0 invert"
        />
        <Image
          src="/mpola_logo-4.png"
          alt="Mpola"
          width={90}
          height={22}
          priority
          className="h-5 w-auto brightness-0 invert"
        />
      </div>
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
