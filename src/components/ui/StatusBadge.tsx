import React from "react";
import { classNames } from "npm/lib/utils";
import { BADGE_COLORS } from "npm/lib/constants";

type BadgeColor = keyof typeof BADGE_COLORS;

interface StatusBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  color = "gray",
  className = "",
}) => {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium",
        BADGE_COLORS[color],
        className
      )}
    >
      {children}
    </span>
  );
};
