import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import { AttributeDistribution } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberFilterSliderProps {
  field: string;
  label: string;
  unit?: string | null;
  distribution: AttributeDistribution | null;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  compact?: boolean; // For sidebar view
  className?: string;
}

// Format number with thousand separators (Indian format)
const formatNumber = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1000) {
    if (Math.abs(value) >= 10000000) {
      return (value / 10000000).toFixed(1) + 'Cr';
    } else if (Math.abs(value) >= 100000) {
      return (value / 100000).toFixed(1) + 'L';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
};

// Format for input display
const formatNumberForInput = (value: string): string => {
  if (!value) return '';
  const cleanValue = value.replace(/[^\d.-]/g, '');
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

// Build the full value array: [display_min, ...percentiles, display_max]
function getValueArray(distribution: AttributeDistribution): number[] {
  const { percentiles, display_min, display_max } = distribution;
  const values: number[] = [];

  // Start with display_min if available, otherwise first percentile
  const minVal = display_min !== null ? display_min : percentiles[0];
  values.push(minVal);

  // Add all percentiles (skip if same as min/max)
  for (const p of percentiles) {
    if (p > minVal) values.push(p);
  }

  // End with display_max if available and greater than last value
  const maxVal = display_max !== null ? display_max : percentiles[percentiles.length - 1];
  if (maxVal > values[values.length - 1]) {
    values.push(maxVal);
  }

  return values;
}

// Convert value to slider position (0-100)
// Interpolates across [display_min, percentiles..., display_max]
function valueToSliderPosition(value: number, distribution: AttributeDistribution): number {
  const values = getValueArray(distribution);
  const n = values.length;

  // Clamp to range
  if (value <= values[0]) return 0;
  if (value >= values[n - 1]) return 100;

  // Find which segment the value falls into and interpolate
  for (let i = 0; i < n - 1; i++) {
    if (value >= values[i] && value < values[i + 1]) {
      const ratio = (value - values[i]) / (values[i + 1] - values[i]);
      return (i + ratio) * (100 / (n - 1));
    }
  }

  return 50;
}

// Convert slider position (0-100) to value
// Interpolates across [display_min, percentiles..., display_max]
function sliderPositionToValue(position: number, distribution: AttributeDistribution): number {
  const values = getValueArray(distribution);
  const n = values.length;

  // Clamp position
  if (position <= 0) return values[0];
  if (position >= 100) return values[n - 1];

  // Find index in value array
  const index = position * (n - 1) / 100;
  const lowIndex = Math.floor(index);
  const highIndex = Math.min(lowIndex + 1, n - 1);
  const ratio = index - lowIndex;

  // Interpolate between adjacent values
  return values[lowIndex] + ratio * (values[highIndex] - values[lowIndex]);
}

export function NumberFilterSlider({
  field,
  label,
  unit,
  distribution,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  compact = false,
  className,
}: NumberFilterSliderProps) {
  // Preview values shown during drag (local state, doesn't affect parent)
  const [isDragging, setIsDragging] = useState(false);
  const [previewValues, setPreviewValues] = useState<[number | null, number | null]>([null, null]);

  // Round to whole numbers - no decimal precision needed
  const roundValue = useCallback((v: number) => {
    return Math.round(v);
  }, []);

  // Calculate positions from current values (computed, not state)
  // Using useMemo to avoid recalculating on every render
  const positions = useMemo((): [number, number] => {
    if (!distribution) return [0, 100];

    const fromNum = fromValue ? parseFloat(fromValue) : null;
    const toNum = toValue ? parseFloat(toValue) : null;

    const fromPos = fromNum !== null && !isNaN(fromNum)
      ? valueToSliderPosition(fromNum, distribution)
      : 0;
    const toPos = toNum !== null && !isNaN(toNum)
      ? valueToSliderPosition(toNum, distribution)
      : 100;

    return [fromPos, toPos];
  }, [fromValue, toValue, distribution]);

  // Key for slider to force remount when input values change
  const sliderKey = `${field}-${fromValue}-${toValue}`;

  // Handle continuous slider change (updates preview only)
  const handleSliderChange = useCallback((values: number[]) => {
    if (!distribution) return;

    setIsDragging(true);
    const [fromPos, toPos] = values;

    const fromVal = fromPos > 0.5 ? roundValue(sliderPositionToValue(fromPos, distribution)) : null;
    const toVal = toPos < 99.5 ? roundValue(sliderPositionToValue(toPos, distribution)) : null;

    setPreviewValues([fromVal, toVal]);
  }, [distribution, roundValue]);

  // Handle slider commit (update parent when drag ends)
  const handleSliderCommit = useCallback((values: number[]) => {
    if (!distribution) return;

    setIsDragging(false);
    const [fromPos, toPos] = values;

    // Convert positions to values and update parent
    if (fromPos > 0.5) {
      const newFromValue = sliderPositionToValue(fromPos, distribution);
      onFromChange(roundValue(newFromValue).toString());
    } else {
      onFromChange('');
    }

    if (toPos < 99.5) {
      const newToValue = sliderPositionToValue(toPos, distribution);
      onToChange(roundValue(newToValue).toString());
    } else {
      onToChange('');
    }
  }, [distribution, onFromChange, onToChange, roundValue]);

  // If no distribution, fall back to simple inputs only
  if (!distribution) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label className={cn(
          'font-medium text-foreground block',
          compact ? 'text-xs mb-1.5' : 'text-sm mb-3'
        )}>
          {label}
          {unit && <span className="text-muted-foreground ml-1">({unit})</span>}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder={`Min${unit ? ' (' + unit + ')' : ''}`}
            value={fromValue ? formatNumberForInput(fromValue) : ''}
            onChange={(e) => onFromChange(parseFormattedNumber(e.target.value))}
            className={compact ? 'h-8 text-xs' : 'h-9 text-sm'}
          />
          <Input
            type="text"
            inputMode="numeric"
            placeholder={`Max${unit ? ' (' + unit + ')' : ''}`}
            value={toValue ? formatNumberForInput(toValue) : ''}
            onChange={(e) => onToChange(parseFormattedNumber(e.target.value))}
            className={compact ? 'h-8 text-xs' : 'h-9 text-sm'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      <Label className={cn(
        'font-semibold text-foreground block',
        compact ? 'text-xs' : 'text-sm'
      )}>
        {label}
        {unit && <span className="text-muted-foreground font-normal ml-1">({unit})</span>}
      </Label>

      {/* Continuous Slider */}
      <div className="px-1">
        <SliderPrimitive.Root
          key={sliderKey}
          className="relative flex w-full touch-none select-none items-center"
          defaultValue={positions}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          min={0}
          max={100}
          step={0.1}
          minStepsBetweenThumbs={0.1}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)]" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-[hsl(280,100%,70%)] bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
            aria-label="Minimum value"
          />
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-[hsl(200,100%,70%)] bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
            aria-label="Maximum value"
          />
        </SliderPrimitive.Root>
      </div>

      {/* Value Display and Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder={compact ? 'Min' : 'Min'}
            value={
              isDragging && previewValues[0] !== null
                ? formatNumber(previewValues[0])
                : fromValue ? formatNumberForInput(fromValue) : ''
            }
            onChange={(e) => onFromChange(parseFormattedNumber(e.target.value))}
            readOnly={isDragging}
            className={cn(
              'text-center',
              compact ? 'h-7 text-xs' : 'h-8 text-sm',
              isDragging && 'bg-muted/50'
            )}
          />
        </div>
        <span className="text-muted-foreground text-xs">to</span>
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder={compact ? 'Max' : 'Max'}
            value={
              isDragging && previewValues[1] !== null
                ? formatNumber(previewValues[1])
                : toValue ? formatNumberForInput(toValue) : ''
            }
            onChange={(e) => onToChange(parseFormattedNumber(e.target.value))}
            readOnly={isDragging}
            className={cn(
              'text-center',
              compact ? 'h-7 text-xs' : 'h-8 text-sm',
              isDragging && 'bg-muted/50'
            )}
          />
        </div>
      </div>

      {/* Range Labels */}
      <div className={cn(
        'flex justify-between text-muted-foreground',
        compact ? 'text-[10px]' : 'text-xs'
      )}>
        <span>
          {distribution.display_min !== null
            ? `< ${formatNumber(distribution.display_min, compact)}`
            : 'Min'}
        </span>
        <span>
          {distribution.display_max !== null
            ? `> ${formatNumber(distribution.display_max, compact)}`
            : 'Max'}
        </span>
      </div>
    </div>
  );
}
