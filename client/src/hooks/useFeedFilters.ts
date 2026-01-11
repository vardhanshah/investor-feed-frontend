import { useState, useCallback } from 'react';
import { FilterConfig, profilesApi } from '@/lib/api';
import { ProfileSelections } from '@/components/ProfileSelector';
import { useToast } from '@/hooks/use-toast';

export interface FilterValue {
  field: string;
  operator: string;
  value: any;
}

export interface NumberFilterState {
  from: string;
  to: string;
}

export interface FeedFilterState {
  feedName: string;
  feedDescription: string;
  filterValues: Record<string, any>;
  numberFilterStates: Record<string, NumberFilterState>;
  profileSelections: ProfileSelections;
}

export function useFeedFilters() {
  const { toast } = useToast();

  const [feedName, setFeedName] = useState('');
  const [feedDescription, setFeedDescription] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [numberFilterStates, setNumberFilterStates] = useState<Record<string, NumberFilterState>>({});
  const [profileSelections, setProfileSelections] = useState<ProfileSelections>({
    companies: [],
    sectors: [],
    subsectors: [],
  });

  // Initialize number filter states based on filter configs
  const initializeNumberFilters = useCallback((filterConfigs: FilterConfig[]) => {
    const initialStates: Record<string, NumberFilterState> = {};
    filterConfigs.forEach(config => {
      if (config.type === 'number') {
        initialStates[config.field] = {
          from: '',
          to: '',
        };
      }
    });
    setNumberFilterStates(initialStates);
  }, []);

  // Load existing feed data (for editing)
  const loadFeedData = useCallback(async (feedData: any, filterConfigs: FilterConfig[]) => {
    setFeedName(feedData.name);
    setFeedDescription(feedData.description || '');

    // Populate filter values
    const newFilterValues: Record<string, any> = {};
    const newNumberStates: Record<string, NumberFilterState> = {};

    // Initialize with defaults
    filterConfigs.forEach(config => {
      if (config.type === 'number') {
        newNumberStates[config.field] = {
          from: '',
          to: '',
        };
      }
    });

    // Load profile selections if present
    // If profile_ids exist, they take priority over sector/subsector filters
    const hasProfileIds = feedData.filter_criteria.profile_ids && feedData.filter_criteria.profile_ids.length > 0;

    if (hasProfileIds) {
      // Fetch profile details for each profile_id
      try {
        const profilePromises = feedData.filter_criteria.profile_ids.map((id: number) =>
          profilesApi.getProfile(id).catch(() => null)
        );
        const profiles = await Promise.all(profilePromises);
        const companies = profiles
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .map(p => ({ id: p.id, title: p.title }));

        // Set only companies, clear sectors/subsectors
        setProfileSelections({
          companies,
          sectors: [],
          subsectors: [],
        });
      } catch (error) {
        console.error('Error fetching profile details:', error);
      }
    }

    feedData.filter_criteria.filters.forEach((filter: FilterValue) => {
      const config = filterConfigs.find(c => c.field === filter.field);

      if (config?.type === 'boolean') {
        newFilterValues[filter.field] = filter.value;
      } else if (config?.type === 'number') {
        // Map gte to 'from' and lte to 'to'
        if (filter.operator === 'gte') {
          newNumberStates[filter.field] = {
            ...newNumberStates[filter.field],
            from: filter.value.toString(),
          };
        } else if (filter.operator === 'lte') {
          newNumberStates[filter.field] = {
            ...newNumberStates[filter.field],
            to: filter.value.toString(),
          };
        }
      } else if (config?.type === 'string' && !hasProfileIds) {
        // Handle sector/subsector filters only if profile_ids are not present
        if (filter.field === 'sector' && filter.operator === 'in') {
          setProfileSelections(prev => ({
            ...prev,
            sectors: filter.value.map((v: string) => ({ value: v })),
          }));
        } else if (filter.field === 'subsector' && filter.operator === 'in') {
          setProfileSelections(prev => ({
            ...prev,
            subsectors: filter.value.map((v: string) => ({ value: v })),
          }));
        }
      }
    });

    setFilterValues(newFilterValues);
    setNumberFilterStates(newNumberStates);
  }, []);

  // Reset all filters
  const resetFilters = useCallback((filterConfigs: FilterConfig[]) => {
    setFeedName('');
    setFeedDescription('');
    setFilterValues({});
    setProfileSelections({
      companies: [],
      sectors: [],
      subsectors: [],
    });
    initializeNumberFilters(filterConfigs);
  }, [initializeNumberFilters]);

  // Handle filter value change for boolean filters
  const handleFilterChange = useCallback((field: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle number filter from value change
  const handleNumberFilterFromChange = useCallback((field: string, value: string) => {
    setNumberFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        from: value,
      },
    }));
  }, []);

  // Handle number filter to value change
  const handleNumberFilterToChange = useCallback((field: string, value: string) => {
    setNumberFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        to: value,
      },
    }));
  }, []);

  // Validate and build filter criteria
  const buildFilterCriteria = useCallback((filterConfigs: FilterConfig[]) => {
    // Build filter criteria from selected values
    const filters: FilterValue[] = [];

    // Add sector/subsector filters from profile selections
    if (profileSelections.sectors.length > 0) {
      filters.push({
        field: 'sector',
        operator: 'in',
        value: profileSelections.sectors.map(s => s.value),
      });
    }

    if (profileSelections.subsectors.length > 0) {
      filters.push({
        field: 'subsector',
        operator: 'in',
        value: profileSelections.subsectors.map(s => s.value),
      });
    }

    // Add number filters (from/to logic)
    for (const [field, state] of Object.entries(numberFilterStates)) {
      const config = filterConfigs.find(c => c.field === field);
      const hasFrom = state.from && state.from.trim() !== '';
      const hasTo = state.to && state.to.trim() !== '';

      if (hasFrom) {
        const fromValue = parseFloat(state.from);
        // Validate range if provided
        if (config?.range && (fromValue < config.range.min || fromValue > config.range.max)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "From" value must be between ${config.range.min} and ${config.range.max}${config.unit ? ' ' + config.unit : ''}`,
          });
          return null;
        }
        filters.push({
          field,
          operator: 'gte',
          value: fromValue,
        });
      }

      if (hasTo) {
        const toValue = parseFloat(state.to);
        // Validate range if provided
        if (config?.range && (toValue < config.range.min || toValue > config.range.max)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "To" value must be between ${config.range.min} and ${config.range.max}${config.unit ? ' ' + config.unit : ''}`,
          });
          return null;
        }
        // Validate that "To" is greater than or equal to "From"
        if (hasFrom && toValue < parseFloat(state.from)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "To" value must be greater than or equal to "From" value`,
          });
          return null;
        }
        filters.push({
          field,
          operator: 'lte',
          value: toValue,
        });
      }
    }

    // Add boolean filters
    for (const [field, value] of Object.entries(filterValues)) {
      const config = filterConfigs.find(c => c.field === field);
      if (config?.type === 'boolean' && value === true) {
        filters.push({
          field,
          operator: 'eq',
          value: true,
        });
      }
    }

    // Check if at least one filter is selected (including profile selections)
    const hasProfileSelections = profileSelections.companies.length > 0 ||
                                 profileSelections.sectors.length > 0 ||
                                 profileSelections.subsectors.length > 0;

    if (filters.length === 0 && !hasProfileSelections) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select at least one filter or company/sector/subsector',
      });
      return null;
    }

    // Build filter criteria with both filters array and profile selections
    const filterCriteria: any = {
      filters,
      sort_by: 'submission_date',
      sort_order: 'desc',
    };

    // Add profile IDs for future backend support
    if (profileSelections.companies.length > 0) {
      filterCriteria.profile_ids = profileSelections.companies.map(c => c.id);
    }

    return filterCriteria;
  }, [filterValues, numberFilterStates, profileSelections, toast]);

  // Validate feed name
  const validateFeedName = useCallback(() => {
    if (!feedName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a feed name',
      });
      return false;
    }
    return true;
  }, [feedName, toast]);

  // Check if any filter is active (for preview mode)
  const hasActiveFilters = useCallback((filterConfigs: FilterConfig[]) => {
    // Check profile selections
    if (profileSelections.companies.length > 0 ||
        profileSelections.sectors.length > 0 ||
        profileSelections.subsectors.length > 0) {
      return true;
    }

    // Check number filters
    for (const [, state] of Object.entries(numberFilterStates)) {
      if ((state.from && state.from.trim() !== '') ||
          (state.to && state.to.trim() !== '')) {
        return true;
      }
    }

    // Check boolean filters
    for (const [field, value] of Object.entries(filterValues)) {
      const config = filterConfigs.find(c => c.field === field);
      if (config?.type === 'boolean' && value === true) {
        return true;
      }
    }

    return false;
  }, [filterValues, numberFilterStates, profileSelections]);

  // Build search criteria for filter preview (no feed name validation, no minimum filter requirement)
  const buildSearchCriteria = useCallback((filterConfigs: FilterConfig[]) => {
    const filters: FilterValue[] = [];

    // Add sector/subsector filters from profile selections
    if (profileSelections.sectors.length > 0) {
      filters.push({
        field: 'sector',
        operator: 'in',
        value: profileSelections.sectors.map(s => s.value),
      });
    }

    if (profileSelections.subsectors.length > 0) {
      filters.push({
        field: 'subsector',
        operator: 'in',
        value: profileSelections.subsectors.map(s => s.value),
      });
    }

    // Add number filters (from/to logic)
    for (const [field, state] of Object.entries(numberFilterStates)) {
      const config = filterConfigs.find(c => c.field === field);
      const hasFrom = state.from && state.from.trim() !== '';
      const hasTo = state.to && state.to.trim() !== '';

      if (hasFrom) {
        const fromValue = parseFloat(state.from);
        // Validate range if provided
        if (config?.range && (fromValue < config.range.min || fromValue > config.range.max)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "From" value must be between ${config.range.min} and ${config.range.max}${config.unit ? ' ' + config.unit : ''}`,
          });
          return null;
        }
        filters.push({
          field,
          operator: 'gte',
          value: fromValue,
        });
      }

      if (hasTo) {
        const toValue = parseFloat(state.to);
        // Validate range if provided
        if (config?.range && (toValue < config.range.min || toValue > config.range.max)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "To" value must be between ${config.range.min} and ${config.range.max}${config.unit ? ' ' + config.unit : ''}`,
          });
          return null;
        }
        // Validate that "To" is greater than or equal to "From"
        if (hasFrom && toValue < parseFloat(state.from)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "To" value must be greater than or equal to "From" value`,
          });
          return null;
        }
        filters.push({
          field,
          operator: 'lte',
          value: toValue,
        });
      }
    }

    // Add boolean filters
    for (const [field, value] of Object.entries(filterValues)) {
      const config = filterConfigs.find(c => c.field === field);
      if (config?.type === 'boolean' && value === true) {
        filters.push({
          field,
          operator: 'eq',
          value: true,
        });
      }
    }

    // Build filter criteria
    const filterCriteria: any = {
      filters,
    };

    // Add profile IDs if companies selected
    if (profileSelections.companies.length > 0) {
      filterCriteria.profile_ids = profileSelections.companies.map(c => c.id);
    }

    return filterCriteria;
  }, [filterValues, numberFilterStates, profileSelections, toast]);

  return {
    // State
    feedName,
    feedDescription,
    filterValues,
    numberFilterStates,
    profileSelections,

    // Setters
    setFeedName,
    setFeedDescription,
    setProfileSelections,

    // Methods
    initializeNumberFilters,
    loadFeedData,
    resetFilters,
    handleFilterChange,
    handleNumberFilterFromChange,
    handleNumberFilterToChange,
    buildFilterCriteria,
    validateFeedName,
    hasActiveFilters,
    buildSearchCriteria,
  };
}
