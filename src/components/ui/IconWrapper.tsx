import React from "react";
import { classNames } from "npm/lib/utils";

interface IconWrapperProps {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  foreground: string;
  background: string;
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  foreground,
  background,
  className = "",
}) => {
  return (
    <span
      className={classNames(
        background,
        foreground,
        "inline-flex rounded-lg p-3 ring-4 ring-white",
        className
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
};
