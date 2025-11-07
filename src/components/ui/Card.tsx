import React from "react";
import { classNames } from "npm/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={classNames(
        "overflow-hidden bg-white shadow sm:rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={classNames("px-4 py-5 sm:p-6", className)}>{children}</div>;
};
