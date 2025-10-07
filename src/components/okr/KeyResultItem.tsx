import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import type { KeyResult } from '@/types/okr';

export interface KeyResultItemProps {
  keyResult: KeyResult;
  ownerName?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * KeyResultItem component displays a single key result with progress tracking.
 * Features:
 * - Compact design optimized for mobile
 * - Shows title, owner, progress, and current/target values
 * - Click interaction for progress updates
 * - Metric formatting based on type
 *
 * @example
 * <KeyResultItem
 *   keyResult={keyResultData}
 *   ownerName="Sarah Chen"
 *   onClick={handleUpdateProgress}
 * />
 */
export function KeyResultItem({
  keyResult,
  ownerName,
  onClick,
  className,
}: KeyResultItemProps) {
  // Format value based on metric type
  const formatValue = (value: number): string => {
    switch (keyResult.metricType) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'boolean':
        return value > 0 ? 'Completed' : 'Not Started';
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const currentValueFormatted = formatValue(keyResult.currentValue);
  const targetValueFormatted = formatValue(keyResult.targetValue);

  return (
    <div
      className={cn(
        'group',
        'p-3 sm:p-4',
        'bg-slate-50 hover:bg-white',
        'border border-slate-200',
        'rounded-md',
        onClick && 'cursor-pointer',
        'transition-all duration-200',
        onClick && 'hover:shadow-md hover:border-blue-300',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Title */}
      <div className="mb-2">
        <h4 className="text-sm sm:text-base font-medium text-slate-900 leading-snug">
          {keyResult.title}
        </h4>
      </div>

      {/* Owner */}
      {ownerName && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-600">
          <User size={12} aria-hidden="true" />
          <span>{ownerName}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <ProgressBar progress={keyResult.progress} showPercentage />
      </div>

      {/* Current/Target Values */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Current:</span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {currentValueFormatted}
            {keyResult.unit && ` ${keyResult.unit}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Target:</span>
          <span className="font-semibold text-slate-900 tabular-nums">
            {targetValueFormatted}
            {keyResult.unit && ` ${keyResult.unit}`}
          </span>
        </div>
      </div>

      {/* Last Check-in Indicator */}
      {keyResult.lastCheckinAt && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Last updated: {new Date(keyResult.lastCheckinAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Click hint on hover */}
      {onClick && (
        <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to update progress →
        </div>
      )}
    </div>
  );
}
