import React from "react";
import Image from "next/image";
import { classNames } from "npm/lib/utils";

export type Avatar = {
  id: string;
  src: string;
  alt: string;
  position?: number; // optional position for ranked sizing
};

type AvatarStackProps = {
  avatars: Avatar[];
  rankedSizing?: boolean; // when true, avatars are sized based on their position value (1st=largest, 2nd=medium, 3rd=small)
  className?: string;
};

const sizeForPosition = (position: number) => {
  switch (position) {
    case 1:
      return { cls: "h-9 w-9 border-yellow-500", px: 36 };
    case 2:
      return { cls: "h-8 w-8 border-neutral-500", px: 32 };
    case 3:
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
      {avatars.map((a) => {
        const base = "inline-block rounded-full border-2";
        const { cls, px } = rankedSizing && a.position
          ? sizeForPosition(a.position)
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