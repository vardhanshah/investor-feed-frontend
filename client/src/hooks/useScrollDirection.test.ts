import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollDirection } from './useScrollDirection';

describe('useScrollDirection', () => {
  let mockScrollY = 0;
  let mockInnerWidth = 500;

  beforeEach(() => {
    mockScrollY = 0;
    mockInnerWidth = 500; // Mobile width

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      get: () => mockScrollY,
      configurable: true,
    });
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      get: () => mockInnerWidth,
      configurable: true,
    });
    // Mock requestAnimationFrame to execute immediately
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const simulateScroll = (newScrollY: number) => {
    mockScrollY = newScrollY;
    window.dispatchEvent(new Event('scroll'));
  };

  it('should initialize with isVisible true', () => {
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current.isVisible).toBe(true);
    expect(result.current.scrollDirection).toBe(null);
  });

  it('should detect scroll down and hide on mobile', () => {
    const { result } = renderHook(() => useScrollDirection());

    act(() => {
      simulateScroll(150); // Scroll down past threshold
    });

    expect(result.current.scrollDirection).toBe('down');
    expect(result.current.isVisible).toBe(false);
  });

  it('should not change direction for small scrolls (below threshold)', () => {
    const { result } = renderHook(() => useScrollDirection({ threshold: 20 }));

    act(() => {
      simulateScroll(5); // Below threshold
    });

    // Should not have changed from initial state
    expect(result.current.scrollDirection).toBe(null);
    expect(result.current.isVisible).toBe(true);
  });

  it('should always show on desktop when mobileOnly is true (default)', () => {
    mockInnerWidth = 1200; // Desktop width

    const { result } = renderHook(() => useScrollDirection({ mobileOnly: true }));

    act(() => {
      simulateScroll(200);
    });

    // Should still be visible on desktop
    expect(result.current.isVisible).toBe(true);
  });

  it('should detect scroll on desktop when mobileOnly is false', () => {
    mockInnerWidth = 1200; // Desktop width

    const { result } = renderHook(() => useScrollDirection({ mobileOnly: false }));

    act(() => {
      simulateScroll(200);
    });

    // Should hide on desktop when mobileOnly is false
    expect(result.current.isVisible).toBe(false);
    expect(result.current.scrollDirection).toBe('down');
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollDirection());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

});
