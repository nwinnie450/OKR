import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  valueClassName?: string;
  status?: 'on-track' | 'at-risk' | 'off-track';
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  className,
  showValue = true,
  valueClassName,
  status = 'on-track',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const statusColors = {
    'on-track': 'text-green-600',
    'at-risk': 'text-amber-600',
    'off-track': 'text-red-600',
  };

  const statusStrokes = {
    'on-track': 'stroke-green-500',
    'at-risk': 'stroke-amber-500',
    'off-track': 'stroke-red-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-slate-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn('fill-none transition-all duration-500 ease-out', statusStrokes[status])}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-bold', statusColors[status], valueClassName)}>
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default CircularProgress;
