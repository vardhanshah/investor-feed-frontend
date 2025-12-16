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

export function ProfileSearch() {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch autocomplete results when query changes
  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await profilesApi.autocomplete(debouncedQuery, 10);
        setResults(data);
      } catch (error) {
        console.error('Autocomplete error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery]);

  // Handle selection of any result type (company, sector, subsector)
  const handleSelect = useCallback(
    (result: AutocompleteResult) => {
      setOpen(false);
      setQuery('');
      setResults([]);
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
    };

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Search companies (Cmd+K)"
        >
          <Search className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
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
              placeholder="Search companies, sectors..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
            )}
          </div>
          <CommandList>
            {!isLoading && query.trim() && results.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((result, idx) => {
                  // Generate a unique key based on type and identifier
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
                          <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate text-foreground">
                              {result.value}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {result.count} {result.count === 1 ? 'company' : 'companies'} in sector
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Subsector result
                        <div className="flex items-center gap-3 w-full">
                          <div className="h-8 w-8 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-center">
                            <FolderTree className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate text-foreground">
                              {result.value}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {result.count} {result.count === 1 ? 'company' : 'companies'} in subsector
                            </span>
                          </div>
                        </div>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {!query.trim() && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type to search companies, sectors, subsectors...
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
