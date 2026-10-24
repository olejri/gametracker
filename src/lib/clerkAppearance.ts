/**
 * Clerk theme settings, so the sign-in modal and the account menu
 * follow the app's light/dark mode instead of Clerk's default colors.
 */

const darkVariables = {
  colorBackground: "#1f2937", // gray-800
  colorText: "#ffffff",
  colorTextSecondary: "#d1d5db", // gray-300
  colorInputBackground: "#374151", // gray-700
  colorInputText: "#ffffff",
  colorNeutral: "#ffffff",
  colorDanger: "#f87171", // red-400
};

const lightVariables = {
  colorBackground: "#ffffff",
  colorText: "#111827", // gray-900
  colorTextSecondary: "#6b7280", // gray-500
  colorInputBackground: "#ffffff",
  colorInputText: "#111827",
  colorNeutral: "#111827",
  colorDanger: "#dc2626", // red-600
};

// Clerk draws icons and the footer very faintly on a dark background
const darkElements = {
  userButtonPopoverCard: "border border-gray-700",
  userButtonPopoverActionButtonIcon: "text-gray-300",
  userButtonPopoverFooter: "opacity-80",
};

export const getClerkAppearance = (isDarkMode: boolean, isLandingPage: boolean) => {
  const useDark = isDarkMode || isLandingPage;
  return {
    variables: {
      ...(useDark ? darkVariables : lightVariables),
      // The landing page uses green for its call to action, the app uses indigo
      colorPrimary: isLandingPage ? "#22c55e" : isDarkMode ? "#6366f1" : "#4f46e5",
    },
    elements: useDark ? darkElements : {},
  };
};
