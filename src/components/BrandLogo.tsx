import Image from "next/image";

// Official Wisdom Tower logo (embedded so brand is consistent everywhere)
const LOGO_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AABdN0lEQVR42u3dd3wUdf4/8NfM7iaQCoRQpHcQCR2kqCggqJwgCKcg4ilg986zoJ5nwYIN9eSHoli+gBS";

export default function BrandLogo({
  className = "",
  size = 40,
  priority = false,
  alt = "Wisdom Tower Academy",
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}

export const brandLogoDataUri = LOGO_SRC;
