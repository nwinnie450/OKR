import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

/**
 * DashboardCard component displays key metrics in a compact, visual format.
 *
 * Features:
 * - Responsive grid layout (2 cols mobile, 4 cols desktop)
 * - Icon support for visual identification
 * - Trend indicators with percentage and direction
 * - Height: 100px mobile, 120px desktop
 *
 * @example
 * <DashboardCard
 *   title="Total OKRs"
 *   value={47}
 *   subtitle="↑12 this quarter"
 *   icon={Target}
 *   trend={{ value: 12, direction: 'up' }}
 * />
 */
export const DashboardCard = React.memo(function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: DashboardCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div
      className={cn(
        'relative',
        'p-4 sm:p-6',
        'bg-white',
        'border border-slate-200',
        'rounded-lg',
        'shadow-sm hover:shadow-md',
        'transition-all duration-200',
        'h-[100px] sm:h-[120px]', // 100px mobile, 120px desktop
        'overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between h-full">
        {/* Content Section */}
        <div className="flex flex-col justify-between h-full flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xs sm:text-sm font-medium text-slate-600 leading-tight truncate">
            {title}
          </h3>

          {/* Value */}
          <div className="my-1">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>

          {/* Subtitle or Trend */}
          <div className="flex items-center gap-2">
            {trend && (
              <div
                className={cn(
                  'inline-flex items-center gap-1',
                  'text-xs font-medium',
                  trendColor
                )}
              >
                <TrendIcon size={14} aria-hidden="true" />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Icon Section */}
        {Icon && (
          <div
            className={cn(
              'flex-shrink-0',
              'w-10 h-10 sm:w-12 sm:h-12',
              'flex items-center justify-center',
              'bg-blue-50',
              'rounded-lg',
              'ml-3'
            )}
            aria-hidden="true"
          >
            <Icon className="text-blue-600" size={20} />
          </div>
        )}
      </div>
    </div>
  );
});
