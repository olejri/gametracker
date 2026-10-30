import Image from "next/image";
import { useState } from "react";
import { classNames } from "npm/lib/utils";

const isBggImage = (src: string) => src.includes("cf.geekdo-images.com");

const initials = (name: string) =>
  name.split(/[\s:]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/**
 * A game's picture in a rounded square. BGG box art is shown whole, over a
 * blurred copy of itself that fills the rest of the square; any other picture sits on a soft gray tile that its white background
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
      {bgg && (
        // A blurred copy of the art fills the square around covers that aren't square
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          priority={priority}
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-md dark:brightness-75"
        />
      )}
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority={priority}
        onError={() => setFailed(true)}
        className={classNames(
          "relative h-full w-full object-contain",
          !bgg && "p-[8%] mix-blend-multiply"
        )}
      />
    </span>
  );
};
