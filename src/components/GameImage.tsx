import Image from "next/image";
import { useState } from "react";
import { classNames } from "npm/lib/utils";

const isBggImage = (src: string) => src.includes("cf.geekdo-images.com");

const initials = (name: string) =>
  name.split(/[\s:]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/**
 * A game's picture in a rounded square. BGG box art fills the square edge to
 * edge; any other picture sits on a soft gray tile that its white background
 * blends into. Games without a picture (or whose picture fails) show their
 * initials. Size it with className, e.g. "h-12 w-12 text-sm".
 */
export const GameImage = ({ src, name, className, size = 200, priority }: {
  src: string | null | undefined;
  name: string;
  className: string;
  // Rendered width in px, used to pick the image size to download
  size?: number;
  priority?: boolean;
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={classNames("flex flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300", className)}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );
  }

  const bgg = isBggImage(src);
  return (
    <span
      className={classNames(
        "relative block flex-shrink-0 overflow-hidden rounded-lg after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:ring-gray-900/10 dark:after:ring-white/10",
        !bgg && "bg-gray-100 dark:bg-gray-200",
        className
      )}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority={priority}
        onError={() => setFailed(true)}
        className={classNames(
          "h-full w-full",
          bgg ? "object-cover" : "object-contain p-[8%] mix-blend-multiply"
        )}
      />
    </span>
  );
};
