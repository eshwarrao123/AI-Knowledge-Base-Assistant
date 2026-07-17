/**
 * Format an ISO date string to a human-readable format.
 * @example formatDate('2024-01-15T10:30:00Z') → 'Jan 15, 2024'
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * Capitalise the first letter of a string.
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Truncate a string to `maxLength` characters, appending '…' if needed.
 */
export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}…` : str;
