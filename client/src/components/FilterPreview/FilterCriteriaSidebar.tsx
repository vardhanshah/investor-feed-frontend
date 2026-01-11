import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FilterConfig, FilterGroup } from '@/lib/api';
import { NumberFilterState } from '@/hooks/useFeedFilters';
import { ProfileSelections } from '@/components/ProfileSelector';
import { NumberFilterSlider } from '@/components/NumberFilterSlider';
import { useFilterDistribution } from '@/hooks/useFilterDistribution';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FilterCriteriaSidebarProps {
  filterConfigs: FilterConfig[];
  filterGroups: FilterGroup[];
  filterValues: Record<string, any>;
  numberFilterStates: Record<string, NumberFilterState>;
  profileSelections: ProfileSelections;
  onFilterChange: (field: string, value: any) => void;
  onNumberFilterFromChange: (field: string, value: string) => void;
  onNumberFilterToChange: (field: string, value: string) => void;
  onClear: () => void;
  isSearching: boolean;
  hasActiveFilters: boolean;
}

export default function FilterCriteriaSidebar({
  filterConfigs,
  filterGroups,
  filterValues,
  numberFilterStates,
  profileSelections,
  onFilterChange,
  onNumberFilterFromChange,
  onNumberFilterToChange,
  onClear,
  isSearching,
  hasActiveFilters,
}: FilterCriteriaSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Fetch distribution data for sliders
  const { getDistribution } = useFilterDistribution();

  // Count active filters
  const activeFilterCount = (() => {
    let count = 0;
    // Count boolean filters
    for (const [field, value] of Object.entries(filterValues)) {
      const config = filterConfigs.find(c => c.field === field);
      if (config?.type === 'boolean' && value === true) {
        count++;
      }
    }
    // Count number filters
    for (const [, state] of Object.entries(numberFilterStates)) {
      if ((state.from && state.from.trim() !== '') || (state.to && state.to.trim() !== '')) {
        count++;
      }
    }
    return count;
  })();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Check if company filters should be disabled
  const hasIndividualCompanies = profileSelections.companies.length > 0;

  // Render filter input based on type
  const renderFilterInput = (config: FilterConfig) => {
    if (config.type === 'number') {
      const state = numberFilterStates[config.field];
      if (!state) return null;

      const distribution = getDistribution(config.field);

      return (
        <div key={config.field} className="py-2">
          <NumberFilterSlider
            field={config.field}
            label={config.label}
            unit={config.unit}
            distribution={distribution}
            fromValue={state.from}
            toValue={state.to}
            onFromChange={(value) => onNumberFilterFromChange(config.field, value)}
            onToChange={(value) => onNumberFilterToChange(config.field, value)}
            compact={true}
          />
        </div>
      );
    } else if (config.type === 'boolean') {
      return (
        <div key={config.field} className="flex items-center space-x-2 py-1.5">
          <Checkbox
            id={`sidebar-${config.field}`}
            checked={filterValues[config.field] || false}
            onCheckedChange={(checked) => onFilterChange(config.field, checked)}
          />
          <Label
            htmlFor={`sidebar-${config.field}`}
            className="text-xs font-medium text-foreground cursor-pointer"
          >
            {config.label}
          </Label>
        </div>
      );
    }
    return null;
  };

  // Sidebar content
  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Filters</h3>
          </div>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {filterGroups.length > 0 ? (
          filterGroups.map((group, groupIndex) => {
            const groupFilters = filterConfigs.filter(
              f => f.group === group.group_id && f.field !== 'profile_id'
            );
            if (groupFilters.length === 0) return null;

            // First group is "Company Filters" - hide when individual companies selected
            const isCompanyFiltersGroup = groupIndex === 0;
            if (isCompanyFiltersGroup && hasIndividualCompanies) {
              return (
                <div key={group.group_id} className="mb-3 p-2 rounded-md bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50">
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    Company filters disabled when specific companies are selected
                  </p>
                </div>
              );
            }

            const isExpanded = expandedGroups[group.group_id] ?? true;

            return (
              <div key={group.group_id} className="mb-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
                  onClick={() => toggleGroup(group.group_id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {group.group_label}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {group.group_operator.toUpperCase()}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <div className="pl-2 pr-1 pb-2">
                    {groupFilters.map(config => renderFilterInput(config))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="space-y-2">
            {filterConfigs
              .filter(config => config.field !== 'profile_id')
              .map(config => renderFilterInput(config))}
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-l border-border bg-background transition-all duration-300 ${
          isCollapsed ? 'w-12' : 'w-72'
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCollapsed(false)}
            >
              <Filter className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCollapsed(true)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </>
        )}
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden fixed right-4 bottom-20 z-40 shadow-lg"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-140px)] overflow-y-auto p-4">
            {filterGroups.length > 0 ? (
              filterGroups.map((group, groupIndex) => {
                const groupFilters = filterConfigs.filter(
                  f => f.group === group.group_id && f.field !== 'profile_id'
                );
                if (groupFilters.length === 0) return null;

                const isCompanyFiltersGroup = groupIndex === 0;
                if (isCompanyFiltersGroup && hasIndividualCompanies) {
                  return (
                    <div key={group.group_id} className="mb-4 p-3 rounded-md bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50">
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Company filters disabled when specific companies are selected
                      </p>
                    </div>
                  );
                }

                const isExpanded = expandedGroups[group.group_id] ?? true;

                return (
                  <div key={group.group_id} className="mb-4">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
                      onClick={() => toggleGroup(group.group_id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {group.group_label}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {group.group_operator.toUpperCase()}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="pl-2 pr-1 pb-2">
                        {groupFilters.map(config => renderFilterInput(config))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="space-y-2">
                {filterConfigs
                  .filter(config => config.field !== 'profile_id')
                  .map(config => renderFilterInput(config))}
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onClear();
                  setIsMobileOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
