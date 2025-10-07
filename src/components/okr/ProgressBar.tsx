import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types/okr';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * ProgressBar component displays a linear progress indicator with automatic
 * color coding based on progress value.
 *
 * Colors:
 * - 0-50%: Red (off-track)
 * - 51-75%: Amber (at-risk)
 * - 76-100%: Green (on-track)
 *
 * @example
 * <ProgressBar progress={75} label="Progress" showPercentage />
 * <ProgressBar progress={45} />
 */
export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Auto-calculate status based on progress
  const getStatus = (value: number): ConfidenceLevel => {
    if (value >= 76) return 'on-track';
    if (value >= 51) return 'at-risk';
    return 'off-track';
  };

  const status = getStatus(clampedProgress);

  // Color mapping based on status
  const colorMap = {
    'on-track': 'bg-green-500',
    'at-risk': 'bg-amber-500',
    'off-track': 'bg-red-500',
  };

  const progressColor = colorMap[status];

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="font-medium text-slate-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-slate-600 tabular-nums">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full bg-slate-100 rounded-full overflow-hidden',
          'h-2 md:h-2.5' // 8px mobile, 10px desktop
        )}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${clampedProgress}%`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            progressColor
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
