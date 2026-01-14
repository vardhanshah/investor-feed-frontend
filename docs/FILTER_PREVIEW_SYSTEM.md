# Filter Preview System - Technical Documentation

This document provides an exhaustive technical reference for the Filter Preview system, covering architecture, components, hooks, business logic, and implementation details.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Core Concepts](#core-concepts)
4. [File Structure](#file-structure)
5. [Hooks](#hooks)
   - [useFilterPreview](#usefilterperview)
   - [useFeedFilters](#usefeedfilters)
6. [Components](#components)
   - [ProfileSelector](#profileselector)
   - [FeedFilterForm](#feedfilterform)
   - [FilterCriteriaSidebar](#filtercriteriasidebar)
   - [ProfileSidebar](#profilesidebar)
   - [SaveAsFeedModal](#saveasfeedmodal)
7. [API Layer](#api-layer)
8. [Filter Types & Operators](#filter-types--operators)
9. [Data Flow](#data-flow)
10. [URL Encoding & Sharing](#url-encoding--sharing)
11. [Business Rules](#business-rules)
12. [State Management](#state-management)

---

## System Overview

The Filter Preview system allows users to:
1. **Filter posts in real-time** by selecting companies, sectors, subsectors, and applying metric-based filters
2. **Preview matching posts** before saving filters as a custom feed
3. **Share filter configurations** via URL query parameters
4. **Save filters as custom feeds** for persistent access

The system operates in a **three-tier filtering architecture**:

| Tier | Description | Examples |
|------|-------------|----------|
| **Scope Selection** | Determines which companies are included | All Companies, specific sectors/subsectors, or individual companies |
| **Company Metric Filters** | Filters companies by their attributes | Market Cap, Revenue, etc. |
| **Post Content Filters** | Filters posts by their content attributes | Growth-related, Order Info, etc. |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              feed.tsx (Page)                             │
│                                                                          │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────────┐  │
│  │ProfileSidebar│    │   Feed Content    │    │FilterCriteriaSidebar │  │
│  │   (Left)     │    │    (Center)       │    │      (Right)         │  │
│  │              │    │                   │    │                      │  │
│  │ Companies/   │    │  PostCard list    │    │  Number filters      │  │
│  │ Sectors/     │    │  (filtered or     │    │  Boolean filters     │  │
│  │ Subsectors   │    │   default feed)   │    │  Group toggles       │  │
│  └──────┬───────┘    └─────────┬─────────┘    └──────────┬───────────┘  │
│         │                      │                         │              │
│         └──────────────────────┼─────────────────────────┘              │
│                                │                                         │
│                    ┌───────────▼───────────┐                            │
│                    │   useFilterPreview()  │                            │
│                    │                       │                            │
│                    │  - Filter configs     │                            │
│                    │  - Search execution   │                            │
│                    │  - URL sync           │                            │
│                    │  - Debouncing         │                            │
│                    └───────────┬───────────┘                            │
│                                │                                         │
│                    ┌───────────▼───────────┐                            │
│                    │    useFeedFilters()   │                            │
│                    │                       │                            │
│                    │  - Filter state       │                            │
│                    │  - Profile selections │                            │
│                    │  - Criteria building  │                            │
│                    │  - Validation         │                            │
│                    └───────────┬───────────┘                            │
│                                │                                         │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
                     ┌───────────▼───────────┐
                     │      API Layer        │
                     │                       │
                     │  filtersApi           │
                     │  postsApi.searchPosts │
                     │  profilesApi          │
                     └───────────────────────┘
```

---

## Core Concepts

### Filter Configuration
Filters are defined server-side and fetched via `filtersApi.getFilterConfig()`. Each filter has:
- `field`: API field name (e.g., `market_cap`, `is_order_information`)
- `label`: Human-readable name
- `type`: `number`, `boolean`, or `string`
- `group`: Group ID for UI organization
- `range`: Min/max values for number filters
- `unit`: Display unit (e.g., "Cr")
- `operators`: Supported operators (`gte`, `lte`, `eq`, etc.)

### Filter Groups
Filters are organized into groups with:
- `group_id`: Unique identifier
- `group_label`: Display name
- `group_operator`: `and` or `or` (how filters within group combine)
- `order`: Display order

### Profile Selections
Three types of selections that define the company scope:
```typescript
interface ProfileSelections {
  companies: { id: number; title: string }[];  // Individual companies
  sectors: { value: string }[];                 // Sector names
  subsectors: { value: string }[];              // Subsector names
}
```

---

## File Structure

```
client/src/
├── hooks/
│   ├── useFilterPreview.ts      # Main orchestration hook
│   └── useFeedFilters.ts        # Filter state management
├── components/
│   ├── ProfileSelector.tsx      # Company/Sector/Subsector selection UI
│   ├── FeedFilterForm.tsx       # Full filter form (for /filters page)
│   └── FilterPreview/
│       ├── index.ts             # Barrel export
│       ├── FilterCriteriaSidebar.tsx  # Right sidebar for filters
│       ├── ProfileSidebar.tsx   # Left sidebar for company selection
│       └── SaveAsFeedModal.tsx  # Modal to save filters as feed
├── lib/
│   ├── api.ts                   # API clients and types
│   └── utils.ts                 # URL encoding utilities
└── pages/
    ├── feed.tsx                 # Main feed page with filter preview
    └── filters.tsx              # Dedicated filter configuration page
```

---

## Hooks

### useFilterPreview

**Location:** `client/src/hooks/useFilterPreview.ts`

The main orchestration hook that combines filter state management with search execution.

#### Responsibilities:
1. Load filter configuration from API on mount
2. Execute debounced searches when filters change
3. Manage search results and pagination
4. Handle URL encoding/decoding for shareable filters
5. Provide quick filter application from post elements

#### Key State:
```typescript
// Filter configuration (from API)
filterConfigs: FilterConfig[]
filterGroups: FilterGroup[]
isLoadingConfig: boolean

// Search results
filteredPosts: Post[]
totalCount: number | undefined
profilesAttributesMetadata: ProfilesAttributesMetadata
postsAttributesMetadata: PostAttributesMetadata
isSearching: boolean
searchError: string | null
hasMore: boolean
```

#### Key Methods:

| Method | Description |
|--------|-------------|
| `executeSearch(offset)` | Execute search with current filters |
| `loadMore()` | Load next page of results |
| `clearFilters()` | Reset all filters to defaults |
| `getSearchCriteria()` | Get current filter criteria object |
| `applyQuickFilter(field, value)` | Apply a single filter (e.g., from post tag click) |
| `applyFromUrlCriteria(encoded)` | Apply filters from URL-encoded string |
| `getUrlEncodedCriteria()` | Get URL-safe encoded filter string |

#### Debouncing:
- Filters are debounced by **500ms** before triggering search
- `isSearching` is set immediately for UI feedback
- Search is skipped if no active filters

#### Auto-search Trigger:
```typescript
// Dependencies that trigger re-search:
[
  feedFilters.filterValues,        // Boolean filter changes
  feedFilters.numberFilterStates,  // Number filter changes
  feedFilters.profileSelections,   // Company/sector selection changes
  filterConfigs,                   // Filter config loaded
  isLoadingConfig,                 // Config loading state
]
```

---

### useFeedFilters

**Location:** `client/src/hooks/useFeedFilters.ts`

Manages filter state and builds filter criteria for API requests.

#### State:
```typescript
feedName: string                              // Feed name (for saving)
feedDescription: string                       // Feed description
filterValues: Record<string, any>             // Boolean filter values
numberFilterStates: Record<string, {          // Number filter values
  from: string;
  to: string;
}>
profileSelections: ProfileSelections          // Company/sector selections
```

#### Key Methods:

| Method | Description |
|--------|-------------|
| `initializeNumberFilters(configs)` | Set up number filter state from config |
| `loadFeedData(feedData, configs)` | Populate state from existing feed |
| `resetFilters(configs)` | Clear all filter values |
| `handleFilterChange(field, value)` | Update boolean filter |
| `handleNumberFilterFromChange(field, value)` | Update number filter min |
| `handleNumberFilterToChange(field, value)` | Update number filter max |
| `buildFilterCriteria(configs)` | Build criteria for saving feed |
| `buildSearchCriteria(configs)` | Build criteria for preview search |
| `hasActiveFilters(configs)` | Check if any filter is active |
| `applyFromCriteria(criteria, configs)` | Apply filters from criteria object |

#### buildSearchCriteria Output:
```typescript
{
  filters: [
    { field: 'sector', operator: 'in', value: ['Finance', 'Tech'] },
    { field: 'market_cap', operator: 'gte', value: 1000 },
    { field: 'market_cap', operator: 'lte', value: 50000 },
    { field: 'is_order_information', operator: 'eq', value: true },
  ],
  profile_ids: [123, 456]  // Only when individual companies selected
}
```

#### Validation:
- Number range validation (min <= max)
- Range boundary validation (value within allowed range)
- Toast notifications for validation errors

---

## Components

### ProfileSelector

**Location:** `client/src/components/ProfileSelector.tsx`

UI component for selecting companies, sectors, and subsectors.

#### Features:
- **Three Scope Modes:**
  - `all`: All companies (no selection UI shown)
  - `sectors`: Filter by sectors/subsectors
  - `companies`: Select specific companies

- **Autocomplete Search:**
  - Debounced search (300ms)
  - API call: `profilesApi.autocomplete(query, limit, type)`
  - Type parameter: `'company'`, `'sector'`, or `'subsector'`

- **Tab Syncing:**
  - `activeTab` state syncs with `scopeMode`
  - When `scopeMode='sectors'` and only subsectors selected → `activeTab='subsector'`
  - Ensures correct API type parameter is used

#### Props:
```typescript
interface ProfileSelectorProps {
  selections: ProfileSelections;
  onSelectionsChange: (selections: ProfileSelections) => void;
}
```

#### Mode Derivation Logic:
```typescript
const derivedMode =
  selections.companies.length > 0 ? 'companies' :
  (selections.sectors.length > 0 || selections.subsectors.length > 0) ? 'sectors' :
  'all';
```

---

### FeedFilterForm

**Location:** `client/src/components/FeedFilterForm.tsx`

Full-featured filter form used on the `/filters` page for creating/editing feeds.

#### Features:
- Feed name and description inputs
- ProfileSelector integration
- Collapsible filter groups
- Number inputs with formatting (Indian number system)
- Query preview showing combined filter logic

#### Props:
```typescript
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
```

#### Number Formatting:
```typescript
// Format for display (adds commas)
formatNumberForInput("1234567") → "12,34,567"

// Parse back to raw value
parseFormattedNumber("12,34,567") → "1234567"
```

---

### FilterCriteriaSidebar

**Location:** `client/src/components/FilterPreview/FilterCriteriaSidebar.tsx`

Right sidebar on the feed page for applying filters.

#### Features:
- Collapsible/expandable on desktop
- Mobile sheet (slides from right)
- Active filter count badge
- Company filters disabled when individual companies selected
- Group-based filter organization

#### Disabling Logic:
```typescript
const hasIndividualCompanies = profileSelections.companies.length > 0;
const isCompanyFiltersGroup = groupIndex === 0;

if (isCompanyFiltersGroup && hasIndividualCompanies) {
  // Show "Company filters disabled" message
}
```

---

### ProfileSidebar

**Location:** `client/src/components/FilterPreview/ProfileSidebar.tsx`

Left sidebar on the feed page for company/sector selection.

#### Features:
- Collapsible/expandable on desktop
- Mobile sheet (slides from left)
- Selection count badge
- Clear all button
- Wraps ProfileSelector component

---

### SaveAsFeedModal

**Location:** `client/src/components/FilterPreview/SaveAsFeedModal.tsx`

Modal dialog for saving current filters as a custom feed.

#### Flow:
1. User clicks "Save as Feed" button
2. Modal opens with name/description inputs
3. User enters details and clicks "Create Feed"
4. `feedConfigApi.createFeedConfiguration()` called
5. On success: modal closes, filters cleared, feed list refreshed

---

## API Layer

**Location:** `client/src/lib/api.ts`

### Filter Configuration API

```typescript
export interface FilterConfig {
  field: string;
  label: string;
  type: 'number' | 'boolean' | 'string';
  description: string;
  group: string;
  range?: { min: number; max: number };
  unit?: string | null;
  operators?: Array<'gte' | 'lte' | 'lt' | 'gt' | 'eq'>;
}

export interface FilterGroup {
  group_id: string;
  group_label: string;
  group_description?: string;
  group_operator: 'and' | 'or';
  order: number;
}

export const filtersApi = {
  async getFilterConfig(): Promise<FilterConfigResponse>
};
```

### Search API

```typescript
postsApi.searchPosts(
  criteria: { filters: FilterValue[]; profile_ids?: number[] },
  limit: number,
  offset: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Promise<SearchResponse>
```

### Autocomplete API

```typescript
profilesApi.autocomplete(
  query: string,
  limit: number,
  type?: 'company' | 'sector' | 'subsector'
): Promise<AutocompleteResult[]>
```

---

## Filter Types & Operators

| Type | Operators | Example |
|------|-----------|---------|
| `number` | `gte`, `lte` | `{ field: 'market_cap', operator: 'gte', value: 1000 }` |
| `boolean` | `eq` | `{ field: 'is_order_information', operator: 'eq', value: true }` |
| `string` | `in` | `{ field: 'sector', operator: 'in', value: ['Finance', 'Tech'] }` |

### Filter Criteria Object Structure:
```typescript
interface FilterCriteria {
  filters: Array<{
    field: string;
    operator: 'gte' | 'lte' | 'eq' | 'in';
    value: any;
  }>;
  profile_ids?: number[];  // Only when individual companies selected
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

---

## Data Flow

### 1. Initial Load
```
Page Mount
    ↓
useFilterPreview() initializes
    ↓
filtersApi.getFilterConfig() called
    ↓
filterConfigs & filterGroups populated
    ↓
useFeedFilters.initializeNumberFilters() called
    ↓
Check URL for ?q= parameter
    ↓
If found: applyFromUrlCriteria()
    ↓
Ready for user interaction
```

### 2. Filter Change Flow
```
User changes filter (boolean, number, or profile selection)
    ↓
useFeedFilters state updates
    ↓
useFilterPreview effect triggered
    ↓
isSearching set to true immediately
    ↓
Debounce timer started (500ms)
    ↓
If no new changes within 500ms:
    ↓
buildSearchCriteria() called
    ↓
postsApi.searchPosts() called
    ↓
filteredPosts updated
    ↓
URL updated via replaceState
    ↓
isSearching set to false
```

### 3. Save as Feed Flow
```
User clicks "Save as Feed"
    ↓
SaveAsFeedModal opens
    ↓
User enters name/description
    ↓
getSearchCriteria() called
    ↓
feedConfigApi.createFeedConfiguration() called
    ↓
On success:
    ↓
Modal closes, filters cleared
    ↓
Feed list refreshed
    ↓
New feed selected
```

---

## URL Encoding & Sharing

**Location:** `client/src/lib/utils.ts`

Filters can be shared via URL query parameter `?q=`.

### Encoding:
```typescript
function encodeFilterCriteria(criteria: object): string {
  const json = JSON.stringify(criteria);
  return btoa(json)
    .replace(/\+/g, '-')    // URL-safe
    .replace(/\//g, '_')    // URL-safe
    .replace(/=+$/, '');    // Remove padding
}
```

### Decoding:
```typescript
function decodeFilterCriteria(encoded: string): object | null {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return JSON.parse(atob(base64));
}
```

### URL Structure:
```
https://investorfeed.in/?q=eyJmaWx0ZXJfY3JpdGVyaWEiOnsifi...
                          ↑
                          Base64-encoded filter payload
```

### Full Payload Structure:
```typescript
{
  filter_criteria: {
    filters: [...],
    profile_ids: [...]
  },
  limit: 20,
  offset: 0,
  sort_by: 'submission_date',
  sort_order: 'desc'
}
```

---

## Business Rules

### 1. Company Filters Disabled Rule
**When individual companies are selected, company metric filters (Market Cap, Revenue, etc.) are disabled.**

Rationale: When filtering to specific companies, metric-based filters are redundant - you've already specified exactly which companies you want.

Implementation:
```typescript
// In FilterCriteriaSidebar and FeedFilterForm:
const hasIndividualCompanies = profileSelections.companies.length > 0;
const isCompanyFiltersGroup = groupIndex === 0;

if (isCompanyFiltersGroup && hasIndividualCompanies) {
  // Show disabled state with explanation
}
```

### 2. Profile Selection Priority
When loading a saved feed:
- `profile_ids` take priority over sector/subsector filters
- If `profile_ids` exist, sectors/subsectors are ignored

```typescript
const hasProfileIds = feedData.filter_criteria.profile_ids?.length > 0;
if (hasProfileIds) {
  // Fetch company details for profile_ids
  // Set companies, clear sectors/subsectors
}
```

### 3. Active Filter Detection
A filter is considered "active" if:
- Any company, sector, or subsector is selected
- Any number filter has a from or to value
- Any boolean filter is set to true

```typescript
function hasActiveFilters(filterConfigs: FilterConfig[]): boolean {
  // Check profile selections
  if (profileSelections.companies.length > 0 ||
      profileSelections.sectors.length > 0 ||
      profileSelections.subsectors.length > 0) return true;

  // Check number filters
  for (const state of Object.values(numberFilterStates)) {
    if (state.from.trim() || state.to.trim()) return true;
  }

  // Check boolean filters
  for (const [field, value] of Object.entries(filterValues)) {
    const config = filterConfigs.find(c => c.field === field);
    if (config?.type === 'boolean' && value === true) return true;
  }

  return false;
}
```

### 4. Number Range Validation
- "From" value must be within allowed range
- "To" value must be within allowed range
- "To" value must be >= "From" value

---

## State Management

### Component Hierarchy:
```
feed.tsx
└── useFilterPreview()
    └── useFeedFilters()
        ├── filterValues (boolean filters)
        ├── numberFilterStates (number filters)
        └── profileSelections (companies/sectors/subsectors)
```

### State Ownership:
| State | Owner | Consumers |
|-------|-------|-----------|
| `filterConfigs` | useFilterPreview | FilterCriteriaSidebar, FeedFilterForm |
| `filterValues` | useFeedFilters | FilterCriteriaSidebar, FeedFilterForm |
| `numberFilterStates` | useFeedFilters | FilterCriteriaSidebar, FeedFilterForm |
| `profileSelections` | useFeedFilters | ProfileSelector, ProfileSidebar |
| `filteredPosts` | useFilterPreview | feed.tsx (PostCard list) |
| `isSearching` | useFilterPreview | FilterCriteriaSidebar, feed.tsx |

### State Persistence:
- **Session Only:** Filter state is not persisted to localStorage
- **URL Sharing:** Filters can be encoded in URL for sharing
- **Feed Saving:** Filters can be saved as a feed configuration via API

---

## Quick Reference

### Adding a New Filter Type
1. Add filter config in backend `/filters/config` endpoint
2. Filter will automatically appear in UI based on `type`
3. For custom rendering, modify `renderFilterInput()` in components

### Debugging Filter Issues
1. Check `filterConfigs` in useFilterPreview - are configs loaded?
2. Check `hasActiveFilters` - is the filter considered active?
3. Check `buildSearchCriteria()` output - is the criteria correct?
4. Check Network tab for `/posts/search` request payload

### Common Patterns

**Applying filter from external source:**
```typescript
filterPreview.applyQuickFilter('sector', 'Finance');
```

**Getting shareable URL:**
```typescript
const encoded = filterPreview.getUrlEncodedCriteria();
const url = `/?q=${encoded}`;
```

**Checking if filters are active:**
```typescript
if (filterPreview.hasActiveFilters) {
  // Show filtered posts
} else {
  // Show default feed
}
```
