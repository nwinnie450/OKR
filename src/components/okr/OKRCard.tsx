import React from 'react';
import { Target, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import type { Objective, ConfidenceLevel } from '@/types/okr';

export interface OKRCardProps {
  objective: Objective;
  expanded?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * OKRCard component displays an objective with expandable key results.
 * Features:
 * - Left border colored by status
 * - Expandable/collapsible content
 * - Hover effects with shadow transition
 * - Mobile-responsive padding
 *
 * @example
 * <OKRCard
 *   objective={objectiveData}
 *   expanded={isExpanded}
 *   onClick={handleToggle}
 * >
 *   <KeyResultsList />
 * </OKRCard>
 */
export const OKRCard = React.memo(function OKRCard({
  objective,
  expanded = false,
  onClick,
  className,
  children,
}: OKRCardProps) {
  // Border color based on status
  const borderColorMap: Record<ConfidenceLevel, string> = {
    'on-track': 'border-l-green-500',
    'at-risk': 'border-l-amber-500',
    'off-track': 'border-l-red-500',
  };

  const borderColor = borderColorMap[objective.confidence];

  // Format time period display
  const timePeriodDisplay = `${objective.timePeriod} ${objective.year}`;

  return (
    <div
      className={cn(
        'group relative',
        'p-4 sm:p-6',
        'bg-white',
        'border-l-4 border border-slate-200',
        borderColor,
        'rounded-lg',
        'shadow',
        'hover:shadow-lg',
        onClick && 'cursor-pointer',
        'transition-all duration-200',
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
      aria-expanded={onClick ? expanded : undefined}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Target
            className="text-blue-600 flex-shrink-0 mt-0.5"
            size={20}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug break-words">
              {objective.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={objective.confidence} />
          {onClick && (
            <button
              className="p-1 rounded-md hover:bg-slate-100 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {expanded ? (
                <ChevronDown size={20} className="text-slate-600" />
              ) : (
                <ChevronRight size={20} className="text-slate-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {objective.description && (
        <p className="text-sm text-slate-600 leading-normal mb-4 ml-8">
          {objective.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="ml-8 mb-4">
        <ProgressBar progress={objective.progress} showPercentage />
      </div>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-2 ml-8 text-xs text-slate-500">
        <span>{timePeriodDisplay}</span>
        <span aria-hidden="true">•</span>
        <span>{objective.keyResultIds.length} Key Result{objective.keyResultIds.length !== 1 ? 's' : ''}</span>
        {objective.type === 'team' && (
          <>
            <span aria-hidden="true">•</span>
            <span className="capitalize">{objective.type}</span>
          </>
        )}
      </div>

      {/* Expandable Content */}
      {expanded && children && (
        <div className="mt-4 pt-4 border-t border-slate-200 ml-8">
          {children}
        </div>
      )}
    </div>
  );
});
