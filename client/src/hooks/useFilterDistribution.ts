import { useState, useEffect, useCallback } from 'react';
import { filtersApi, FilterDistributionResponse, AttributeDistribution } from '@/lib/api';

interface UseFilterDistributionResult {
  distribution: FilterDistributionResponse | null;
  isLoading: boolean;
  error: string | null;
  getDistribution: (field: string) => AttributeDistribution | null;
  refetch: () => Promise<void>;
}

// Module-level cache to share distribution data across all hook instances
let cachedDistribution: FilterDistributionResponse | null = null;
let cachePromise: Promise<FilterDistributionResponse> | null = null;

export function useFilterDistribution(): UseFilterDistributionResult {
  const [distribution, setDistribution] = useState<FilterDistributionResponse | null>(cachedDistribution);
  const [isLoading, setIsLoading] = useState(!cachedDistribution);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    // If we already have cached data, use it
    if (cachedDistribution) {
      setDistribution(cachedDistribution);
      setIsLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (cachePromise) {
      try {
        const data = await cachePromise;
        setDistribution(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load distribution data');
        setIsLoading(false);
      }
      return;
    }

    // Start a new fetch
    setIsLoading(true);
    setError(null);

    cachePromise = filtersApi.getFilterDistribution();

    try {
      const data = await cachePromise;
      cachedDistribution = data;
      setDistribution(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load distribution data');
    } finally {
      setIsLoading(false);
      cachePromise = null;
    }
  }, []);

  // Force refetch (bypasses cache)
  const refetch = useCallback(async () => {
    cachedDistribution = null;
    cachePromise = null;
    await fetchDistribution();
  }, [fetchDistribution]);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  // Helper to get distribution for a specific field
  const getDistribution = useCallback((field: string): AttributeDistribution | null => {
    if (!distribution) return null;
    const fieldData = distribution[field];
    if (!fieldData || typeof fieldData === 'string') return null;
    return fieldData as AttributeDistribution;
  }, [distribution]);

  return {
    distribution,
    isLoading,
    error,
    getDistribution,
    refetch,
  };
}
