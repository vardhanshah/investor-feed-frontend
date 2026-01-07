import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FilterConfig, FilterGroup } from '@/lib/api';
import { NumberFilterState } from '@/hooks/useFeedFilters';
import { ProfileSelector, ProfileSelections } from '@/components/ProfileSelector';

// Preset ranges for common filter fields
interface FilterPreset {
  label: string;
  min: number | null;  // null means use range min
  max: number | null;  // null means use range max
}

// Presets based on actual data distribution
const FILTER_PRESETS: Record<string, FilterPreset[]> = {
  // MCAP: 43% Micro, 19% Small, 20% Mid, 13% Large, 4.5% Mega
  mcap: [
    { label: 'Micro', min: null, max: 100 },      // <100 Cr (43%)
    { label: 'Small', min: 100, max: 500 },       // 100-500 Cr (19%)
    { label: 'Mid', min: 500, max: 5000 },        // 500-5K Cr (20%)
    { label: 'Large', min: 5000, max: 50000 },    // 5K-50K Cr (13%)
    { label: 'Mega', min: 50000, max: null },     // >50K Cr (4.5%)
  ],
  // PE: 9% Negative, 12% 0-10, 35% 10-30, 30% 30-100, 14% >100
  pe_ratio: [
    { label: 'Negative', min: null, max: 0 },     // Loss-making (9%)
    { label: 'Value', min: 0, max: 15 },          // Low PE (18%)
    { label: 'Fair', min: 15, max: 30 },          // Fair value (35%)
    { label: 'Growth', min: 30, max: 100 },       // Growth (30%)
    { label: 'Expensive', min: 100, max: null },  // Very high PE (14%)
  ],
  // PB: 10% Negative, 20% 0-1, 30% 1-3, 28% 3-10, 12% >10
  pb: [
    { label: 'Negative', min: null, max: 0 },     // Negative book (10%)
    { label: 'Deep Value', min: 0, max: 1 },      // Below book (20%)
    { label: 'Value', min: 1, max: 3 },           // Fair (30%)
    { label: 'Premium', min: 3, max: 10 },        // Premium (28%)
    { label: 'Expensive', min: 10, max: null },   // Very expensive (12%)
  ],
  // ROE: 24% Negative, 37% 0-10, 22% 10-20, 12% 20-50, 5% >50
  roe: [
    { label: 'Negative', min: null, max: 0 },     // Loss-making (24%)
    { label: 'Low', min: 0, max: 10 },            // Low ROE (37%)
    { label: 'Average', min: 10, max: 20 },       // Average (22%)
    { label: 'Good', min: 20, max: 30 },          // Good (8%)
    { label: 'Excellent', min: 30, max: null },   // Excellent (9%)
  ],
  roce: [
    { label: 'Negative', min: null, max: 0 },
    { label: 'Low', min: 0, max: 10 },
    { label: 'Average', min: 10, max: 20 },
    { label: 'Good', min: 20, max: 30 },
    { label: 'Excellent', min: 30, max: null },
  ],
  debt_to_equity: [
    { label: 'No Debt', min: null, max: 0.1 },
    { label: 'Low', min: null, max: 0.5 },
    { label: 'Moderate', min: 0.5, max: 1 },
    { label: 'High', min: 1, max: null },
  ],
  promoter_holding: [
    { label: 'Low', min: null, max: 30 },
    { label: 'Medium', min: 30, max: 50 },
    { label: 'High', min: 50, max: 75 },
    { label: 'Very High', min: 75, max: null },
  ],
};

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

// Distribution data: cumulative percentiles for each filter
// Each entry is [value, cumulative_percentile]
interface DistributionPoint {
  value: number;
  percentile: number;
}

