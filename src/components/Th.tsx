import React from "react";
import { classNames } from "npm/lib/utils";

type ThProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const Th: React.FC<ThProps> = ({ className = "", children, ...rest }) => (
  <th
    {...rest}
    className={classNames(
      "sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter dark:border-gray-700 dark:bg-gray-900 dark:bg-opacity-75 dark:text-white",
      className
    )}
  >
    {children}
  </th>
);
