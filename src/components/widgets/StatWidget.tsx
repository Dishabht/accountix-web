import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatWidgetProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  gradientFrom: string;
  trend: string;
  trendIcon: LucideIcon;
  trendColor: string;
  description: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  icon: Icon,
  iconBg,
  gradientFrom,
  trend,
  trendIcon: TrendIcon,
  trendColor,
  description,
}) => {
  return (
    <article
      className={`rounded-md border border-slate-200 bg-gradient-to-r ${gradientFrom} to-white p-0 shadow-none dark:border-slate-700 dark:to-slate-700`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{title}</p>
          <h4 className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{value}</h4>
        </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`flex items-center gap-1 font-medium ${trendColor} dark:${trendColor}`.replace('dark:text', 'dark:text')}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend}
          </span>
          <span className="text-[13px] text-neutral-500 dark:text-neutral-400">{description}</span>
        </div>
      </div>
    </article>
  );
};

export default StatWidget;
