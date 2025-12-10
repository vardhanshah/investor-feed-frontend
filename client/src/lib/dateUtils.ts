import { formatDistanceToNow, format, parseISO, differenceInSeconds } from 'date-fns';

/**
 * Converts a UTC timestamp string to the user's local timezone and returns a Date object.
 * JavaScript Date automatically handles the conversion to the user's browser timezone.
 *
 * @param utcTimestamp - UTC timestamp string (ISO 8601 format from backend)
 * @returns Date object in user's local timezone
 */
export function parseUTCToLocal(utcTimestamp: string): Date {
  try {
    // Ensure the timestamp has a Z suffix to indicate UTC
    // Backend sends timestamps without Z, so we need to append it
    const utcString = utcTimestamp.endsWith('Z') ? utcTimestamp : utcTimestamp + 'Z';
    // parseISO from date-fns handles ISO 8601 strings properly
    // The resulting Date object is automatically in the user's local timezone
    return parseISO(utcString);
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
 * Formats a UTC timestamp as relative time with two units (e.g., "2 hrs 30 mins ago")
 * Automatically converts to user's local timezone
 * If more than 15 days ago, shows the date and time instead (e.g., "Dec 10, 2024 at 5:30 PM")
 *
 * @param utcTimestamp - UTC timestamp string
 * @returns Formatted relative time string with two units, or date-time if older than 15 days
 */
export function formatTimeAgoTwoUnits(utcTimestamp: string): string {
  try {
    const localDate = parseUTCToLocal(utcTimestamp);
    const now = new Date();
    const totalSeconds = differenceInSeconds(now, localDate);

    if (totalSeconds < 0) {
      return 'just now';
    }

    const days = Math.floor(totalSeconds / 86400);

    // If more than 15 days, show date-time in local timezone
    if (days > 15) {
      return format(localDate, 'MMM d, yyyy \'at\' h:mm a');
    }

    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
      }
    } else if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
      if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
      }
    } else if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
      if (seconds > 0) {
        parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`);
      }
    } else {
      parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`);
    }

    return parts.join(' ') + ' ago';
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
