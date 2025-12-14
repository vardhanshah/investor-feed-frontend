# Number Formatting Improvements

## Overview
Enhanced the Query Builder Preview with better number formatting, syntax highlighting, and improved visual presentation.

## Changes Made

### 1. Number Formatting with Thousand Separators

**Before:**
```
Market Cap ≥ 1000 Cr
P/E Ratio ≤ 50.5
```

**After:**
```
Market Cap ≥ 1,000 Cr          ← Comma separator
P/E Ratio ≤ 50.5               ← Decimal preserved
```

**Implementation:**
```typescript
const formatNumber = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
};
```

**Examples:**
- `1000` → `1,000`
- `50000` → `50,000`
- `1000000` → `10,00,000` (Indian numbering system)
- `50.5` → `50.5`
- `100.00` → `100`

### 2. Syntax Highlighting for Operators

**Before (Plain Text):**
```
Market Cap ≥ 1000 Cr AND P/E Ratio ≤ 50
```

**After (Highlighted):**
```
Market Cap ≥ 1,000 Cr [AND] P/E Ratio ≤ 50
                       ↑
              Purple highlight
```

**Features:**
- AND/OR operators in purple (`hsl(280,100%,70%)`)
- Bold font weight for operators
- Proper spacing with margins

### 3. Enhanced Combined Query Preview

**Before:**
```
(Market Cap ≥ 1000 Cr AND P/E Ratio ≤ 50)
  AND
(Growth Related OR Order Information)
```

**After:**
```
Company Filters:                    ← Group label
(Market Cap ≥ 1,000 Cr AND P/E Ratio ≤ 50)

        [AND]                       ← Purple, centered

Post Content Filters:               ← Group label
(Growth Related OR Order Information)
```

**Features:**
- Group labels show context
- AND separator is purple, bold, centered
- Better spacing between groups
- Each group on its own line with visual hierarchy

### 4. Improved Typography

**Changes:**
- `leading-relaxed` - Better line height for readability
- Combined query: `text-sm` (slightly larger) vs `text-xs` in group previews
- Group labels in combined view: `text-xs opacity-70` for subtle hierarchy

### 5. Visual Examples

#### Per-Group Preview
```
┌────────────────────────────────────────────┐
│ Company Filters            [AND LOGIC]     │
├────────────────────────────────────────────┤
│ ✓ Market Cap ≥ [1000] Cr                  │
│ ✓ P/E Ratio ≤ [50.5]                      │
│                                            │
│ ────────────────────────────────────────   │
│ Query Preview:                             │
│ ┌────────────────────────────────────────┐ │
│ │ Market Cap ≥ 1,000 Cr [AND] P/E ≤ 50.5│ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
     ↑                ↑           ↑
  Comma         Purple AND    Decimal preserved
```

#### Combined Query Preview
```
┌─────────────────────────────────────────────┐
│ Combined Feed Query    [Your Filter Logic]  │
├─────────────────────────────────────────────┤
│ Company Filters:                     ← Label│
│ (Market Cap ≥ 1,000 Cr AND P/E ≤ 50.5)     │
│                                             │
│              [AND]                   ← Purple│
│                                             │
│ Post Content Filters:                ← Label│
│ (Growth Related OR Order Information)       │
└─────────────────────────────────────────────┘
```

## Implementation Details

### Number Formatting Function
```typescript
const formatNumber = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  // Format with Indian numbering system (lakhs/crores)
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,  // Show up to 2 decimal places
    minimumFractionDigits: 0,  // Don't force decimals if whole number
  }).format(num);
};
```

### Syntax Highlighting
```tsx
<span className="text-[hsl(280,100%,70%)] font-semibold mx-2">
  AND
</span>
```

### Group Labels in Combined View
```tsx
<div className="text-muted-foreground text-xs mb-1 opacity-70">
  {group.label}:
</div>
```

## Benefits

1. ✅ **Readability** - Numbers easier to parse at a glance
2. ✅ **Professional** - Proper number formatting looks polished
3. ✅ **Clarity** - Syntax highlighting draws attention to logic
4. ✅ **Context** - Group labels show which filters belong where
5. ✅ **Accessibility** - Better spacing and contrast
6. ✅ **International** - Uses Intl API for locale-aware formatting

## Examples with Real Data

### Indian Numbering System
```
Input: 10000000
Output: 1,00,00,000       (1 crore)

Input: 100000
Output: 1,00,000          (1 lakh)

Input: 50000
Output: 50,000
```

### Decimal Handling
```
Input: 50.50
Output: 50.5              (Removes trailing zero)

Input: 50.00
Output: 50                (Removes unnecessary decimals)

Input: 50.555
Output: 50.56             (Rounds to 2 decimals)
```

### Complete Example
```
User Input:
- Market Cap ≥ 10000000
- P/E Ratio ≤ 50.5
- Growth Related: Yes
- Order Information: Yes

Query Preview Output:

Company Filters:
(Market Cap ≥ 1,00,00,000 Cr [AND] P/E Ratio ≤ 50.5)

        [AND]

Post Content Filters:
(Growth Related [OR] Order Information)
```

## Color Scheme

- **Numbers**: Inherit from monospace text color
- **Operators (AND/OR)**: `hsl(280,100%,70%)` (Purple gradient brand color)
- **Group Labels**: Muted with 70% opacity
- **Query Background**: Muted background with rounded corners

## Future Enhancements

Potential additions:
1. Highlight numbers in different color (e.g., cyan/blue)
2. Show actual database field names on hover
3. Copy query to clipboard button
4. Export query as JSON/SQL
5. Collapsible query preview sections
