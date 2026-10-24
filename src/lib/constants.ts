/**
 * Theme constants for consistent styling across the application
 */

// Icon configurations for different actions/sections
export const ICON_COLORS = {
  sky: {
    foreground: "text-sky-700 dark:text-sky-300",
    background: "bg-sky-50 dark:bg-sky-900/40",
  },
  purple: {
    foreground: "text-purple-700 dark:text-purple-300",
    background: "bg-purple-50 dark:bg-purple-900/40",
  },
  teal: {
    foreground: "text-teal-700 dark:text-teal-300",
    background: "bg-teal-50 dark:bg-teal-900/40",
  },
  red: {
    foreground: "text-red-700 dark:text-red-300",
    background: "bg-red-50 dark:bg-red-900/40",
  },
  yellow: {
    foreground: "text-yellow-700 dark:text-yellow-300",
    background: "bg-yellow-50 dark:bg-yellow-900/40",
  },
  indigo: {
    foreground: "text-indigo-700 dark:text-indigo-300",
    background: "bg-indigo-50 dark:bg-indigo-900/40",
  },
  blue: {
    foreground: "text-blue-700 dark:text-blue-300",
    background: "bg-blue-50 dark:bg-blue-900/40",
  },
} as const;

// Common border radius values
export const BORDER_RADIUS = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

// Common spacing values
export const SPACING = {
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
} as const;

// Badge/Status colors
export const BADGE_COLORS = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  danger: "bg-red-800 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
} as const;
