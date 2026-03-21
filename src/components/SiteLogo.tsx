import Link from "next/link";
import Image from "next/image";

/** ~10cm × 4cm at 96dpi – used when no width/height passed */
const DEFAULT_LOGO_WIDTH = 378;
const DEFAULT_LOGO_HEIGHT = 152;

interface SiteLogoProps {
  /** Width in pixels. Omit to scale by height or use default. */
  width?: number;
  /** Height in pixels. Omit to use default 5cm×2cm size. */
  height?: number;
  href?: string;
  className?: string;
  priority?: boolean;
}

export default function SiteLogo({
  width,
  height,
  href = "/",
  className = "",
  priority = false,
}: SiteLogoProps) {
  const hasExplicitWidth = width != null;
  const hasExplicitHeight = height != null;

  const displayWidth = width ?? DEFAULT_LOGO_WIDTH;
  const displayHeight = height ?? DEFAULT_LOGO_HEIGHT;

  const style =
    !hasExplicitWidth && hasExplicitHeight
      ? { height: `${displayHeight}px`, width: "auto" as const }
      : hasExplicitWidth && !hasExplicitHeight
        ? { width: `${displayWidth}px`, height: "auto" as const }
        : { width: `${displayWidth}px`, height: `${displayHeight}px` };

  return (
    <Link href={href} className={`inline-flex items-center shrink-0 ${className}`} aria-label="InstantTeacher home">
      <Image
        src="/logo.png"
        alt="InstantTeacher"
        width={displayWidth}
        height={displayHeight}
        priority={priority}
        className="h-auto w-auto object-contain"
        style={style}
      />
    </Link>
  );
}
