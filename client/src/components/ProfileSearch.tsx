import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, Building2, Layers, FolderTree } from 'lucide-react';
import { useLocation } from 'wouter';
import { profilesApi, AutocompleteResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
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

export function ProfileSearch() {
  const [, setLocation] = useLocation();
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
        // Return current state (will be updated by fetchResults)
        return currentFetched;
      }
      return currentFetched;
    });
  }, [debouncedQuery, activeTab, fetchResults]);

  // When tab changes, just update the active tab
  // The useEffect below will handle fetching
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabType);
  }, []);

  // Handle selection of any result type
  const handleSelect = useCallback(
    (result: AutocompleteResult) => {
      setOpen(false);
      setQuery('');
      setResults({ company: [], sector: [], subsector: [] });
      setFetched({ company: false, sector: false, subsector: false });
      // Navigate using the URL provided by the backend
      setLocation(result.url);
    },
    [setLocation]
  );

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const currentResults = results[activeTab];
  const isLoading = loading[activeTab];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Search companies (Cmd+K)"
        >
          <Search className="h-8 w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[520px] p-0"
        align="end"
        sideOffset={8}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, sectors, subsectors..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
            )}
          </div>

          {query.trim() ? (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                <TabsTrigger value="company" className="data-[state=active]:bg-muted">
                  Company
                </TabsTrigger>
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

                        return (
                          <CommandItem
                            key={key}
                            value={`${result.type}-${idx}`}
                            onSelect={() => handleSelect(result)}
                            className="cursor-pointer data-[selected=true]:bg-muted"
                          >
                            {result.type === 'company' ? (
                              // Company result
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
                              // Sector result
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
                              // Subsector result
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
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Type to search companies, sectors, subsectors...
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
