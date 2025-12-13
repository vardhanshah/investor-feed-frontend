import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, X } from 'lucide-react';
import { filtersApi, feedConfigApi, FilterConfig, FilterGroup } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';

interface FilterValue {
  field: string;
  operator: string;
  value: any;
}

interface NumberFilterState {
  from: string;
  to: string;
}

interface FeedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedCreated: (feedId?: number) => void;
  editingFeedId?: number | null;
}

export default function FeedSidebar({ isOpen, onClose, onFeedCreated, editingFeedId }: FeedSidebarProps) {
  const { toast } = useToast();

  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [numberFilterStates, setNumberFilterStates] = useState<Record<string, NumberFilterState>>({});
  const [feedName, setFeedName] = useState('');
  const [feedDescription, setFeedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  // Fetch filter configuration and load existing feed if editing
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await filtersApi.getFilterConfig();
        setFilterConfigs(response.filters);
        // Groups are already sorted by backend
        setFilterGroups(response.groups || []);

        // Initialize number filter states with from/to values
        const initialStates: Record<string, NumberFilterState> = {};
        response.filters.forEach(config => {
          if (config.type === 'number') {
            initialStates[config.field] = {
              from: '',
              to: '',
            };
          }
        });
        setNumberFilterStates(initialStates);

        // Load existing feed data if editing
        if (editingFeedId) {
          setIsLoadingFeed(true);
          try {
            const feedData = await feedConfigApi.getFeedConfiguration(editingFeedId);
            setFeedName(feedData.name);
            setFeedDescription(feedData.description || '');

            // Populate filter values from existing feed
            const newFilterValues: Record<string, any> = {};
            const newNumberStates: Record<string, NumberFilterState> = { ...initialStates };

            feedData.filter_criteria.filters.forEach(filter => {
              const config = response.filters.find(c => c.field === filter.field);
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
              }
            });

            setFilterValues(newFilterValues);
            setNumberFilterStates(newNumberStates);
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
        }
      } catch (err) {
        const errorInfo = getErrorMessage(err);
        toast({
          variant: 'destructive',
          title: errorInfo.title,
          description: errorInfo.message,
        });
      } finally {
        setIsLoadingFilters(false);
      }
    };

    if (isOpen) {
      fetchFilters();
    }
  }, [isOpen, editingFeedId, toast]);

  // Reset form when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setFeedName('');
      setFeedDescription('');
      setFilterValues({});
      // Reset number filter states
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
    }
  }, [isOpen, filterConfigs]);

  // Handle filter value change for boolean filters
  const handleFilterChange = (field: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle number filter from value change
  const handleNumberFilterFromChange = (field: string, value: string) => {
    setNumberFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        from: value,
      },
    }));
  };

  // Handle number filter to value change
  const handleNumberFilterToChange = (field: string, value: string) => {
    setNumberFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        to: value,
      },
    }));
  };

  // Handle save feed configuration (create or update)
  const handleSaveFeed = async () => {
    if (!feedName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a feed name',
      });
      return;
    }

    // Build filter criteria from selected values
    const filters: FilterValue[] = [];

    // Add number filters (from/to logic)
    Object.entries(numberFilterStates).forEach(([field, state]) => {
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
          return;
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
          return;
        }
        // Validate that "To" is greater than or equal to "From"
        if (hasFrom && toValue < parseFloat(state.from)) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: `${config?.label} "To" value must be greater than or equal to "From" value`,
          });
          return;
        }
        filters.push({
          field,
          operator: 'lte',
          value: toValue,
        });
      }
    });

    // Add boolean filters
    Object.entries(filterValues).forEach(([field, value]) => {
      const config = filterConfigs.find(c => c.field === field);
      if (config?.type === 'boolean' && value === true) {
        filters.push({
          field,
          operator: 'eq',
          value: true,
        });
      }
    });

    if (filters.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select at least one filter',
      });
      return;
    }

    setIsSaving(true);
    try {
      const feedData = {
        name: feedName,
        description: feedDescription || undefined,
        filter_criteria: {
          filters,
          sort_by: 'submission_date',
          sort_order: 'desc',
        },
      };

      if (editingFeedId) {
        // Update existing feed
        await feedConfigApi.updateFeedConfiguration(editingFeedId, feedData);
        toast({
          title: 'Success',
          description: 'Feed configuration updated successfully. Review your feed below.',
        });

        // Reload feed configurations to show updated feed
        onFeedCreated(editingFeedId);

        // Keep sidebar open - reload the updated feed data
        setIsLoadingFeed(true);
        try {
          const updatedFeed = await feedConfigApi.getFeedConfiguration(editingFeedId);
          setFeedName(updatedFeed.name);
          setFeedDescription(updatedFeed.description || '');

          // Populate filter values from updated feed
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

          updatedFeed.filter_criteria.filters.forEach(filter => {
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
            }
          });

          setFilterValues(newFilterValues);
          setNumberFilterStates(newNumberStates);
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
      } else {
        // Create new feed
        const newFeed = await feedConfigApi.createFeedConfiguration(feedData);
        toast({
          title: 'Success',
          description: 'Feed configuration created successfully',
        });

        onFeedCreated(newFeed.id);
        onClose();
      }
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Format number with thousand separators and proper formatting
  const formatNumber = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Format with commas for thousands
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Format number for display in input field (add commas)
  const formatNumberForInput = (value: string): string => {
    if (!value) return '';
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return value;

    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
      useGrouping: true,
    }).format(num);
  };

  // Parse formatted number back to raw value
  const parseFormattedNumber = (value: string): string => {
    // Remove all commas and spaces
    return value.replace(/[,\s]/g, '');
  };

  // Helper function to get human-readable filter description
  const getFilterDescription = (config: FilterConfig): string | null => {
    if (config.type === 'boolean') {
      return filterValues[config.field] === true ? config.label : null;
    } else if (config.type === 'number') {
      const state = numberFilterStates[config.field];
      if (!state) return null;

      const hasFrom = state.from && state.from.trim() !== '';
      const hasTo = state.to && state.to.trim() !== '';

      if (hasFrom && hasTo) {
        // Both values: show as range
        return `${config.label}: ${formatNumber(state.from)} - ${formatNumber(state.to)}${config.unit ? ' ' + config.unit : ''}`;
      } else if (hasFrom) {
        // Only from: show as ≥
        return `${config.label} ≥ ${formatNumber(state.from)}${config.unit ? ' ' + config.unit : ''}`;
      } else if (hasTo) {
        // Only to: show as ≤
        return `${config.label} ≤ ${formatNumber(state.to)}${config.unit ? ' ' + config.unit : ''}`;
      }
    }
    return null;
  };

  // Build query preview for a group with syntax highlighting
  const buildGroupQueryPreview = (group: FilterGroup): React.ReactNode | null => {
    const groupFilters = filterConfigs.filter(f => f.group === group.group_id);
    const activeDescriptions = groupFilters
      .map(config => getFilterDescription(config))
      .filter(desc => desc !== null);

    if (activeDescriptions.length === 0) return null;

    const operator = group.group_operator === 'and' ? 'AND' : 'OR';

    return (
      <>
        {activeDescriptions.map((desc, idx) => (
          <span key={idx}>
            {idx > 0 && (
              <span className="text-[hsl(280,100%,70%)] font-semibold mx-2">
                {operator}
              </span>
            )}
            <span>{desc}</span>
          </span>
        ))}
      </>
    );
  };

  // Build full query preview combining all groups with syntax highlighting
  const buildFullQueryPreview = (): React.ReactNode | null => {
    const groupPreviews = filterGroups
      .map(group => {
        const groupFilters = filterConfigs.filter(f => f.group === group.group_id);
        const activeDescriptions = groupFilters
          .map(config => getFilterDescription(config))
          .filter(desc => desc !== null);

        if (activeDescriptions.length === 0) return null;

        const operator = group.group_operator === 'and' ? 'AND' : 'OR';
        return {
          label: group.group_label,
          preview: activeDescriptions.join(` ${operator} `),
        };
      })
      .filter(p => p !== null);

    if (groupPreviews.length === 0) return null;
    if (groupPreviews.length === 1) {
      return <span>({groupPreviews[0].preview})</span>;
    }

    // Combine groups with AND (groups are always combined with AND)
    return (
      <div className="space-y-2">
        {groupPreviews.map((group, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div className="text-[hsl(280,100%,70%)] font-bold text-center my-1">
                AND
              </div>
            )}
            <div className="text-muted-foreground text-xs mb-1 opacity-70">
              {group.label}:
            </div>
            <div>({group.preview})</div>
          </div>
        ))}
      </div>
    );
  };

  // Render filter input based on type
  const renderFilterInput = (config: FilterConfig) => {
    if (config.type === 'number') {
      const state = numberFilterStates[config.field];
      if (!state) return null;

      return (
        <div key={config.field} className="space-y-3 pb-4 border-b border-border last:border-b-0">
          <div className="space-y-2">
            <Label htmlFor={config.field} className="text-foreground font-alata font-semibold">
              {config.label}
              {config.unit && <span className="text-muted-foreground font-normal ml-1">({config.unit})</span>}
            </Label>
            <p className="text-sm text-muted-foreground font-alata">{config.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* From Input */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-alata">
                From
                {config.range && (
                  <span className="ml-1 text-xs">
                    (min: {formatNumber(config.range.min.toString())})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id={`${config.field}-from`}
                  type="text"
                  inputMode="numeric"
                  placeholder={config.range ? formatNumber(config.range.min.toString()) : 'Min'}
                  value={state.from ? formatNumberForInput(state.from) : ''}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleNumberFilterFromChange(config.field, rawValue);
                  }}
                  className="bg-background border-border text-foreground font-mono text-lg tracking-wider pr-12 h-11"
                />
                {config.unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-alata">
                    {config.unit}
                  </span>
                )}
              </div>
            </div>

            {/* To Input */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-alata">
                To
                {config.range && (
                  <span className="ml-1 text-xs">
                    (max: {formatNumber(config.range.max.toString())})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id={`${config.field}-to`}
                  type="text"
                  inputMode="numeric"
                  placeholder={config.range ? formatNumber(config.range.max.toString()) : 'Max'}
                  value={state.to ? formatNumberForInput(state.to) : ''}
                  onChange={(e) => {
                    const rawValue = parseFormattedNumber(e.target.value);
                    handleNumberFilterToChange(config.field, rawValue);
                  }}
                  className="bg-background border-border text-foreground font-mono text-lg tracking-wider pr-12 h-11"
                />
                {config.unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-alata">
                    {config.unit}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (config.type === 'boolean') {
      return (
        <div key={config.field} className="flex items-start space-x-3 py-3 border-b border-border last:border-b-0">
          <Checkbox
            id={config.field}
            checked={filterValues[config.field] || false}
            onCheckedChange={(checked) => handleFilterChange(config.field, checked)}
            className="mt-1"
          />
          <div className="space-y-1 flex-1">
            <Label
              htmlFor={config.field}
              className="text-foreground font-alata font-semibold cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {config.label}
            </Label>
            <p className="text-sm text-muted-foreground font-alata">{config.description}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="h-full md:h-[calc(100vh-5rem)] bg-background border-0 md:border md:border-border md:rounded-lg flex flex-col md:sticky md:top-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-alata font-bold text-foreground">
          {editingFeedId ? 'Edit Feed' : 'Create Custom Feed'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoadingFilters || isLoadingFeed ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Configuration - Grouped */}
            {filterGroups.length > 0 ? (
              // Render grouped filters (already sorted by backend)
              filterGroups.map((group) => {
                const groupFilters = filterConfigs.filter(f => f.group === group.group_id);
                if (groupFilters.length === 0) return null;

                return (
                  <Card key={group.group_id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground font-alata">{group.group_label}</CardTitle>
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground font-alata text-xs"
                        >
                          {group.group_operator.toUpperCase()} Logic
                        </Badge>
                      </div>
                      <CardDescription className="text-muted-foreground font-alata">
                        {group.group_description || `Select ${group.group_label.toLowerCase()} for your feed`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {groupFilters.map((config) => renderFilterInput(config))}

                      {/* Query Preview */}
                      {buildGroupQueryPreview(group) && (
                        <div className="mt-6 pt-4 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground font-alata mb-2">
                            Query Preview:
                          </div>
                          <div className="bg-muted/50 rounded-md p-3 font-mono text-xs text-foreground leading-relaxed">
                            {buildGroupQueryPreview(group)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Fallback: render without grouping
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground font-alata">Filter Criteria</CardTitle>
                  <CardDescription className="text-muted-foreground font-alata">
                    Select the filters you want to apply to your feed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filterConfigs.length === 0 ? (
                    <p className="text-muted-foreground font-alata text-center py-8">
                      No filters available
                    </p>
                  ) : (
                    filterConfigs.map((config) => renderFilterInput(config))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Feed Details - Name & Description */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground font-alata">Feed Details</CardTitle>
                <CardDescription className="text-muted-foreground font-alata">
                  Give your custom feed a name and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedName" className="text-foreground font-alata">
                    Feed Name *
                  </Label>
                  <Input
                    id="feedName"
                    type="text"
                    placeholder="e.g., Growth Stocks Feed"
                    value={feedName}
                    onChange={(e) => setFeedName(e.target.value)}
                    className="bg-background border-border text-foreground font-alata"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedDescription" className="text-foreground font-alata">
                    Description (Optional)
                  </Label>
                  <Input
                    id="feedDescription"
                    type="text"
                    placeholder="e.g., Posts related to high-growth companies"
                    value={feedDescription}
                    onChange={(e) => setFeedDescription(e.target.value)}
                    className="bg-background border-border text-foreground font-alata"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Combined Query Preview - Shows how all groups combine */}
            {buildFullQueryPreview() && filterGroups.length > 1 && (
              <Card className="bg-card border-border border-[hsl(280,100%,70%)]/30">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-foreground font-alata text-base">
                      Combined Feed Query
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-[hsl(280,100%,70%)]/10 to-[hsl(200,100%,70%)]/10 border-[hsl(280,100%,70%)]/30 text-foreground font-alata text-xs"
                    >
                      Your Filter Logic
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground font-alata text-xs">
                    Posts matching this combined query will appear in your feed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-md p-4 font-mono text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {buildFullQueryPreview()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted font-alata"
          >
            Close
          </Button>
          <Button
            onClick={handleSaveFeed}
            disabled={isSaving}
            className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingFeedId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {editingFeedId ? 'Update Feed' : 'Create Feed'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
