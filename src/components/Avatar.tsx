import React from "react";
import Image from "next/image";
import { classNames } from "npm/lib/utils";

export type Avatar = {
  id: string;
  src: string;
  alt: string;
};

type AvatarStackProps = {
  avatars: Avatar[];
  rankedSizing?: boolean; // when true, first 3 get larger sizes/border colors
  className?: string;
};

const sizeForIndex = (index: number) => {
  switch (index) {
    case 0:
      return { cls: "h-9 w-9 border-yellow-500", px: 36 };
    case 1:
      return { cls: "h-8 w-8 border-neutral-500", px: 32 };
    case 2:
      return { cls: "h-7 w-7 border-orange-700", px: 28 };
    default:
      return { cls: "h-6 w-6 border-white", px: 24 };
  }
};

const AvatarStack: React.FC<AvatarStackProps> = ({
  avatars,
  rankedSizing = true,
  className = "",
}) => {
  return (
    <div className={classNames("flex -space-x-1 overflow-hidden", className)}>
      {avatars.map((a, index) => {
        const base = "inline-block rounded-full border-2";
        const { cls, px } = rankedSizing
          ? sizeForIndex(index)
          : { cls: "h-8 w-8 border-white", px: 32 };

        return (
          <Image
            key={a.id}
            alt={a.alt}
            src={a.src}
            width={px}
            height={px}
            className={classNames(base, cls)}
          />
        );
      })}
    </div>
  );
};

export default AvatarStack;