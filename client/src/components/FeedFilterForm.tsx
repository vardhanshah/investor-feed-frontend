import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FilterConfig, FilterGroup } from '@/lib/api';
import { NumberFilterState } from '@/hooks/useFeedFilters';
import { ProfileSelector, ProfileSelections } from '@/components/ProfileSelector';

interface FeedFilterFormProps {
  filterConfigs: FilterConfig[];
  filterGroups?: FilterGroup[];
  filterValues: Record<string, any>;
  numberFilterStates: Record<string, NumberFilterState>;
  profileSelections: ProfileSelections;
  feedName: string;
  feedDescription: string;
  onFilterChange: (field: string, value: any) => void;
  onNumberFilterFromChange: (field: string, value: string) => void;
  onNumberFilterToChange: (field: string, value: string) => void;
  onProfileSelectionsChange: (selections: ProfileSelections) => void;
  onFeedNameChange: (name: string) => void;
  onFeedDescriptionChange: (description: string) => void;
  showFeedDetails?: boolean;
  showCombinedQuery?: boolean;
}

// Format number with thousand separators
const formatNumber = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
};

// Format number for display in input field (add commas)
const formatNumberForInput = (value: string): string => {
  if (!value) return '';
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
  return value.replace(/[,\s]/g, '');
};

