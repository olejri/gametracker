/**
 * Theme constants for consistent styling across the application
 */

// Icon configurations for different actions/sections
export const ICON_COLORS = {
  sky: {
    foreground: "text-sky-700",
    background: "bg-sky-50",
  },
  purple: {
    foreground: "text-purple-700",
    background: "bg-purple-50",
  },
  teal: {
    foreground: "text-teal-700",
    background: "bg-teal-50",
  },
  red: {
    foreground: "text-red-700",
    background: "bg-red-50",
  },
  yellow: {
    foreground: "text-yellow-700",
    background: "bg-yellow-50",
  },
  indigo: {
    foreground: "text-indigo-700",
    background: "bg-indigo-50",
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
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-800",
} as const;

// Button variants
export const BUTTON_VARIANTS = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white",
  danger: "bg-red-800 hover:bg-red-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
} as const;
