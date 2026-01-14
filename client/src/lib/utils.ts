import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from a name string
 * e.g., "John Doe" -> "JD", "Alice" -> "A"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const categoryColorPalette = [
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700',
  'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/30 dark:text-zinc-300 dark:border-zinc-700',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string): string {
  if (!category) {
    return 'bg-muted text-muted-foreground border-border';
  }
  const index = hashString(category) % categoryColorPalette.length;
  return categoryColorPalette[index];
}

/**
 * Navigate back in browser history, with a fallback route if no history exists.
 * Use this for back buttons to ensure proper navigation when users land directly on a page.
 */
export function goBack(fallbackPath: string = '/home'): void {
  // Check if there's meaningful history to go back to
  // history.length > 2 indicates navigation happened within the app
  // (fresh tab = 1, landing on page = 2, navigating = 3+)
  if (window.history.length > 2) {
    window.history.back();
  } else {
    // User landed directly on this page - use client-side navigation
    window.location.assign(fallbackPath);
  }
}

/**
 * Convert a string to a URL-friendly slug
 * e.g., "Smallcap Expansion" -> "smallcap-expansion"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single
}

export function getRelativeTime(dateString: string): string {
  // Backend sends UTC time without 'Z' suffix, so append it if missing
  const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
  const date = new Date(utcDateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Encode any JSON object to a URL-safe Base64 string
 * Handles Unicode characters safely using TextEncoder
 */
export function encodeFilterCriteria(criteria: object): string {
  const json = JSON.stringify(criteria);
  // Convert UTF-8 string to bytes
  const bytes = new TextEncoder().encode(json);
  // Convert bytes to binary string (avoiding spread operator for large arrays)
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Encode to Base64 and make URL-safe
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a URL-safe Base64 string back to a JSON object
 * Handles Unicode characters safely using TextDecoder
 */
export function decodeFilterCriteria(encoded: string): object | null {
  try {
    // Restore standard Base64 characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) base64 += '=';
    // Decode Base64 to binary string
    const binary = atob(base64);
    // Convert binary string to bytes
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    // Decode UTF-8 bytes to string and parse JSON
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
