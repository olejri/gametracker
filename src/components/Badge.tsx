import React from "react";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

const Badge: React.FC<BadgeProps> = ({ children, className = "", title }) => {
  return (
    <span
      title={title}
      className={[
        "inline-flex items-center justify-center rounded-full 0 px-2 text-xs font-medium text-gray-700 ring-2 ring-white",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

export default Badge;