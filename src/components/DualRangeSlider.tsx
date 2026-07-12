import { useCallback, useId } from 'react';
import { useTranslation } from 'react-i18next';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  valueFrom: number;
  valueTo: number;
  onChange: (from: number, to: number) => void;
  label: string;
  formatValue?: (value: number) => string;
  id?: string;
}

export function DualRangeSlider({
  min,
  max,
  step = 1,
  valueFrom,
  valueTo,
  onChange,
  label,
  formatValue = (v) => String(v),
  id,
}: DualRangeSliderProps) {
  const { t } = useTranslation(['a11y', 'common']);
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const fromId = `${baseId}-from`;
  const toId = `${baseId}-to`;

  const range = max - min || 1;
  const fromPercent = ((valueFrom - min) / range) * 100;
  const toPercent = ((valueTo - min) / range) * 100;

  const handleFromChange = useCallback(
    (raw: number) => {
      const next = Math.min(raw, valueTo);
      onChange(next, valueTo);
    },
    [onChange, valueTo],
  );

  const handleToChange = useCallback(
    (raw: number) => {
      const next = Math.max(raw, valueFrom);
      onChange(valueFrom, next);
    },
    [onChange, valueFrom],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span
          className="rounded-md bg-white/5 px-2.5 py-1 text-sm font-medium tabular-nums text-accent"
          aria-live="polite"
        >
          {formatValue(valueFrom)} {t('common:rangeSeparator')}{' '}
          {formatValue(valueTo)}
        </span>
      </div>

      <div className="relative h-8">
        <div className="pointer-events-none absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
          style={{
            left: `${fromPercent}%`,
            width: `${Math.max(0, toPercent - fromPercent)}%`,
          }}
        />

        <label className="sr-only" htmlFor={fromId}>
          {t('a11y:sliderMinimum', { label })}
        </label>
        <input
          id={fromId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueFrom}
          onChange={(e) => handleFromChange(Number(e.target.value))}
          className="dual-range-thumb absolute inset-0 z-20 w-full appearance-none bg-transparent"
          style={{ zIndex: valueFrom > max - (max - min) * 0.1 ? 30 : 20 }}
          aria-valuemin={min}
          aria-valuemax={valueTo}
          aria-valuenow={valueFrom}
          aria-label={t('a11y:sliderFrom', { label })}
        />

        <label className="sr-only" htmlFor={toId}>
          {t('a11y:sliderMaximum', { label })}
        </label>
        <input
          id={toId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueTo}
          onChange={(e) => handleToChange(Number(e.target.value))}
          className="dual-range-thumb absolute inset-0 z-20 w-full appearance-none bg-transparent"
          aria-valuemin={valueFrom}
          aria-valuemax={max}
          aria-valuenow={valueTo}
          aria-label={t('a11y:sliderTo', { label })}
        />
      </div>
    </div>
  );
}
