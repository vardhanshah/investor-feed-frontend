import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, Building2, Layers, FolderTree, X, Check, Globe } from 'lucide-react';
import { profilesApi, AutocompleteResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type TabType = 'company' | 'sector' | 'subsector';

export interface SelectedCompany {
  id: number;
  title: string;
}

export interface SelectedSector {
  value: string;
}

export interface SelectedSubsector {
  value: string;
}

export interface ProfileSelections {
  companies: SelectedCompany[];
  sectors: SelectedSector[];
  subsectors: SelectedSubsector[];
}

interface ProfileSelectorProps {
  selections: ProfileSelections;
  onSelectionsChange: (selections: ProfileSelections) => void;
}

type ScopeMode = 'all' | 'sectors' | 'companies';

// ProfileSelector component with direct search input
export function ProfileSelector({ selections, onSelectionsChange }: ProfileSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [results, setResults] = useState<Record<TabType, AutocompleteResult[]>>({
    company: [],
    sector: [],
    subsector: [],
  });
  const [loading, setLoading] = useState<Record<TabType, boolean>>({
    company: false,
    sector: false,
    subsector: false,
  });
  const [fetched, setFetched] = useState<Record<TabType, boolean>>({
    company: false,
    sector: false,
    subsector: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine current mode based on selections
  const getCurrentMode = (): ScopeMode => {
    if (selections.companies.length > 0) return 'companies';
    if (selections.sectors.length > 0 || selections.subsectors.length > 0) return 'sectors';
    return 'all';
  };

  const [scopeMode, setScopeMode] = useState<ScopeMode>(getCurrentMode());
  const { toast } = useToast();

  // Handle mode change with auto-clearing
  const handleModeChange = useCallback((newMode: ScopeMode) => {
    if (newMode === scopeMode) return;

    setScopeMode(newMode);

    if (newMode === 'all') {
      // Clear everything
      onSelectionsChange({ companies: [], sectors: [], subsectors: [] });
      toast({
        title: 'Switched to All Companies',
        description: 'Previous selections cleared',
      });
    } else if (newMode === 'sectors') {
      // Clear companies, keep sectors/subsectors
      if (selections.companies.length > 0) {
        onSelectionsChange({
          companies: [],
          sectors: selections.sectors,
          subsectors: selections.subsectors,
        });
        toast({
          title: 'Switched to Sector Filtering',
          description: 'Company selections cleared',
        });
      }
      setActiveTab('sector');
    } else if (newMode === 'companies') {
      // Clear sectors/subsectors, keep companies
      if (selections.sectors.length > 0 || selections.subsectors.length > 0) {
        onSelectionsChange({
          companies: selections.companies,
          sectors: [],
          subsectors: [],
        });
        toast({
          title: 'Switched to Company Selection',
          description: 'Sector/subsector selections cleared',
        });
      }
      setActiveTab('company');
    }
  }, [scopeMode, selections, onSelectionsChange, toast]);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch results for a specific tab
  const fetchResults = useCallback(async (tab: TabType, searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(prev => ({ ...prev, [tab]: [] }));
      setFetched(prev => ({ ...prev, [tab]: false }));
      return;
    }

    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      const data = await profilesApi.autocomplete(searchQuery, 30, tab);
      setResults(prev => ({ ...prev, [tab]: data }));
      setFetched(prev => ({ ...prev, [tab]: true }));
    } catch (error) {
      console.error(`Autocomplete error for ${tab}:`, error);
      setResults(prev => ({ ...prev, [tab]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, []);

  // Reset fetched flags when query changes
  const prevQueryRef = useRef(debouncedQuery);
  useEffect(() => {
    if (prevQueryRef.current !== debouncedQuery) {
      setFetched({ company: false, sector: false, subsector: false });
      prevQueryRef.current = debouncedQuery;
    }
  }, [debouncedQuery]);

  // When query or tab changes, fetch if not already fetched
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ company: [], sector: [], subsector: [] });
      setFetched({ company: false, sector: false, subsector: false });
      return;
    }

    // Lazy load: check inside setFetched to avoid stale closures
    setFetched((currentFetched) => {
      // Only fetch if not already fetched for this tab
      if (!currentFetched[activeTab]) {
        fetchResults(activeTab, debouncedQuery);
        return currentFetched;
      }
      return currentFetched;
    });
  }, [debouncedQuery, activeTab, fetchResults]);

  // When tab changes, just update the active tab
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabType);
  }, []);

  // Check if item is selected
  const isSelected = useCallback((result: AutocompleteResult): boolean => {
    if (result.type === 'company') {
      return selections.companies.some(c => c.id === result.id);
    } else if (result.type === 'sector') {
      return selections.sectors.some(s => s.value === result.value);
    } else {
      return selections.subsectors.some(s => s.value === result.value);
    }
  }, [selections]);

  // Handle selection toggle
  const handleSelect = useCallback(
    (result: AutocompleteResult) => {
      const selected = isSelected(result);

      if (result.type === 'company') {
        if (selected) {
          // Remove
          onSelectionsChange({
            ...selections,
            companies: selections.companies.filter(c => c.id !== result.id),
          });
        } else {
          // Add
          onSelectionsChange({
            ...selections,
            companies: [...selections.companies, { id: result.id, title: result.title }],
          });
        }
      } else if (result.type === 'sector') {
        if (selected) {
          // Remove
          onSelectionsChange({
            ...selections,
            sectors: selections.sectors.filter(s => s.value !== result.value),
          });
        } else {
          // Add
          onSelectionsChange({
            ...selections,
            sectors: [...selections.sectors, { value: result.value }],
          });
        }
      } else {
        if (selected) {
          // Remove
          onSelectionsChange({
            ...selections,
            subsectors: selections.subsectors.filter(s => s.value !== result.value),
          });
        } else {
          // Add
          onSelectionsChange({
            ...selections,
            subsectors: [...selections.subsectors, { value: result.value }],
          });
        }
      }
    },
    [selections, isSelected, onSelectionsChange]
  );

  // Remove handlers
  const removeCompany = useCallback((id: number) => {
    onSelectionsChange({
      ...selections,
      companies: selections.companies.filter(c => c.id !== id),
    });
  }, [selections, onSelectionsChange]);

  const removeSector = useCallback((value: string) => {
    onSelectionsChange({
      ...selections,
      sectors: selections.sectors.filter(s => s.value !== value),
    });
  }, [selections, onSelectionsChange]);

  const removeSubsector = useCallback((value: string) => {
    onSelectionsChange({
      ...selections,
      subsectors: selections.subsectors.filter(s => s.value !== value),
    });
  }, [selections, onSelectionsChange]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const currentResults = results[activeTab];
  const isLoading = loading[activeTab];
  const totalSelected = selections.companies.length + selections.sectors.length + selections.subsectors.length;

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Feed Scope</Label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('all')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              scopeMode === 'all'
                ? 'border-[hsl(280,100%,70%)] bg-[hsl(280,100%,70%)]/10'
                : 'border-border hover:border-[hsl(280,100%,70%)]/50'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              scopeMode === 'all' ? 'border-[hsl(280,100%,70%)]' : 'border-border'
            }`}>
              {scopeMode === 'all' && (
                <div className="w-2 h-2 rounded-full bg-[hsl(280,100%,70%)]" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="font-medium text-sm">All Companies</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('sectors')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              scopeMode === 'sectors'
                ? 'border-[hsl(280,100%,70%)] bg-[hsl(280,100%,70%)]/10'
                : 'border-border hover:border-[hsl(280,100%,70%)]/50'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              scopeMode === 'sectors' ? 'border-[hsl(280,100%,70%)]' : 'border-border'
            }`}>
              {scopeMode === 'sectors' && (
                <div className="w-2 h-2 rounded-full bg-[hsl(280,100%,70%)]" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="font-medium text-sm">Filter by Sectors/Subsectors</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('companies')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              scopeMode === 'companies'
                ? 'border-[hsl(280,100%,70%)] bg-[hsl(280,100%,70%)]/10'
                : 'border-border hover:border-[hsl(280,100%,70%)]/50'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              scopeMode === 'companies' ? 'border-[hsl(280,100%,70%)]' : 'border-border'
            }`}>
              {scopeMode === 'companies' && (
                <div className="w-2 h-2 rounded-full bg-[hsl(280,100%,70%)]" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium text-sm">Select Specific Companies</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search/Selection UI - Only show if not "All Companies" mode */}
      {scopeMode !== 'all' && (
        <div className="space-y-2" ref={dropdownRef}>
          {/* Direct search input - always visible and typeable */}
          <div className="relative">
            <div className="flex items-center border border-border rounded-md px-3 bg-background hover:bg-muted focus-within:ring-2 focus-within:ring-[hsl(280,100%,70%)] focus-within:border-[hsl(280,100%,70%)] transition-all">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder={
                  scopeMode === 'companies'
                    ? 'Type to search companies...'
                    : 'Type to search sectors/subsectors...'
                }
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {isLoading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
              )}
              {totalSelected > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalSelected} selected
                </Badge>
              )}
            </div>
          </div>

          {/* Results dropdown - appears when typing */}
          {open && query.trim() && (
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 z-50 border border-border rounded-md shadow-lg bg-background max-h-[400px] overflow-hidden">
                <Command shouldFilter={false}>

                  {scopeMode === 'companies' ? (
                    // Company mode - no tabs, just show results
                    <>
                      <div className="border-b px-3 py-2 text-sm font-medium text-muted-foreground">
                        Searching Companies
                      </div>
                      <CommandList>
                        {!isLoading && currentResults.length === 0 && (
                          <CommandEmpty>No results found.</CommandEmpty>
                        )}
                        {currentResults.length > 0 && (
                          <CommandGroup>
                            {currentResults.map((result, idx) => {
                              const key = result.type === 'company'
                                ? `company-${result.id}`
                                : `${result.type}-${result.value}`;
                              const selected = isSelected(result);

                              return (
                                <CommandItem
                                  key={key}
                                  value={`${result.type}-${idx}`}
                                  onSelect={() => handleSelect(result)}
                                  className="cursor-pointer data-[selected=true]:bg-muted"
                                >
                                  {selected && (
                                    <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                  )}
                                  {result.type === 'company' ? (
                                    <div className="flex items-center gap-3 w-full">
                                      {result.logo_url ? (
                                        <img
                                          src={result.logo_url}
                                          alt=""
                                          className="h-8 w-8 rounded-md object-contain bg-background border border-border p-0.5"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-md bg-background border border-border flex items-center justify-center text-xs font-medium text-muted-foreground">
                                          {result.title.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium truncate text-foreground">
                                          {result.title}
                                        </span>
                                        {result.symbol && (
                                          <span className="text-xs text-muted-foreground">
                                            {result.symbol}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ) : result.type === 'sector' ? (
                                    <div className="flex items-center gap-3 w-full">
                                      <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                                        <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium truncate text-foreground">
                                          {result.value}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {result.count} {result.count === 1 ? 'company' : 'companies'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-3 w-full">
                                      <div className="h-8 w-8 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-center shrink-0">
                                        <FolderTree className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-medium truncate text-foreground">
                                          {result.value}
                                        </span>
                                        <div className="flex items-center justify-between gap-2 w-full">
                                          <span className="text-xs text-muted-foreground">
                                            {result.count} {result.count === 1 ? 'company' : 'companies'}
                                          </span>
                                          {result.sector && (
                                            <span className="text-xs text-muted-foreground italic truncate">
                                              {result.sector}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </>
                  ) : (
                    // Sectors mode - show tabs for sector/subsector
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                        <TabsTrigger value="sector" className="data-[state=active]:bg-muted">
                          Sector
                        </TabsTrigger>
                        <TabsTrigger value="subsector" className="data-[state=active]:bg-muted">
                          Sub-Sector
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="m-0">
                        <CommandList>
                          {!isLoading && currentResults.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                          )}
                          {currentResults.length > 0 && (
                            <CommandGroup>
                              {currentResults.map((result, idx) => {
                                const key = result.type === 'company'
                                  ? `company-${result.id}`
                                  : `${result.type}-${result.value}`;
                                const selected = isSelected(result);

                                return (
                                  <CommandItem
                                    key={key}
                                    value={`${result.type}-${idx}`}
                                    onSelect={() => handleSelect(result)}
                                    className="cursor-pointer data-[selected=true]:bg-muted"
                                  >
                                    {selected && (
                                      <Check className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                    )}
                                    {result.type === 'sector' ? (
                                      <div className="flex items-center gap-3 w-full">
                                        <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                                          <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <span className="text-sm font-medium truncate text-foreground">
                                            {result.value}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {result.count} {result.count === 1 ? 'company' : 'companies'}
                                          </span>
                                        </div>
                                      </div>
                                    ) : result.type === 'subsector' ? (
                                      <div className="flex items-start gap-3 w-full">
                                        <div className="h-8 w-8 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-center shrink-0">
                                          <FolderTree className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <span className="text-sm font-medium truncate text-foreground">
                                            {result.value}
                                          </span>
                                          <div className="flex items-center justify-between gap-2 w-full">
                                            <span className="text-xs text-muted-foreground">
                                              {result.count} {result.count === 1 ? 'company' : 'companies'}
                                            </span>
                                            {result.sector && (
                                              <span className="text-xs text-muted-foreground italic truncate">
                                                {result.sector}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </TabsContent>
                    </Tabs>
                  )}
                </Command>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Items Display */}
      {totalSelected > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Selected:</p>

          <div className="flex flex-wrap gap-2">
            {selections.companies.map(company => (
              <Badge
                key={company.id}
                variant="secondary"
                className="pl-2 pr-1 py-1 bg-background border border-border hover:bg-muted"
              >
                <Check className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-sm">{company.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0.5 hover:bg-transparent"
                  onClick={() => removeCompany(company.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {selections.sectors.map(sector => (
              <Badge
                key={sector.value}
                variant="secondary"
                className="pl-2 pr-1 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Check className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-sm">{sector.value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0.5 hover:bg-transparent"
                  onClick={() => removeSector(sector.value)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {selections.subsectors.map(subsector => (
              <Badge
                key={subsector.value}
                variant="secondary"
                className="pl-2 pr-1 py-1 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900"
              >
                <Check className="mr-1 h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-sm">{subsector.value}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0.5 hover:bg-transparent"
                  onClick={() => removeSubsector(subsector.value)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
