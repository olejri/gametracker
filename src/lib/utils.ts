import dayjs from "dayjs";

/**
 * Utility function to merge class names
 * @param classes - Array of class names or conditional class names
 * @returns Merged class names string
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format date using dayjs format DD.MM.YYYY
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | undefined): string {
  if (date === undefined) {
    return "";
  }
  return dayjs(date).format("DD.MM.YYYY");
}

/**
 * Transform date string from format DD.MM.YYYY to YYYY-MM-DD
 * @param date - Date string in DD.MM.YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export function transformDate(date: string): string {
  const dateArray = date.split(".");
  return `${dateArray[2] ?? ""}-${dateArray[1] ?? ""}-${dateArray[0] ?? ""}`;
}
