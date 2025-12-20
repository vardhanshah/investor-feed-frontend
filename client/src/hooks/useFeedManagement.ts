import { useState, useEffect } from 'react';
import { filtersApi, feedConfigApi, FilterConfig, FilterGroup } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { useFeedFilters } from '@/hooks/useFeedFilters';

interface UseFeedManagementOptions {
  editingFeedId?: number | null;
  isActive?: boolean; // Whether the component is active (for conditional fetching)
  onSuccess?: (feedId: number, isEdit: boolean) => void;
  onError?: (error: any) => void;
}

/**
 * Shared hook for managing feed creation and editing
 * Handles filter configs, feed data loading, and save/update operations
 */
export function useFeedManagement(options: UseFeedManagementOptions = {}) {
  const { editingFeedId, isActive = true, onSuccess, onError } = options;
  const { toast } = useToast();

  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Use shared filter state hook
  const feedFilters = useFeedFilters();

  // Fetch filter configurations
  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const response = await filtersApi.getFilterConfig();
        setFilterConfigs(response.filters);
        setFilterGroups(response.groups || []);
        feedFilters.initializeNumberFilters(response.filters);

        // Load existing feed data if editing
        if (editingFeedId) {
          setIsLoadingFeed(true);
          try {
            const feedData = await feedConfigApi.getFeedConfiguration(editingFeedId);
            feedFilters.loadFeedData(feedData, response.filters);
          } catch (err) {
            const errorInfo = getErrorMessage(err);
            toast({
              variant: 'destructive',
              title: errorInfo.title,
              description: errorInfo.message,
            });
            if (onError) onError(err);
          } finally {
            setIsLoadingFeed(false);
          }
        }
      } catch (err) {
        const errorInfo = getErrorMessage(err);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
        if (onError) onError(err);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    if (isActive) {
      fetchFilters();
    }
  }, [isActive, editingFeedId, toast, onError]);

  // Reset filters when component becomes inactive (e.g., sidebar closes)
  useEffect(() => {
    if (!isActive && filterConfigs.length > 0) {
      feedFilters.resetFilters(filterConfigs);
    }
  }, [isActive, filterConfigs]);

  // Save or update feed
  const saveFeed = async () => {
    if (!feedFilters.validateFeedName()) {
      return { success: false };
    }

    const filterCriteria = feedFilters.buildFilterCriteria(filterConfigs);
    if (!filterCriteria) {
      return { success: false }; // Validation errors already shown
    }

    setIsSaving(true);
    try {
      const feedData = {
        name: feedFilters.feedName,
        description: feedFilters.feedDescription || undefined,
        filter_criteria: filterCriteria,
      };

      if (editingFeedId) {
        // Update existing feed
        await feedConfigApi.updateFeedConfiguration(editingFeedId, feedData);
        toast({
          title: 'Success',
          description: 'Feed configuration updated successfully',
        });

        if (onSuccess) onSuccess(editingFeedId, true);

        // Reload the updated feed data
        setIsLoadingFeed(true);
        try {
          const updatedFeed = await feedConfigApi.getFeedConfiguration(editingFeedId);
          feedFilters.loadFeedData(updatedFeed, filterConfigs);
        } catch (err) {
          const errorInfo = getErrorMessage(err);
          toast({
            variant: 'destructive',
            title: errorInfo.title,
            description: errorInfo.message,
          });
        } finally {
          setIsLoadingFeed(false);
        }

        return { success: true, feedId: editingFeedId, isEdit: true };
      } else {
        // Create new feed
        const newFeed = await feedConfigApi.createFeedConfiguration(feedData);
        toast({
          title: 'Success',
          description: 'Feed configuration created successfully',
        });

        if (onSuccess) onSuccess(newFeed.id, false);

        return { success: true, feedId: newFeed.id, isEdit: false };
      }
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
      if (onError) onError(err);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    // Filter configs
    filterConfigs,
    filterGroups,

    // Loading states
    isLoadingFilters,
    isLoadingFeed,
    isSaving,

    // Save function
    saveFeed,

    // All filter state and handlers from useFeedFilters
    ...feedFilters,
  };
}
