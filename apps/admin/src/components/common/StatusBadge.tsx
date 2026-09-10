import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = 'sm' }) => {
  if (!status) return null;

  const getVariant = (s: string) => {
    switch (s.toUpperCase()) {
      // Positive / Verified / Completed
      case 'ACTIVE':
      case 'VERIFIED':
      case 'COMPLETED':
      case 'AVAILABLE':
      case 'FULFILLED':
      case 'DELIVERED':
      case 'PAID':
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      // Processing / Progress / In Transit
      case 'IN_PROGRESS':
      case 'IN_TRANSIT':
      case 'ON_TRIP':
      case 'LOADING':
      case 'PICKED_UP':
      case 'MATCHED':
      case 'FULLY_MATCHED':
      case 'CONFIRMED':
      case 'DRIVER_ASSIGNED':
      case 'ASSIGNED':
      case 'EN_ROUTE':
      case 'ARRIVED':
      case 'ARRIVING':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Pending / Warning / Draft / Matching
      case 'PENDING':
      case 'PENDING_VERIFICATION':
      case 'DRAFT':
      case 'OPEN':
      case 'SUBMITTED':
      case 'MATCHING':
      case 'PARTIALLY_MATCHED':
      case 'RESERVED':
      case 'PICKUP_SCHEDULED':
      case 'PICKUP_IN_PROGRESS':
      case 'SCHEDULED':
      case 'PLANNED':
      case 'ACCEPTED':
      case 'ISSUED':
        return 'bg-amber-50 text-amber-800 border-amber-200';

      // Negative / Cancelled / Rejected / Suspended / Failed
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
      case 'SUSPENDED':
      case 'INACTIVE':
      case 'EXPIRED':
      case 'SOLD':
      case 'OVERDUE':
      case 'CLOSED':
      case 'OFFLINE':
      case 'UNDER_MAINTENANCE':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border capitalize tracking-tight',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        getVariant(status),
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {formatText(status)}
    </span>
  );
};
