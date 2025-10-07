import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConfidenceLevel } from '@/types/okr';

export interface StatusBadgeProps {
  status: ConfidenceLevel;
  className?: string;
}

/**
 * StatusBadge component displays the current status of an OKR or Key Result
 * with appropriate color coding and icon.
 *
 * @example
 * <StatusBadge status="on-track" />
 * <StatusBadge status="at-risk" />
 * <StatusBadge status="off-track" />
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    'on-track': {
      icon: CheckCircle2,
      text: 'On Track',
      className: 'text-green-700 bg-green-50 border-green-200',
    },
    'at-risk': {
      icon: AlertCircle,
      text: 'At Risk',
      className: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    'off-track': {
      icon: XCircle,
      text: 'Off Track',
      className: 'text-red-700 bg-red-50 border-red-200',
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'px-3 py-1',
        'text-xs font-medium',
        'border rounded-full',
        'transition-colors duration-200',
        variant.className,
        className
      )}
      role="status"
      aria-label={`Status: ${variant.text}`}
    >
      <Icon size={14} aria-hidden="true" />
      <span>{variant.text}</span>
    </span>
  );
}
