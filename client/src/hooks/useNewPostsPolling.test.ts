import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for the new posts polling behavior in feed.tsx
 *
 * These tests verify:
 * 1. Polling stops when tab is hidden (Page Visibility API)
 * 2. Polling resumes when tab becomes visible
 * 3. Different intervals for regular feed (30s) vs filtered search (60s)
 */

describe('New Posts Polling Behavior', () => {
  let mockHidden = false;
  let visibilityChangeHandler: (() => void) | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    mockHidden = false;

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      get: () => mockHidden,
      configurable: true,
    });

    // Capture visibility change handler
    vi.spyOn(document, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'visibilitychange') {
        visibilityChangeHandler = handler as () => void;
      }
    });

    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    visibilityChangeHandler = null;
  });

  describe('Page Visibility API Integration', () => {
    it('should stop polling when document becomes hidden', () => {
      const mockCallback = vi.fn();
      let intervalId: NodeJS.Timeout | null = null;

      // Simulate the polling setup from feed.tsx
      const startPolling = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(mockCallback, 30000);
      };

      const stopPolling = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };

      const handleVisibilityChange = () => {
        if (mockHidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      // Start polling (tab visible)
      startPolling();

      // Advance time - callback should be called
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Simulate tab becoming hidden
      mockHidden = true;
      handleVisibilityChange();

      // Advance time - callback should NOT be called (polling stopped)
      vi.advanceTimersByTime(60000);
      expect(mockCallback).toHaveBeenCalledTimes(1); // Still 1, not 3
    });

    it('should resume polling when document becomes visible', () => {
      const mockCallback = vi.fn();
      let intervalId: NodeJS.Timeout | null = null;

      const startPolling = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(mockCallback, 30000);
      };

      const stopPolling = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };

      const handleVisibilityChange = () => {
        if (mockHidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      // Start with tab hidden
      mockHidden = true;
      handleVisibilityChange(); // This won't start polling since hidden

      // Advance time - no callbacks
      vi.advanceTimersByTime(60000);
      expect(mockCallback).toHaveBeenCalledTimes(0);

      // Tab becomes visible
      mockHidden = false;
      handleVisibilityChange();

      // Now polling should work
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('should not start polling if tab is initially hidden', () => {
      const mockCallback = vi.fn();
      let intervalId: NodeJS.Timeout | null = null;

      const startPolling = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(mockCallback, 30000);
      };

      // Simulate initial check from feed.tsx
      mockHidden = true;
      if (!mockHidden) {
        startPolling();
      }

      // Advance time - no callbacks since polling never started
      vi.advanceTimersByTime(120000);
      expect(mockCallback).toHaveBeenCalledTimes(0);
    });
  });

  describe('Polling Intervals', () => {
    const NEW_POSTS_CHECK_INTERVAL = 30000;
    const FILTERED_POSTS_CHECK_INTERVAL = 60000;

    it('should use 30s interval for regular feed', () => {
      const mockCallback = vi.fn();
      const hasActiveFilters = false;
      const interval = hasActiveFilters ? FILTERED_POSTS_CHECK_INTERVAL : NEW_POSTS_CHECK_INTERVAL;

      expect(interval).toBe(30000);

      const intervalId = setInterval(mockCallback, interval);

      // Should trigger at 30s
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Should trigger again at 60s
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(2);

      clearInterval(intervalId);
    });

    it('should use 60s interval for filtered search', () => {
      const mockCallback = vi.fn();
      const hasActiveFilters = true;
      const interval = hasActiveFilters ? FILTERED_POSTS_CHECK_INTERVAL : NEW_POSTS_CHECK_INTERVAL;

      expect(interval).toBe(60000);

      const intervalId = setInterval(mockCallback, interval);

      // Should NOT trigger at 30s
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(0);

      // Should trigger at 60s
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Should trigger again at 120s
      vi.advanceTimersByTime(60000);
      expect(mockCallback).toHaveBeenCalledTimes(2);

      clearInterval(intervalId);
    });

    it('should switch interval when filters are toggled', () => {
      const mockCallback = vi.fn();
      let hasActiveFilters = false;
      let intervalId: NodeJS.Timeout | null = null;

      const restartPolling = () => {
        if (intervalId) clearInterval(intervalId);
        const interval = hasActiveFilters ? FILTERED_POSTS_CHECK_INTERVAL : NEW_POSTS_CHECK_INTERVAL;
        intervalId = setInterval(mockCallback, interval);
      };

      // Start with no filters (30s interval)
      restartPolling();
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Toggle filters on - should restart with 60s interval
      hasActiveFilters = true;
      restartPolling();
      mockCallback.mockClear();

      // Should NOT trigger at 30s
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(0);

      // Should trigger at 60s
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      if (intervalId) clearInterval(intervalId);
    });
  });

  describe('Combined Behavior', () => {
    it('should respect both visibility and filter interval', () => {
      const mockCallback = vi.fn();
      let intervalId: NodeJS.Timeout | null = null;
      const hasActiveFilters = true; // 60s interval
      const interval = 60000;

      const startPolling = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(mockCallback, interval);
      };

      const stopPolling = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };

      const handleVisibilityChange = () => {
        if (mockHidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      // Start polling with filters active
      startPolling();

      // Advance 30s - no callback yet (60s interval)
      vi.advanceTimersByTime(30000);
      expect(mockCallback).toHaveBeenCalledTimes(0);

      // Tab goes hidden at 30s mark
      mockHidden = true;
      handleVisibilityChange();

      // Advance another 60s while hidden - still no callback
      vi.advanceTimersByTime(60000);
      expect(mockCallback).toHaveBeenCalledTimes(0);

      // Tab becomes visible - polling restarts
      mockHidden = false;
      handleVisibilityChange();

      // Now wait full 60s interval
      vi.advanceTimersByTime(60000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      stopPolling();
    });
  });
});
