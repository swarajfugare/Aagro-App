import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive?: boolean;
  };
  accentColor?: string;
  className?: string;
  extra?: ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  trend,
  className,
  extra,
}) => {
  const displayText = subtitle || description;
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow relative overflow-hidden',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{value}</h3>
          {displayText && <p className="text-xs text-slate-500 mt-1">{displayText}</p>}
          {trend && (
            <div className="flex items-center mt-2 text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {typeof trend.value === 'number' ? `+${trend.value}%` : trend.value}
              </span>
              <span className="text-slate-400 ml-1.5">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-forest/10 text-forest border border-forest/10">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {extra && <div className="mt-4 pt-3 border-t border-slate-100">{extra}</div>}
    </div>
  );
};