const FILTER_DISTRIBUTIONS: Record<string, DistributionPoint[]> = {
  // MCAP distribution (5,086 profiles)
  mcap: [
    { value: 0, percentile: 0 },
    { value: 100, percentile: 43.1 },     // <100 Micro
    { value: 500, percentile: 62.5 },     // 100-500 Small
    { value: 1000, percentile: 69.0 },    // 500-1K
    { value: 5000, percentile: 82.5 },    // 1K-5K Mid
    { value: 10000, percentile: 87.3 },   // 5K-10K
    { value: 50000, percentile: 95.5 },   // 10K-50K Large
    { value: 100000, percentile: 97.6 },  // 50K-1L
    { value: 10000000, percentile: 100 }, // >1L Mega (use large max)
  ],
  // PE Ratio distribution (3,416 profiles)
  pe_ratio: [
    { value: -1000, percentile: 0 },      // Large negative
    { value: 0, percentile: 9.1 },        // Negative
    { value: 10, percentile: 21.3 },      // 0-10
    { value: 20, percentile: 40.7 },      // 10-20
    { value: 30, percentile: 55.9 },      // 20-30
    { value: 50, percentile: 71.6 },      // 30-50
    { value: 100, percentile: 85.8 },     // 50-100
    { value: 200, percentile: 92.7 },     // 100-200
    { value: 10000, percentile: 100 },    // >200
  ],
  // PB distribution (3,224 profiles)
  pb: [
    { value: -100, percentile: 0 },       // Large negative
    { value: 0, percentile: 10.1 },       // Negative
    { value: 1, percentile: 30.5 },       // 0-1
    { value: 2, percentile: 48.2 },       // 1-2
    { value: 3, percentile: 60.1 },       // 2-3
    { value: 5, percentile: 74.4 },       // 3-5
    { value: 10, percentile: 88.4 },      // 5-10
    { value: 20, percentile: 95.7 },      // 10-20
    { value: 1000, percentile: 100 },     // >20
  ],
  // ROE distribution (3,277 profiles)
  roe: [
    { value: -100, percentile: 0 },       // Large negative
    { value: -50, percentile: 3.8 },      // <-50
    { value: -20, percentile: 7.2 },      // -50 to -20
    { value: 0, percentile: 23.8 },       // -20 to 0
    { value: 10, percentile: 61.2 },      // 0-10
    { value: 20, percentile: 83.5 },      // 10-20
    { value: 30, percentile: 91.3 },      // 20-30
    { value: 50, percentile: 95.5 },      // 30-50
    { value: 200, percentile: 100 },      // >50
  ],
};

// Convert value to slider position (0-100) based on distribution
const valueToSliderPosition = (value: number, distribution: DistributionPoint[]): number => {
  // Find the two points the value falls between
  for (let i = 0; i < distribution.length - 1; i++) {
    const curr = distribution[i];
    const next = distribution[i + 1];
    if (value >= curr.value && value <= next.value) {
      // Linear interpolation between the two percentiles
      const valueRatio = (value - curr.value) / (next.value - curr.value);
      return curr.percentile + valueRatio * (next.percentile - curr.percentile);
    }
  }
  // Value outside range
  if (value < distribution[0].value) return 0;
  return 100;
};

// Convert slider position (0-100) to value based on distribution
const sliderPositionToValue = (position: number, distribution: DistributionPoint[]): number => {
  // Find the two points the position falls between
  for (let i = 0; i < distribution.length - 1; i++) {
    const curr = distribution[i];
    const next = distribution[i + 1];
    if (position >= curr.percentile && position <= next.percentile) {
      // Linear interpolation between the two values
      const percentileRatio = (position - curr.percentile) / (next.percentile - curr.percentile);
      const value = curr.value + percentileRatio * (next.value - curr.value);
      // Round to nice numbers
      return roundToNiceNumber(value);
    }
  }
  // Position outside range
  if (position <= 0) return distribution[0].value;
  return distribution[distribution.length - 1].value;
};

// Round to nice numbers based on magnitude
const roundToNiceNumber = (value: number): number => {
  const absValue = Math.abs(value);
  let rounded: number;
  if (absValue < 1) rounded = Math.round(value * 100) / 100;
  else if (absValue < 10) rounded = Math.round(value * 10) / 10;
  else if (absValue < 100) rounded = Math.round(value);
  else if (absValue < 1000) rounded = Math.round(value / 5) * 5;
  else if (absValue < 10000) rounded = Math.round(value / 100) * 100;
  else rounded = Math.round(value / 1000) * 1000;
  return rounded;
};

// Thresholds for ">" display (values above this show as "> threshold")
const HIGH_VALUE_THRESHOLDS: Record<string, number> = {
  mcap: 100000,      // > 1L Cr
  pe_ratio: 200,     // > 200
  pb: 20,            // > 20
  roe: 50,           // > 50%
};

