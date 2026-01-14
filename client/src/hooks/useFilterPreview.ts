import { useState, useEffect, useCallback, useRef } from 'react';
import { filtersApi, postsApi, FilterConfig, FilterGroup, Post, ProfilesAttributesMetadata, PostAttributesMetadata } from '@/lib/api';
import { useFeedFilters } from './useFeedFilters';
import { useToast } from './use-toast';
import { encodeFilterCriteria, decodeFilterCriteria } from '@/lib/utils';

const LIMIT = 20;
const DEBOUNCE_MS = 500;

export function useFilterPreview() {
  const { toast } = useToast();
  const feedFilters = useFeedFilters();

  // Filter config state
  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Search results state
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [profilesAttributesMetadata, setProfilesAttributesMetadata] = useState<ProfilesAttributesMetadata | undefined>();
  const [postsAttributesMetadata, setPostsAttributesMetadata] = useState<PostAttributesMetadata | undefined>();
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we have active filters
  const hasActiveFilters = filterConfigs.length > 0 && feedFilters.hasActiveFilters(filterConfigs);

  // Fetch filter configs on mount
  useEffect(() => {
    const loadFilterConfig = async () => {
      try {
        const config = await filtersApi.getFilterConfig();
        setFilterConfigs(config.filters);
        setFilterGroups(config.groups);
        feedFilters.initializeNumberFilters(config.filters);
      } catch (error) {
        console.error('Failed to load filter config:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load filter configuration',
        });
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadFilterConfig();
  }, []);

  // Execute search with current filters
  const executeSearch = useCallback(async (currentOffset: number = 0) => {
    const criteria = feedFilters.buildSearchCriteria(filterConfigs);
    if (!criteria) {
      return null; // Validation failed
    }

    // If no filters, return null to signal using default feed
    if (criteria.filters.length === 0 && !criteria.profile_ids?.length) {
      return null;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await postsApi.searchPosts(
        criteria,
        LIMIT,
        currentOffset,
        'submission_date',
        'desc'
      );

      if (currentOffset === 0) {
        setFilteredPosts(response.posts);
        setTotalCount(response.total_post_count);
      } else {
        setFilteredPosts(prev => [...prev, ...response.posts]);
      }

      setProfilesAttributesMetadata(response.profiles_attributes_metadata);
      setPostsAttributesMetadata(response.posts_attributes_metadata);
      setHasMore(response.posts.length >= LIMIT);
      setOffset(currentOffset + response.posts.length);

      return response;
    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchError(error.message || 'Search failed');
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: error.message || 'Failed to search posts',
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [feedFilters, filterConfigs, toast]);

  // Auto-search when filters change (debounced)
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if config not loaded yet
    if (isLoadingConfig || filterConfigs.length === 0) {
      return;
    }

    // Check if we have active filters
    const hasFilters = feedFilters.hasActiveFilters(filterConfigs);

    if (hasFilters) {
      // Set searching state immediately to show loading indicator
      setIsSearching(true);
      // Debounce the search
      debounceTimerRef.current = setTimeout(() => {
        setOffset(0);
        executeSearch(0);
      }, DEBOUNCE_MS);
    } else {
      // No filters - clear filtered posts
      setFilteredPosts([]);
      setTotalCount(undefined);
      setOffset(0);
      setHasMore(true);
      setSearchError(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    feedFilters.filterValues,
    feedFilters.numberFilterStates,
    feedFilters.profileSelections,
    filterConfigs,
    isLoadingConfig,
  ]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (isSearching || !hasMore || !hasActiveFilters) return;
    await executeSearch(offset);
  }, [executeSearch, offset, hasMore, isSearching, hasActiveFilters]);

  // Refresh filtered results (re-execute search from offset 0)
  const refresh = useCallback(async () => {
    if (!hasActiveFilters) return;
    setOffset(0);
    await executeSearch(0);
  }, [executeSearch, hasActiveFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    feedFilters.resetFilters(filterConfigs);
    setFilteredPosts([]);
    setTotalCount(undefined);
    setOffset(0);
    setHasMore(true);
    setSearchError(null);
  }, [feedFilters, filterConfigs]);

  // Get the current search criteria (for saving as feed)
  const getSearchCriteria = useCallback(() => {
    return feedFilters.buildSearchCriteria(filterConfigs);
  }, [feedFilters, filterConfigs]);

  // Apply a quick filter from clicking on a post element
  const applyQuickFilter = useCallback((field: string, value: any) => {
    if (field === 'sector') {
      // Add to sectors selection (avoid duplicates)
      feedFilters.setProfileSelections(prev => {
        const exists = prev.sectors.some(s => s.value === value);
        if (exists) return prev;
        return {
          ...prev,
          sectors: [...prev.sectors, { label: value, value: value }],
        };
      });
    } else if (field === 'subsector') {
      // Add to subsectors selection (avoid duplicates)
      feedFilters.setProfileSelections(prev => {
        const exists = prev.subsectors.some(s => s.value === value);
        if (exists) return prev;
        return {
          ...prev,
          subsectors: [...prev.subsectors, { label: value, value: value }],
        };
      });
    } else {
      // Boolean filter - set to true
      feedFilters.handleFilterChange(field, true);
    }
  }, [feedFilters]);

  // Apply filters from a URL-encoded search payload string
  const applyFromUrlCriteria = useCallback((encoded: string) => {
    if (!encoded || filterConfigs.length === 0) return false;
    const payload = decodeFilterCriteria(encoded) as any;
    if (!payload || !payload.filter_criteria) return false;
    feedFilters.applyFromCriteria(payload.filter_criteria, filterConfigs);
    return true;
  }, [feedFilters, filterConfigs]);

  // Get URL-encoded search payload string (full /posts/search body)
  const getUrlEncodedCriteria = useCallback(() => {
    const criteria = feedFilters.buildSearchCriteria(filterConfigs);
    if (!criteria || (criteria.filters.length === 0 && !criteria.profile_ids?.length)) {
      return null;
    }
    // Sort filters by field name for consistent encoding regardless of application order
    criteria.filters.sort((a: any, b: any) => a.field.localeCompare(b.field));
    // Sort profile_ids if present
    if (criteria.profile_ids) {
      criteria.profile_ids.sort((a: number, b: number) => a - b);
    }
    // Build full payload matching /posts/search request body
    const payload = {
      filter_criteria: criteria,
      limit: LIMIT,
      offset: 0,
      sort_by: 'submission_date',
      sort_order: 'desc',
    };
    return encodeFilterCriteria(payload);
  }, [feedFilters, filterConfigs]);

  return {
    // Filter config
    filterConfigs,
    filterGroups,
    isLoadingConfig,

    // Filter state (from useFeedFilters)
    filterValues: feedFilters.filterValues,
    numberFilterStates: feedFilters.numberFilterStates,
    profileSelections: feedFilters.profileSelections,
    setProfileSelections: feedFilters.setProfileSelections,
    handleFilterChange: feedFilters.handleFilterChange,
    handleNumberFilterFromChange: feedFilters.handleNumberFilterFromChange,
    handleNumberFilterToChange: feedFilters.handleNumberFilterToChange,

    // Active filters state
    hasActiveFilters,

    // Search results (use these when hasActiveFilters is true)
    filteredPosts,
    totalCount,
    profilesAttributesMetadata,
    postsAttributesMetadata,
    isSearching,
    searchError,
    hasMore,

    // Actions
    loadMore,
    refresh,
    clearFilters,
    getSearchCriteria,
    applyQuickFilter,
    applyFromUrlCriteria,
    getUrlEncodedCriteria,
  };
}
