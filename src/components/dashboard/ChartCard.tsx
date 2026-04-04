import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  colSpan?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-primary',
  children,
  colSpan = 'xl:col-span-6',
}) => {
  return (
    <div className={`bg-white p-6 h-full rounded-lg border border-transparent ${colSpan}`}>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
        {Icon && <Icon className={`w-5 h-5 mr-2 ${iconColor}`} />}
        {title}
      </h3>
      {children}
    </div>
  );
};

export default ChartCard;
