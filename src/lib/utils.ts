/**
 * Shared utility helpers
 */

/**
 * Merges class names together, filtering out falsy values.
 * A lightweight alternative to clsx for projects that don't need the full package.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a Date object as a human-readable string (e.g. "May 17, 2026").
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Returns today's date formatted as YYYY-MM-DD for use in date input min/max.
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Truncates a string to the given length and appends an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}

/**
 * Capitalizes the first letter of each word in a string.
 */
export function titleCase(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
