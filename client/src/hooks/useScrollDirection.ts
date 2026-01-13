import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
  mobileOnly?: boolean; // Only track on mobile (< 1024px)
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 10, mobileOnly = true } = options;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY;

      // Check if we're on mobile (if mobileOnly is true)
      if (mobileOnly && window.innerWidth >= 1024) {
        setIsVisible(true);
        setScrollDirection(null);
        lastScrollY = scrollY;
        ticking = false;
        return;
      }

      // Only update if we've scrolled past the threshold
      if (Math.abs(diff) < threshold) {
        ticking = false;
        return;
      }

      const direction = diff > 0 ? 'down' : 'up';
      setScrollDirection(direction);
      setIsVisible(direction === 'up' || scrollY < 100); // Show when scrolling up or near top

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, mobileOnly]);

  return { scrollDirection, isVisible };
}
