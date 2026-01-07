import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFeedFilters } from './useFeedFilters';
import { profilesApi } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
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

describe('useFeedFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadFeedData', () => {
    it('should load companies when profile_ids are present', async () => {
      const mockProfiles = [
        { id: 1, title: 'Company A' },
        { id: 2, title: 'Company B' },
      ];

      vi.mocked(profilesApi.getProfile)
        .mockResolvedValueOnce(mockProfiles[0] as any)
        .mockResolvedValueOnce(mockProfiles[1] as any);

      const { result } = renderHook(() => useFeedFilters());

      const feedData = {
        name: 'Test Feed',
        description: 'Test Description',
        filter_criteria: {
          profile_ids: [1, 2],
          filters: [],
        },
      };

      await act(async () => {
        await result.current.loadFeedData(feedData, []);
      });

      expect(result.current.feedName).toBe('Test Feed');
      expect(result.current.feedDescription).toBe('Test Description');
      expect(result.current.profileSelections.companies).toEqual([
        { id: 1, title: 'Company A' },
        { id: 2, title: 'Company B' },
      ]);
      expect(profilesApi.getProfile).toHaveBeenCalledTimes(2);
      expect(profilesApi.getProfile).toHaveBeenCalledWith(1);
      expect(profilesApi.getProfile).toHaveBeenCalledWith(2);
    });

    it('should prioritize profile_ids over sector/subsector filters', async () => {
      const mockProfiles = [{ id: 1, title: 'Company A' }];

      vi.mocked(profilesApi.getProfile).mockResolvedValueOnce(mockProfiles[0] as any);

      const { result } = renderHook(() => useFeedFilters());

      const feedData = {
        name: 'Test Feed',
        description: '',
        filter_criteria: {
          profile_ids: [1],
          filters: [
            { field: 'sector', operator: 'in', value: ['Finance'] },
            { field: 'subsector', operator: 'in', value: ['Banking'] },
          ],
        },
      };

      const filterConfigs = [
        { field: 'sector', type: 'string', label: 'Sector' },
        { field: 'subsector', type: 'string', label: 'Subsector' },
      ];

      await act(async () => {
        await result.current.loadFeedData(feedData, filterConfigs as any);
      });

      // Companies should be loaded
      expect(result.current.profileSelections.companies).toEqual([
        { id: 1, title: 'Company A' },
      ]);
      // Sectors and subsectors should be empty (profile_ids take priority)
      expect(result.current.profileSelections.sectors).toEqual([]);
      expect(result.current.profileSelections.subsectors).toEqual([]);
    });

    it('should load sectors/subsectors when profile_ids are not present', async () => {
      const { result } = renderHook(() => useFeedFilters());

      const feedData = {
        name: 'Sector Feed',
        description: '',
        filter_criteria: {
          filters: [
            { field: 'sector', operator: 'in', value: ['Finance', 'Technology'] },
            { field: 'subsector', operator: 'in', value: ['Banking'] },
          ],
        },
      };

      const filterConfigs = [
        { field: 'sector', type: 'string', label: 'Sector' },
        { field: 'subsector', type: 'string', label: 'Subsector' },
      ];

      await act(async () => {
        await result.current.loadFeedData(feedData, filterConfigs as any);
      });

      expect(result.current.profileSelections.companies).toEqual([]);
      expect(result.current.profileSelections.sectors).toEqual([
        { value: 'Finance' },
        { value: 'Technology' },
      ]);
      expect(result.current.profileSelections.subsectors).toEqual([
        { value: 'Banking' },
      ]);
      // Should not have called getProfile
      expect(profilesApi.getProfile).not.toHaveBeenCalled();
    });

    it('should handle failed profile fetches gracefully', async () => {
      vi.mocked(profilesApi.getProfile)
        .mockResolvedValueOnce({ id: 1, title: 'Company A' } as any)
        .mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useFeedFilters());

      const feedData = {
        name: 'Test Feed',
        description: '',
        filter_criteria: {
          profile_ids: [1, 999], // 999 will fail
          filters: [],
        },
      };

      await act(async () => {
        await result.current.loadFeedData(feedData, []);
      });

      // Should only have the successful profile
      expect(result.current.profileSelections.companies).toEqual([
        { id: 1, title: 'Company A' },
      ]);
    });

    it('should load number filters correctly', async () => {
      const { result } = renderHook(() => useFeedFilters());

      const feedData = {
        name: 'Number Filter Feed',
        description: '',
        filter_criteria: {
          filters: [
            { field: 'mcap', operator: 'gte', value: 1000 },
            { field: 'mcap', operator: 'lte', value: 5000 },
          ],
        },
      };

      const filterConfigs = [
        { field: 'mcap', type: 'number', label: 'Market Cap' },
      ];

      await act(async () => {
        await result.current.loadFeedData(feedData, filterConfigs as any);
      });

      expect(result.current.numberFilterStates.mcap).toEqual({
        from: '1000',
        to: '5000',
      });
    });

    it('should load boolean filters correctly', async () => {
      const { result } = renderHook(() => useFeedFilters());

      const feedData = {
        name: 'Boolean Filter Feed',
        description: '',
        filter_criteria: {
          filters: [
            { field: 'is_profitable', operator: 'eq', value: true },
          ],
        },
      };

      const filterConfigs = [
        { field: 'is_profitable', type: 'boolean', label: 'Profitable' },
      ];

      await act(async () => {
        await result.current.loadFeedData(feedData, filterConfigs as any);
      });

      expect(result.current.filterValues.is_profitable).toBe(true);
    });
  });

  describe('buildFilterCriteria', () => {
    it('should include profile_ids when companies are selected', async () => {
      const { result } = renderHook(() => useFeedFilters());

      // Set up profile selections
      act(() => {
        result.current.setProfileSelections({
          companies: [
            { id: 1, title: 'Company A' },
            { id: 2, title: 'Company B' },
          ],
          sectors: [],
          subsectors: [],
        });
      });

      const filterCriteria = result.current.buildFilterCriteria([]);

      expect(filterCriteria).not.toBeNull();
      expect(filterCriteria?.profile_ids).toEqual([1, 2]);
    });
  });
});