// Format filter value for display with < 0 and > threshold handling
const formatFilterValue = (
  value: number,
  field: string,
  rangeMin: number,
  rangeMax: number,
  unit?: string | null
): string => {
  const threshold = HIGH_VALUE_THRESHOLDS[field];
  const unitStr = unit ? ` ${unit}` : '';

  // Check if at range minimum (show as minimum bound)
  if (value <= rangeMin) {
    if (rangeMin < 0) {
      return `< 0${unitStr}`;
    }
    return `${formatNumber(String(rangeMin))}${unitStr}`;
  }

  // Check if at or above high threshold (show as "> threshold")
  if (threshold && value >= threshold) {
    return `> ${formatNumber(String(threshold))}${unitStr}`;
  }

  // Check if negative
  if (value < 0) {
    return `< 0${unitStr}`;
  }

  // Normal display
  return `${formatNumber(String(value))}${unitStr}`;
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
  // State for collapsible sections - default to expanded for better visibility
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      // Default is true (expanded), so toggle from current state or default
      [sectionId]: !(prev[sectionId] ?? true)
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
      if (!state || !config.range) return null;

      const rangeMin = config.range.min;
      const rangeMax = config.range.max;
      const presets = FILTER_PRESETS[config.field];

      // Parse current values or use range defaults
      const currentMin = state.from ? parseFloat(state.from) : rangeMin;
      const currentMax = state.to ? parseFloat(state.to) : rangeMax;

      // Handle preset button click
      const handlePresetClick = (preset: FilterPreset) => {
        const newMin = preset.min ?? rangeMin;
        const newMax = preset.max ?? rangeMax;
        onNumberFilterFromChange(config.field, newMin === rangeMin ? '' : String(newMin));
        onNumberFilterToChange(config.field, newMax === rangeMax ? '' : String(newMax));
      };

      // Check if a preset is currently active
      const isPresetActive = (preset: FilterPreset) => {
        const presetMin = preset.min ?? rangeMin;
        const presetMax = preset.max ?? rangeMax;
        return currentMin === presetMin && currentMax === presetMax;
      };

      // Clear filter
      const handleClear = () => {
        onNumberFilterFromChange(config.field, '');
        onNumberFilterToChange(config.field, '');
      };

      // Check if filter is active (values differ from range defaults)
      const isActive = state.from || state.to;

      return (
        <div key={config.field} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          {/* Filter Label with Clear button */}
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor={config.field} className="text-sm font-semibold text-foreground">
              {config.label}
            </Label>
            {isActive && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Preset Buttons */}
          {presets && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    isPresetActive(preset)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Current Range Display */}
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span className={isActive && state.from ? 'text-primary font-medium' : ''}>
              {formatFilterValue(currentMin, config.field, rangeMin, rangeMax, config.unit)}
            </span>
            <span className={isActive && state.to ? 'text-primary font-medium' : ''}>
              {formatFilterValue(currentMax, config.field, rangeMin, rangeMax, config.unit)}
            </span>
          </div>

          {/* Range Slider - Distribution-based scale if available, otherwise linear */}
          {(() => {
            const distribution = FILTER_DISTRIBUTIONS[config.field];

            if (distribution) {
              // Distribution-based scale - slider position reflects % of companies
              const sliderMin = valueToSliderPosition(currentMin, distribution);
              const sliderMax = valueToSliderPosition(currentMax, distribution);

              return (
                <Slider
                  showTwoThumbs
                  min={0}
                  max={100}
                  step={0.5}
                  value={[sliderMin, sliderMax]}
                  onValueChange={(positions) => {
                    const [posMin, posMax] = positions;
                    const newMin = sliderPositionToValue(posMin, distribution);
                    const newMax = sliderPositionToValue(posMax, distribution);
                    const distMin = distribution[0].value;
                    const distMax = distribution[distribution.length - 1].value;
                    const isAtMin = posMin <= 0.5;
                    const isAtMax = posMax >= 99.5;
                    onNumberFilterFromChange(config.field, isAtMin ? '' : String(newMin));
                    onNumberFilterToChange(config.field, isAtMax ? '' : String(newMax));
                  }}
                  className="w-full"
                />
              );
            } else {
              // Linear scale fallback for fields without distribution data
              const step = (rangeMax - rangeMin) / 100;

              return (
                <Slider
                  showTwoThumbs
                  min={rangeMin}
                  max={rangeMax}
                  step={step}
                  value={[currentMin, currentMax]}
                  onValueChange={(values) => {
                    const [newMin, newMax] = values;
                    const roundedMin = roundToNiceNumber(newMin);
                    const roundedMax = roundToNiceNumber(newMax);
                    const isAtMin = Math.abs(roundedMin - rangeMin) < step;
                    const isAtMax = Math.abs(roundedMax - rangeMax) < step;
                    onNumberFilterFromChange(config.field, isAtMin ? '' : String(roundedMin));
                    onNumberFilterToChange(config.field, isAtMax ? '' : String(roundedMax));
                  }}
                  className="w-full"
                />
              );
            }
          })()}

          {/* Range bounds label */}
          <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1">
            <span>{formatFilterValue(rangeMin, config.field, rangeMin, rangeMax, config.unit)}</span>
            <span>{formatFilterValue(rangeMax, config.field, rangeMin, rangeMax, config.unit)}</span>
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

          const isExpanded = expandedSections[group.group_id] ?? true;

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
          const isExpanded = expandedSections['additional-filters'] ?? true;
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