// Feed Filter Form with collapsible filter sections
export function FeedFilterForm({
  filterConfigs,
  filterGroups = [],
  filterValues,
  numberFilterStates,
  profileSelections,
  feedName,
  feedDescription,
  onFilterChange,
  onNumberFilterFromChange,
  onNumberFilterToChange,
  onProfileSelectionsChange,
  onFeedNameChange,
  onFeedDescriptionChange,
  showFeedDetails = true,
  showCombinedQuery = true,
}: FeedFilterFormProps) {
  // State for collapsible sections - default to collapsed to save space
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Auto-expand sections that have active filters when editing a feed
  useEffect(() => {
    const sectionsToExpand: Record<string, boolean> = {};

    // Check each group for active filters
    filterGroups.forEach((group) => {
      const groupFilters = filterConfigs.filter(f =>
        f.group === group.group_id && f.field !== 'profile_id'
      );

      const hasActiveFilters = groupFilters.some(config => {
        if (config.type === 'boolean') {
          return filterValues[config.field] === true;
        } else if (config.type === 'number') {
          const state = numberFilterStates[config.field];
          return state && (state.from.trim() !== '' || state.to.trim() !== '');
        }
        return false;
      });

      if (hasActiveFilters) {
        sectionsToExpand[group.group_id] = true;
      }
    });

    // Only update if we have sections to expand
    if (Object.keys(sectionsToExpand).length > 0) {
      setExpandedSections(sectionsToExpand);
    }
  }, [filterConfigs, filterGroups, filterValues, numberFilterStates]);

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
        return `${config.label}: ${formatNumber(state.from)} - ${formatNumber(state.to)}${config.unit ? ' ' + config.unit : ''}`;
      } else if (hasFrom) {
        return `${config.label} ≥ ${formatNumber(state.from)}${config.unit ? ' ' + config.unit : ''}`;
      } else if (hasTo) {
        return `${config.label} ≤ ${formatNumber(state.to)}${config.unit ? ' ' + config.unit : ''}`;
      }
    }
    return null;
  };

  // Build query preview for a group
  const buildGroupQueryPreview = (group: FilterGroup): React.ReactNode | null => {
    const groupFilters = filterConfigs.filter(f =>
      f.group === group.group_id && f.field !== 'profile_id'
    );
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

  // Build profile selection description
  const buildProfileSelectionText = (): string | null => {
    const hasCompanies = profileSelections.companies.length > 0;
    const hasSectors = profileSelections.sectors.length > 0;
    const hasSubsectors = profileSelections.subsectors.length > 0;

    if (!hasCompanies && !hasSectors && !hasSubsectors) {
      return "ALL Companies";
    }

    const parts: string[] = [];

    if (hasCompanies) {
      const companyNames = profileSelections.companies.map(c => c.title).join(', ');
      parts.push(`Selected Companies (${companyNames})`);
    }

    if (hasSectors) {
      const sectorNames = profileSelections.sectors.map(s => s.value).join(', ');
      parts.push(`Selected Sectors (${sectorNames})`);
    }

    if (hasSubsectors) {
      const subsectorNames = profileSelections.subsectors.map(s => s.value).join(', ');
      parts.push(`Selected Sub-Sectors (${subsectorNames})`);
    }

    return parts.join(' & ');
  };

  // Build full query preview combining all groups
  const buildFullQueryPreview = (): React.ReactNode | null => {
    const profileText = buildProfileSelectionText();

    const groupPreviews = filterGroups
      .map((group, groupIndex) => {
        const groupFilters = filterConfigs.filter(f =>
          f.group === group.group_id && f.field !== 'profile_id'
        );
        const activeDescriptions = groupFilters
          .map(config => getFilterDescription(config))
          .filter(desc => desc !== null);

        if (activeDescriptions.length === 0) return null;

        const operator = group.group_operator === 'and' ? 'AND' : 'OR';
        return {
          groupIndex, // Track original group index
          label: group.group_label,
          preview: activeDescriptions.join(` ${operator} `),
        };
      })
      .filter(p => p !== null);

    if (groupPreviews.length === 0 && !profileText) return null;

    // Build the sentence parts
    // Company filters ONLY apply when no individual companies are selected
    const hasIndividualCompanies = profileSelections.companies.length > 0;

    // Find Company Filters (group 0) and Post Filters (group 1+) by their original group index
    const hasCompanyFilters = !hasIndividualCompanies
      ? groupPreviews.find(p => p.groupIndex === 0) || null
      : null;
    const hasPostFilters = groupPreviews.find(p => p.groupIndex > 0) || null;

    // Build company description
    let companyDescription = "ALL Companies";

    const hasSectors = profileSelections.sectors.length > 0;
    const hasSubsectors = profileSelections.subsectors.length > 0;

    if (hasIndividualCompanies) {
      // Path A: Individual companies selected - no company filters apply
      companyDescription = profileSelections.companies.map(c => c.title).join(', ');
    } else if (hasSectors || hasSubsectors) {
      // Path B: Sectors/Subsectors selected - company filters apply
      const sectorSubsectorList = [
        ...profileSelections.sectors.map(s => s.value),
        ...profileSelections.subsectors.map(s => s.value)
      ];
      companyDescription = `Companies from ${sectorSubsectorList.join(', ')}`;
    }
    // else: defaults to "ALL Companies"

    return (
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground/70 font-medium">
          Feed will show
        </div>

        <div className="space-y-3">
          {/* Company Selection */}
          <div className="text-lg font-bold text-foreground leading-relaxed">
            {companyDescription}
          </div>

          {/* Company Filters */}
          {hasCompanyFilters && (
            <div className="pl-4 border-l-3 border-[hsl(280,100%,70%)]/40 py-2">
              <div className="text-xs text-muted-foreground/70 mb-1.5 uppercase tracking-wide">
                that have
              </div>
              <div className="text-base font-semibold text-foreground">
                {hasCompanyFilters.preview}
              </div>
            </div>
          )}

          {/* Post Filters */}
          {hasPostFilters && (
            <div className="pl-4 border-l-3 border-[hsl(280,100%,70%)]/40 py-2">
              <div className="text-xs text-muted-foreground/70 mb-1.5 uppercase tracking-wide">
                {hasCompanyFilters ? "and posts with" : "that have posts with"}
              </div>
              <div className="text-base font-semibold text-foreground">
                {hasPostFilters.preview}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render filter input based on type - Redesigned for clarity
  const renderFilterInput = (config: FilterConfig) => {
    if (config.type === 'number') {
      const state = numberFilterStates[config.field];
      if (!state) return null;

      return (
        <div key={config.field} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          {/* Filter Label - Prominent and clear */}
          <Label htmlFor={config.field} className="text-sm font-semibold text-foreground mb-3 block">
            {config.label}
          </Label>

          {/* Range Inputs - Simplified, side by side */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              id={`${config.field}-from`}
              type="text"
              inputMode="numeric"
              placeholder={`Min${config.unit ? ' (' + config.unit + ')' : ''}`}
              value={state.from ? formatNumberForInput(state.from) : ''}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                onNumberFilterFromChange(config.field, rawValue);
              }}
              className="h-9 text-sm"
            />
            <Input
              id={`${config.field}-to`}
              type="text"
              inputMode="numeric"
              placeholder={`Max${config.unit ? ' (' + config.unit + ')' : ''}`}
              value={state.to ? formatNumberForInput(state.to) : ''}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                onNumberFilterToChange(config.field, rawValue);
              }}
              className="h-9 text-sm"
            />
          </div>
        </div>
      );
    } else if (config.type === 'boolean') {
      return (
        <div key={config.field} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center space-x-3">
            <Checkbox
              id={config.field}
              checked={filterValues[config.field] || false}
              onCheckedChange={(checked) => onFilterChange(config.field, checked)}
            />
            <Label
              htmlFor={config.field}
              className="text-sm font-semibold text-foreground cursor-pointer"
            >
              {config.label}
            </Label>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Feed Details - Show first if enabled */}
      {showFeedDetails && (
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
                onChange={(e) => onFeedNameChange(e.target.value)}
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
                onChange={(e) => onFeedDescriptionChange(e.target.value)}
                className="bg-background border-border text-foreground font-alata"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Selection (Companies, Sectors, Subsectors) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground font-alata">Company & Sector Selection</CardTitle>
          <CardDescription className="text-muted-foreground font-alata">
            Select specific companies, sectors, or sub-sectors to include in your feed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSelector
            selections={profileSelections}
            onSelectionsChange={onProfileSelectionsChange}
          />
        </CardContent>
      </Card>

      {/* Additional Filters - Grouped or Flat */}
      {filterGroups.length > 0 ? (
        // Render grouped filters
        filterGroups.map((group, groupIndex) => {
          // Filter out profile_id field - it's handled by ProfileSelector, not as a filter input
          const groupFilters = filterConfigs.filter(f =>
            f.group === group.group_id && f.field !== 'profile_id'
          );
          if (groupFilters.length === 0) return null;

          // First group is "Company Filters" - hide when individual companies selected
          const isCompanyFiltersGroup = groupIndex === 0;
          const hasIndividualCompanies = profileSelections.companies.length > 0;

          // If this is company filters group and individual companies are selected, show disabled state
          if (isCompanyFiltersGroup && hasIndividualCompanies) {
            return (
              <Card key={group.group_id} className="bg-card border-border border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-foreground font-alata">{group.group_label}</CardTitle>
                  <CardDescription className="text-muted-foreground font-alata">
                    Not applicable when specific companies are selected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md p-4">
                    <p className="text-sm text-orange-900 dark:text-orange-200 font-alata">
                      You've selected specific companies. Company filters (Market Cap, Revenue, etc.) only apply when filtering by sectors, subsectors, or all companies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }

          const isExpanded = expandedSections[group.group_id] || false;

          return (
            <Card key={group.group_id} className="bg-card border-border">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(group.group_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <CardTitle className="text-foreground font-alata">{group.group_label}</CardTitle>
                    <Badge
                      variant="outline"
                      className="border-border text-muted-foreground font-alata text-xs"
                    >
                      {group.group_operator.toUpperCase()} Logic
                    </Badge>
                  </div>
                  <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection(group.group_id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <CardDescription className="text-muted-foreground font-alata">
                  {group.group_description || `Select ${group.group_label.toLowerCase()} for your feed`}
                </CardDescription>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-4">
                  {/* Filters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupFilters.map((config) => renderFilterInput(config))}
                  </div>

                  {/* Query Preview */}
                  {buildGroupQueryPreview(group) && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="text-xs font-semibold text-muted-foreground font-alata mb-2">
                        Active Filters:
                      </div>
                      <div className="bg-muted/50 rounded-md p-3 text-xs text-foreground leading-relaxed">
                        {buildGroupQueryPreview(group)}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })
      ) : (
        // Render flat filters (no grouping)
        (() => {
          const isExpanded = expandedSections['additional-filters'] || false;
          return (
            <Card className="bg-card border-border">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection('additional-filters')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground font-alata">Additional Filters</CardTitle>
                  <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSection('additional-filters');
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <CardDescription className="text-muted-foreground font-alata">
                  Apply additional filters based on company metrics
                </CardDescription>
              </CardHeader>
              {isExpanded && (
                <CardContent className="p-4">
                  {filterConfigs.length === 0 ? (
                    <p className="text-muted-foreground font-alata text-center py-8">
                      No filters available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filterConfigs
                        .filter(config => config.field !== 'profile_id')
                        .map((config) => renderFilterInput(config))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })()
      )}

      {/* Combined Query Preview */}
      {showCombinedQuery && buildFullQueryPreview() && (filterGroups.length > 0 || profileSelections.companies.length > 0 || profileSelections.sectors.length > 0 || profileSelections.subsectors.length > 0) && (
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
  );
}
