import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { FilterConfig } from '@/lib/api';

export interface ActiveFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
}

interface FilterBuilderProps {
  filterConfigs: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
}

// Generate unique ID for each filter
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get operator display label
const getOperatorLabel = (operator: string): string => {
  const labels: Record<string, string> = {
    'gte': '≥',
    'lte': '≤',
    'gt': '>',
    'lt': '<',
    'eq': '=',
    'in': 'in',
  };
  return labels[operator] || operator;
};

// Get full operator description
const getOperatorDescription = (operator: string): string => {
  const descriptions: Record<string, string> = {
    'gte': 'Greater than or equal',
    'lte': 'Less than or equal',
    'gt': 'Greater than',
    'lt': 'Less than',
    'eq': 'Equal to',
    'in': 'Is one of',
  };
  return descriptions[operator] || operator;
};

export default function FilterBuilder({ filterConfigs, activeFilters, onFiltersChange }: FilterBuilderProps) {
  const [isAddingFilter, setIsAddingFilter] = useState(false);

  // Add a new empty filter
  const handleAddFilter = () => {
    setIsAddingFilter(true);
    const newFilter: ActiveFilter = {
      id: generateId(),
      field: '',
      operator: '',
      value: null,
    };
    onFiltersChange([...activeFilters, newFilter]);
  };

  // Remove a filter
  const handleRemoveFilter = (id: string) => {
    onFiltersChange(activeFilters.filter(f => f.id !== id));
  };

  // Update a filter's field
  const handleFieldChange = (id: string, field: string) => {
    const config = filterConfigs.find(c => c.field === field);
    if (!config) return;

    // Set default operator and value based on type
    let defaultOperator = '';
    let defaultValue: any = null;

    if (config.type === 'number') {
      defaultOperator = config.operators?.[0] || 'gte';
      defaultValue = '';
    } else if (config.type === 'boolean') {
      defaultOperator = 'eq';
      defaultValue = true;
    } else if (config.type === 'string') {
      defaultOperator = config.operators?.[0] || 'eq';
      defaultValue = '';
    }

    onFiltersChange(activeFilters.map(f =>
      f.id === id
        ? { ...f, field, operator: defaultOperator, value: defaultValue }
        : f
    ));
  };

  // Update a filter's operator
  const handleOperatorChange = (id: string, operator: string) => {
    onFiltersChange(activeFilters.map(f =>
      f.id === id ? { ...f, operator } : f
    ));
  };

  // Update a filter's value
  const handleValueChange = (id: string, value: any) => {
    onFiltersChange(activeFilters.map(f =>
      f.id === id ? { ...f, value } : f
    ));
  };

  // Get available filters (exclude already selected ones for unique selection, but allow duplicates for number filters)
  const getAvailableFilters = (currentField: string) => {
    return filterConfigs.filter(config => {
      // Always show the current field
      if (config.field === currentField) return true;
      // For number filters, allow duplicates (e.g., mcap >= 100 AND mcap <= 1000)
      if (config.type === 'number') return true;
      // For boolean filters, only allow one instance
      if (config.type === 'boolean') {
        return !activeFilters.some(f => f.field === config.field);
      }
      // For string filters, allow duplicates for 'in' operator flexibility
      return true;
    });
  };

  // Render value input based on filter type
  const renderValueInput = (filter: ActiveFilter, config: FilterConfig) => {
    if (config.type === 'number') {
      return (
        <div className="flex items-center gap-2 flex-1">
          <Input
            type="number"
            placeholder={config.range ? `${config.range.min} - ${config.range.max}` : 'Value'}
            value={filter.value || ''}
            onChange={(e) => handleValueChange(filter.id, e.target.value)}
            min={config.range?.min}
            max={config.range?.max}
            className="bg-background border-border text-foreground font-alata w-32"
          />
          {config.unit && (
            <span className="text-muted-foreground text-sm font-alata whitespace-nowrap">
              {config.unit}
            </span>
          )}
        </div>
      );
    }

    if (config.type === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={filter.value === true}
            onCheckedChange={(checked) => handleValueChange(filter.id, checked)}
          />
          <span className="text-sm text-muted-foreground font-alata">
            {filter.value ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    if (config.type === 'string') {
      return (
        <Input
          type="text"
          placeholder={`Enter ${config.label.toLowerCase()}`}
          value={filter.value || ''}
          onChange={(e) => handleValueChange(filter.id, e.target.value)}
          className="bg-background border-border text-foreground font-alata flex-1"
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {/* Active Filters */}
      {activeFilters.map((filter) => {
        const config = filterConfigs.find(c => c.field === filter.field);
        const availableFilters = getAvailableFilters(filter.field);

        return (
          <Card
            key={filter.id}
            className="bg-card border-border p-4 transition-all hover:border-[hsl(280,100%,70%)]/30"
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Field Selector */}
              <Select
                value={filter.field}
                onValueChange={(value) => handleFieldChange(filter.id, value)}
              >
                <SelectTrigger className="bg-background border-border text-foreground font-alata w-40">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  {availableFilters.map((cfg) => (
                    <SelectItem key={cfg.field} value={cfg.field} className="font-alata">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Operator Selector (for number and string types) */}
              {config && config.type !== 'boolean' && config.operators && config.operators.length > 0 && (
                <Select
                  value={filter.operator}
                  onValueChange={(value) => handleOperatorChange(filter.id, value)}
                >
                  <SelectTrigger className="bg-background border-border text-foreground font-alata w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.operators.map((op) => (
                      <SelectItem key={op} value={op} className="font-alata">
                        <span className="font-mono">{getOperatorLabel(op)}</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                          {getOperatorDescription(op)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Value Input */}
              {config && renderValueInput(filter, config)}

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFilter(filter.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Description */}
            {config && (
              <p className="text-xs text-muted-foreground font-alata mt-2 pl-1">
                {config.description}
              </p>
            )}
          </Card>
        );
      })}

      {/* Add Filter Button */}
      <Button
        variant="outline"
        onClick={handleAddFilter}
        className="w-full border-dashed border-border hover:border-[hsl(280,100%,70%)] hover:bg-[hsl(280,100%,70%)]/5 text-muted-foreground hover:text-[hsl(280,100%,70%)] font-alata transition-all"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Filter
      </Button>

      {/* Empty State */}
      {activeFilters.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground font-alata text-sm">
            No filters added yet. Click "Add Filter" to start building your custom feed.
          </p>
        </div>
      )}
    </div>
  );
}
