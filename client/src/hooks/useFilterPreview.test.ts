import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFilterPreview } from './useFilterPreview';

// Mock the APIs
vi.mock('@/lib/api', () => ({
  filtersApi: {
    getFilterConfig: vi.fn().mockResolvedValue({
      filters: [
        { field: 'is_profitable', type: 'boolean', label: 'Profitable', group: 'company' },
        { field: 'mcap', type: 'number', label: 'Market Cap', group: 'company' },
      ],
      groups: [{ group_id: 'company', group_label: 'Company Filters', group_operator: 'and' }],
    }),
  },
  postsApi: {
    searchPosts: vi.fn().mockResolvedValue({
      posts: [{ id: 1, title: 'Test Post' }],
      total_post_count: 1,
      profiles_attributes_metadata: {},
      posts_attributes_metadata: {},
    }),
  },
  profilesApi: {
    getProfile: vi.fn(),
  },
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useFilterPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with isSearching as false', async () => {
    const { result } = renderHook(() => useFilterPreview());

    // Wait for filter config to load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.filteredPosts).toEqual([]);
  });

  it('should set isSearching to true immediately when filters are applied', async () => {
    const { result } = renderHook(() => useFilterPreview());

    // Wait for filter config to load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isSearching).toBe(false);

    // Apply a boolean filter
    act(() => {
      result.current.handleFilterChange('is_profitable', true);
    });

    // isSearching should be true IMMEDIATELY (before debounce completes)
    expect(result.current.isSearching).toBe(true);

    // Complete the debounce and API call
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // After search completes, isSearching should be false
    expect(result.current.isSearching).toBe(false);
  });

  it('should expose refresh method that re-executes search', async () => {
    const { postsApi } = await import('@/lib/api');

    const { result } = renderHook(() => useFilterPreview());

    // Wait for filter config to load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Apply a filter first
    act(() => {
      result.current.handleFilterChange('is_profitable', true);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Clear the mock call count
    vi.mocked(postsApi.searchPosts).mockClear();

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    // searchPosts should have been called again
    expect(postsApi.searchPosts).toHaveBeenCalled();
  });

  it('should expose getSearchCriteria method', async () => {
    const { result } = renderHook(() => useFilterPreview());

    // Wait for filter config to load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Apply a filter
    act(() => {
      result.current.handleFilterChange('is_profitable', true);
    });

    const criteria = result.current.getSearchCriteria();

    expect(criteria).not.toBeNull();
    expect(criteria?.filters).toContainEqual({
      field: 'is_profitable',
      operator: 'eq',
      value: true,
    });
  });

  it('should clear filters and reset state', async () => {
    const { result } = renderHook(() => useFilterPreview());

    // Wait for filter config to load
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Apply a filter
    act(() => {
      result.current.handleFilterChange('is_profitable', true);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.hasActiveFilters).toBe(true);

    // Clear filters
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredPosts).toEqual([]);
  });
});
