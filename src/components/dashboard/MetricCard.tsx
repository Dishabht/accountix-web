import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  gradientFrom: string;
  growth: string;
  growthIcon: LucideIcon;
  growthColor: string;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBg,
  gradientFrom,
  growth,
  growthIcon: GrowthIcon,
  growthColor,
  description,
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${gradientFrom} to-white border border-slate-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm mt-4">
        <span className={`flex items-center gap-1 ${growthColor}`}>
          <GrowthIcon className="w-3.5 h-3.5" />
          {growth}
        </span>
        <span className="text-neutral-500 text-xs">{description}</span>
      </div>
    </div>
  );
};

export default MetricCard;
