import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Converts a UTC timestamp string to the user's local timezone and returns a Date object.
 * JavaScript Date automatically handles the conversion to the user's browser timezone.
 *
 * @param utcTimestamp - UTC timestamp string (ISO 8601 format from backend)
 * @returns Date object in user's local timezone
 */
export function parseUTCToLocal(utcTimestamp: string): Date {
  try {
    // parseISO from date-fns handles ISO 8601 strings properly
    // The resulting Date object is automatically in the user's local timezone
    return parseISO(utcTimestamp);
  } catch (error) {
    console.error('Failed to parse timestamp:', utcTimestamp, error);
    // Return current date as fallback
    return new Date();
  }
}

/**
 * Formats a UTC timestamp as relative time (e.g., "2 hours ago")
 * Automatically converts to user's local timezone
 *
 * @param utcTimestamp - UTC timestamp string
 * @param options - Optional formatting options
 * @returns Formatted relative time string
 */
export function formatTimeAgo(
  utcTimestamp: string,
  options?: { addSuffix?: boolean }
): string {
  try {
    const localDate = parseUTCToLocal(utcTimestamp);
    return formatDistanceToNow(localDate, { addSuffix: true, ...options });
  } catch (error) {
    console.error('Failed to format time ago:', utcTimestamp, error);
    return 'Unknown time';
  }
}

/**
 * Formats a UTC timestamp as a full date string
 * Automatically converts to user's local timezone
 *
 * @param utcTimestamp - UTC timestamp string
 * @param formatString - Format pattern (default: 'PPP' = 'April 29th, 2024')
 * @returns Formatted date string
 */
export function formatFullDate(
  utcTimestamp: string,
  formatString: string = 'PPP'
): string {
  try {
    const localDate = parseUTCToLocal(utcTimestamp);
    return format(localDate, formatString);
  } catch (error) {
    console.error('Failed to format full date:', utcTimestamp, error);
    return 'Unknown date';
  }
}

/**
 * Formats a UTC timestamp as a date and time string
 * Automatically converts to user's local timezone
 *
 * @param utcTimestamp - UTC timestamp string
 * @param formatString - Format pattern (default: 'PPp' = 'April 29th, 2024 at 5:30 PM')
 * @returns Formatted date-time string
 */
export function formatDateTime(
  utcTimestamp: string,
  formatString: string = 'PPp'
): string {
  try {
    const localDate = parseUTCToLocal(utcTimestamp);
    return format(localDate, formatString);
  } catch (error) {
    console.error('Failed to format date-time:', utcTimestamp, error);
    return 'Unknown date';
  }
}

/**
 * Gets the user's timezone offset string (e.g., "GMT-5" or "GMT+2")
 * Useful for displaying timezone information to users
 *
 * @returns Timezone offset string
 */
export function getUserTimezone(): string {
  const offset = -new Date().getTimezoneOffset() / 60;
  const sign = offset >= 0 ? '+' : '';
  return `GMT${sign}${offset}`;
}

/**
 * Gets the user's timezone name using Intl API (e.g., "America/New_York")
 * Falls back to offset if Intl is not available
 *
 * @returns Timezone name or offset string
 */
export function getUserTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return getUserTimezone();
  }
}

/**
 * Formats a date using the browser's locale date format
 * Automatically converts to user's local timezone
 *
 * @param utcTimestamp - UTC timestamp string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in user's locale
 */
export function formatLocalizedDate(
  utcTimestamp: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const localDate = parseUTCToLocal(utcTimestamp);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };
    return localDate.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error('Failed to format localized date:', utcTimestamp, error);
    return 'Unknown date';
  }
}
