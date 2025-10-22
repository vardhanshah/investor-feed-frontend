import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Save, Filter as FilterIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { filtersApi, feedConfigApi, FilterConfig } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';

interface FilterValue {
  field: string;
  operator: string;
  value: any;
}

interface NumberFilterState {
  value: string;
  operator: string;
}

export default function Filters() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [numberFilterStates, setNumberFilterStates] = useState<Record<string, NumberFilterState>>({});
  const [feedName, setFeedName] = useState('');
  const [feedDescription, setFeedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation('/login');
    }
  }, [authLoading, user, setLocation]);

  // Fetch filter configuration
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await filtersApi.getFilterConfig();
        setFilterConfigs(response.filters);

        // Initialize number filter states with default operators
        const initialStates: Record<string, NumberFilterState> = {};
        response.filters.forEach(config => {
          if (config.type === 'number' && config.operators && config.operators.length > 0) {
            initialStates[config.field] = {
              value: '',
              operator: config.operators[0], // Use first operator as default
            };
          }
        });
        setNumberFilterStates(initialStates);
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

    if (user) {
      fetchFilters();
    }
  }, [user, toast]);

  // Handle filter value change for boolean filters
  const handleFilterChange = (field: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle number filter value change
  const handleNumberFilterValueChange = (field: string, value: string) => {
    setNumberFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
      },
    }));
  };

  // Handle number filter operator change
  const handleNumberFilterOperatorChange = (field: string, operator: string) => {
    setNumberFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        operator,
      },
    }));
  };

  // Get operator label
  const getOperatorLabel = (operator: string): string => {
    const labels: Record<string, string> = {
      'gte': '≥ (Greater than or equal)',
      'lte': '≤ (Less than or equal)',
      'gt': '> (Greater than)',
      'lt': '< (Less than)',
      'eq': '= (Equal to)',
    };
    return labels[operator] || operator;
  };

  // Handle save feed configuration
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

    // Add number filters
    Object.entries(numberFilterStates).forEach(([field, state]) => {
      if (state.value && state.value.trim() !== '') {
        const config = filterConfigs.find(c => c.field === field);
        const numValue = parseFloat(state.value);

        // Validate range if provided
        if (config?.range) {
          if (numValue < config.range.min || numValue > config.range.max) {
            toast({
              variant: 'destructive',
              title: 'Validation Error',
              description: `${config.label} must be between ${config.range.min} and ${config.range.max}${config.unit ? ' ' + config.unit : ''}`,
            });
            return;
          }
        }

        filters.push({
          field,
          operator: state.operator,
          value: numValue,
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
      await feedConfigApi.createFeedConfiguration({
        name: feedName,
        description: feedDescription || undefined,
        filter_criteria: {
          filters,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });

      toast({
        title: 'Success',
        description: 'Feed configuration created successfully',
      });

      // Navigate to home feed
      setLocation('/home');
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Operator Selection */}
            {config.operators && config.operators.length > 1 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground font-alata">Operator</Label>
                <Select
                  value={state.operator}
                  onValueChange={(value) => handleNumberFilterOperatorChange(config.field, value)}
                >
                  <SelectTrigger className="bg-background border-border text-foreground font-alata">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.operators.map((op) => (
                      <SelectItem key={op} value={op} className="font-alata">
                        {getOperatorLabel(op)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Value Input */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground font-alata">
                Value
                {config.range && (
                  <span className="ml-1">
                    ({config.range.min} - {config.range.max})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id={config.field}
                  type="number"
                  placeholder={config.range ? `${config.range.min} - ${config.range.max}` : 'Enter value'}
                  value={state.value}
                  onChange={(e) => handleNumberFilterValueChange(config.field, e.target.value)}
                  min={config.range?.min}
                  max={config.range?.max}
                  className="bg-background border-border text-foreground font-alata"
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/home')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <FilterIcon className="h-6 w-6 text-[hsl(280,100%,70%)]" />
                <h1 className="text-2xl font-alata font-bold text-foreground">
                  Create Custom Feed
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingFilters ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feed Details */}
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

            {/* Filter Configuration */}
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setLocation('/home')}
                className="border-border text-foreground hover:bg-muted font-alata"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFeed}
                disabled={isSaving}
                className="bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Feed
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
